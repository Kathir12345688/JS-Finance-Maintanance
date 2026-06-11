from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.http import HttpResponse
from django.utils import timezone
from zoneinfo import ZoneInfo
from decimal import Decimal
import csv

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from customers.models import Customer
from payments.models import Payment
from .serializers import ReportFilterSerializer

User = get_user_model()


class OwnerReportPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'


class ReportBaseView(APIView):
    permission_classes = [OwnerReportPermission]

    def parse_filters(self, request):
        serializer = ReportFilterSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    def format_inr(self, value):
        try:
            amt = Decimal(value or 0)
        except Exception:
            return '₹0.00'

        sign = '-' if amt < 0 else ''
        amt = abs(amt)
        q = int(amt)
        dec = int((amt - q) * 100)
        s = str(q)
        if len(s) > 3:
            head = s[:-3]
            tail = s[-3:]
            head_groups = []
            while len(head) > 2:
                head_groups.insert(0, head[-2:])
                head = head[:-2]
            if head:
                head_groups.insert(0, head)
            s = ','.join(head_groups) + ',' + tail
        return f"{sign}₹{s}.{dec:02d}"

    def payment_queryset(self, filters):
        payments = Payment.objects.all()
        if filters.get('worker_id'):
            payments = payments.filter(worker_id=filters['worker_id'])
        if filters.get('collection_type'):
            payments = payments.filter(customer__collection_type=filters['collection_type'])
        if filters.get('start_date'):
            payments = payments.filter(payment_date__gte=filters['start_date'])
        if filters.get('end_date'):
            payments = payments.filter(payment_date__lte=filters['end_date'])
        return payments

    def customer_queryset(self, filters):
        customers = Customer.objects.filter(is_active=True)
        if filters.get('worker_id'):
            customers = customers.filter(assigned_worker_id=filters['worker_id'])
        if filters.get('collection_type'):
            customers = customers.filter(collection_type=filters['collection_type'])
        return customers

    def parse_date_range(self, filters, default_start, default_end):
        start_date = filters.get('start_date') or default_start
        end_date = filters.get('end_date') or default_end
        return start_date, end_date


class DailyReportView(ReportBaseView):
    def get(self, request):
        today = timezone.localdate()
        filters = self.parse_filters(request)
        filters.setdefault('start_date', today)
        filters.setdefault('end_date', today)

        payments = self.payment_queryset(filters)
        total = payments.aggregate(total=Sum('amount_paid'))['total'] or 0
        cash_total = payments.filter(payment_mode=Payment.METHOD_CASH).aggregate(total=Sum('amount_paid'))['total'] or 0
        gpay_total = payments.filter(payment_mode=Payment.METHOD_GPAY).aggregate(total=Sum('amount_paid'))['total'] or 0
        phonepe_total = payments.filter(payment_mode=Payment.METHOD_PHONEPE).aggregate(total=Sum('amount_paid'))['total'] or 0

        worker_collections = list(
            payments.values('worker_id', 'worker__name', 'worker__username')
            .annotate(total=Sum('amount_paid'))
            .order_by('-total')
        )
        customer_collections = list(
            payments.values('customer_id', 'customer__name')
            .annotate(total=Sum('amount_paid'))
            .order_by('-total')
        )

        return Response({
            'start_date': str(filters['start_date']),
            'end_date': str(filters['end_date']),
            'total_collection': float(total),
            'cash_collection': float(cash_total),
            'gpay_collection': float(gpay_total),
            'phonepe_collection': float(phonepe_total),
            'worker_collections': [
                {
                    'worker_id': item['worker_id'],
                    'worker_name': item.get('worker__name') or item.get('worker__username'),
                    'amount_collected': float(item['total']),
                }
                for item in worker_collections
            ],
            'customer_collections': [
                {
                    'customer_id': item['customer_id'],
                    'customer_name': item['customer__name'],
                    'amount_collected': float(item['total']),
                }
                for item in customer_collections
            ],
        }, status=status.HTTP_200_OK)


class WeeklyReportView(ReportBaseView):
    def get(self, request):
        today = timezone.localdate()
        default_start = today - timedelta(days=6)
        filters = self.parse_filters(request)
        filters.setdefault('start_date', default_start)
        filters.setdefault('end_date', today)

        payments = self.payment_queryset(filters)
        total = payments.aggregate(total=Sum('amount_paid'))['total'] or 0

        worker_performance = list(
            payments.values('worker_id', 'worker__name', 'worker__username')
            .annotate(total=Sum('amount_paid'))
            .order_by('-total')
        )
        daily_customer = list(
            payments.values('payment_date', 'customer_id', 'customer__name')
            .annotate(total=Sum('amount_paid'))
            .order_by('payment_date')
        )
        weekly_customer = list(
            payments.values('customer_id', 'customer__name')
            .annotate(total=Sum('amount_paid'))
            .order_by('-total')
        )
        customers_with_outstanding = self.customer_queryset(filters).filter(outstanding_amount__gt=0).values(
            'id', 'name', 'outstanding_amount', 'collection_type', 'current_balance'
        )

        return Response({
            'start_date': str(filters['start_date']),
            'end_date': str(filters['end_date']),
            'weekly_total_collection': float(total),
            'worker_performance': [
                {
                    'worker_id': item['worker_id'],
                    'worker_name': item.get('worker__name') or item.get('worker__username'),
                    'amount_collected': float(item['total']),
                }
                for item in worker_performance
            ],
            'daily_customer_collections': [
                {
                    'payment_date': str(item['payment_date']),
                    'customer_id': item['customer_id'],
                    'customer_name': item['customer__name'],
                    'amount_collected': float(item['total']),
                }
                for item in daily_customer
            ],
            'weekly_customer_collections': [
                {
                    'customer_id': item['customer_id'],
                    'customer_name': item['customer__name'],
                    'amount_collected': float(item['total']),
                }
                for item in weekly_customer
            ],
            'outstanding_collections': [
                {
                    'customer_id': item['id'],
                    'customer_name': item['name'],
                    'outstanding_amount': float(item['outstanding_amount']),
                    'collection_type': item['collection_type'],
                    'current_balance': float(item['current_balance']),
                }
                for item in customers_with_outstanding
            ],
        }, status=status.HTTP_200_OK)


class MonthlyReportView(ReportBaseView):
    def get(self, request):
        today = timezone.localdate()
        default_start = today - timedelta(days=29)
        filters = self.parse_filters(request)
        filters.setdefault('start_date', default_start)
        filters.setdefault('end_date', today)

        payments = self.payment_queryset(filters)
        total = payments.aggregate(total=Sum('amount_paid'))['total'] or 0
        cash_total = payments.filter(payment_mode=Payment.METHOD_CASH).aggregate(total=Sum('amount_paid'))['total'] or 0
        gpay_total = payments.filter(payment_mode=Payment.METHOD_GPAY).aggregate(total=Sum('amount_paid'))['total'] or 0
        phonepe_total = payments.filter(payment_mode=Payment.METHOD_PHONEPE).aggregate(total=Sum('amount_paid'))['total'] or 0
        outstanding_total = self.customer_queryset(filters).aggregate(total=Sum('outstanding_amount'))['total'] or 0

        top_worker = (
            payments.values('worker_id', 'worker__name', 'worker__username')
            .annotate(total=Sum('amount_paid'))
            .order_by('-total')
            .first()
        )

        return Response({
            'start_date': str(filters['start_date']),
            'end_date': str(filters['end_date']),
            'monthly_total_collection': float(total),
            'cash_summary': float(cash_total),
            'gpay_summary': float(gpay_total),
            'phonepe_summary': float(phonepe_total),
            'outstanding_balance_summary': float(outstanding_total),
            'top_performing_worker': {
                'worker_id': top_worker['worker_id'] if top_worker else None,
                'worker_name': top_worker.get('worker__name') or top_worker.get('worker__username') if top_worker else None,
                'amount_collected': float(top_worker['total']) if top_worker else 0,
            } if top_worker else None,
        }, status=status.HTTP_200_OK)


class OutstandingReportView(ReportBaseView):
    def get(self, request):
        filters = self.parse_filters(request)

        customers = self.customer_queryset(filters)
        outstanding_customers = customers.filter(outstanding_amount__gt=0).values(
            'id', 'name', 'outstanding_amount', 'collection_type', 'current_balance'
        )

        today = timezone.localdate()
        daily_due = []
        weekly_due = []
        for customer in customers:
            last = customer.last_payment_date or (customer.created_at.date() if customer.created_at else None)
            if not last:
                continue
            days_since = (today - last).days
            if customer.collection_type == Customer.COLLECTION_TYPE_DAILY and days_since >= 1:
                daily_due.append({'id': customer.id, 'name': customer.name, 'outstanding_amount': float(customer.outstanding_amount)})
            if customer.collection_type == Customer.COLLECTION_TYPE_WEEKLY and days_since >= 7:
                weekly_due.append({'id': customer.id, 'name': customer.name, 'outstanding_amount': float(customer.outstanding_amount)})

        total_outstanding = outstanding_customers.aggregate(total=Sum('outstanding_amount'))['total'] or 0 if hasattr(outstanding_customers, 'aggregate') else 0

        return Response({
            'customers_with_outstanding': [
                {
                    'customer_id': item['id'],
                    'customer_name': item['name'],
                    'outstanding_amount': float(item['outstanding_amount']),
                    'collection_type': item['collection_type'],
                    'current_balance': float(item['current_balance']),
                }
                for item in outstanding_customers
            ],
            'daily_customers_due': daily_due,
            'weekly_customers_due': weekly_due,
            'total_outstanding_amount': float(total_outstanding),
        }, status=status.HTTP_200_OK)


class WorkerReportView(ReportBaseView):
    def get(self, request):
        filters = self.parse_filters(request)
        start_date, end_date = self.parse_date_range(filters, timezone.localdate() - timedelta(days=29), timezone.localdate())

        workers = User.objects.filter(role='worker')
        if filters.get('worker_id'):
            workers = workers.filter(id=filters['worker_id'])

        results = []
        for worker in workers:
            assigned_customers = Customer.objects.filter(assigned_worker=worker)
            amount_collected = Payment.objects.filter(
                worker=worker,
                payment_date__gte=start_date,
                payment_date__lte=end_date,
            ).aggregate(total=Sum('amount_paid'))['total'] or 0

            outstanding_collection = assigned_customers.aggregate(total=Sum('outstanding_amount'))['total'] or 0
            expected_amount = Decimal('0')
            period_days = (end_date - start_date).days + 1
            for customer in assigned_customers:
                if customer.collection_type == Customer.COLLECTION_TYPE_DAILY:
                    expected_amount += Decimal(customer.daily_collection_amount or 0) * Decimal(period_days)
                else:
                    weeks = max(1, (period_days + 6) // 7)
                    expected_amount += Decimal(customer.weekly_collection_amount or 0) * Decimal(weeks)

            performance = 0
            if expected_amount > 0:
                performance = (Decimal(amount_collected) / expected_amount) * 100

            results.append({
                'worker_id': worker.id,
                'worker_name': worker.name or worker.username,
                'customers_assigned': assigned_customers.count(),
                'amount_collected': float(amount_collected),
                'outstanding_collection': float(outstanding_collection),
                'collection_performance': f"{performance:.1f}%",
            })

        return Response({
            'start_date': str(start_date),
            'end_date': str(end_date),
            'workers': results,
        }, status=status.HTTP_200_OK)


class DashboardSummaryView(ReportBaseView):
    def get(self, request):
        filters = self.parse_filters(request)
        payments = self.payment_queryset(filters)
        customers = self.customer_queryset(filters)

        total_collection = payments.aggregate(total=Sum('amount_paid'))['total'] or 0
        total_outstanding = customers.aggregate(total=Sum('outstanding_amount'))['total'] or 0
        total_current_balance = customers.aggregate(total=Sum('current_balance'))['total'] or 0
        daily_customers = customers.filter(collection_type=Customer.COLLECTION_TYPE_DAILY).count()
        weekly_customers = customers.filter(collection_type=Customer.COLLECTION_TYPE_WEEKLY).count()
        active_customers = customers.filter(is_active=True).count()
        active_workers = User.objects.filter(role='worker').count()

        today = timezone.localdate()
        todays_collection = payments.filter(payment_date=today).aggregate(total=Sum('amount_paid'))['total'] or 0
        last_30_days = today - timedelta(days=29)
        monthly_collection = payments.filter(payment_date__gte=last_30_days, payment_date__lte=today).aggregate(total=Sum('amount_paid'))['total'] or 0

        recent_payments = payments.order_by('-payment_date', '-payment_time')[:10]
        recent_customers = customers.order_by('-updated_at')[:10]

        return Response({
            'total_collection': float(total_collection),
            'total_outstanding': float(total_outstanding),
            'total_current_balance': float(total_current_balance),
            'daily_customers': daily_customers,
            'weekly_customers': weekly_customers,
            'todays_collection': float(todays_collection),
            'monthly_collection': float(monthly_collection),
            'active_customers': active_customers,
            'active_workers': active_workers,
            'recent_payments': [
                {
                    'payment_id': payment.id,
                    'customer_id': payment.customer_id,
                    'customer_name': payment.customer.name,
                    'worker_id': payment.worker_id,
                    'worker_name': payment.worker.name if payment.worker else None,
                    'amount_paid': float(payment.amount_paid),
                    'payment_date': str(payment.payment_date),
                    'payment_time': str(payment.payment_time),
                    'receipt_number': payment.receipt_number,
                }
                for payment in recent_payments
            ],
            'recent_customers': [
                {
                    'customer_id': customer.id,
                    'customer_name': customer.name,
                    'outstanding_amount': float(customer.outstanding_amount),
                    'current_balance': float(customer.current_balance),
                    'collection_type': customer.collection_type,
                }
                for customer in recent_customers
            ],
        }, status=status.HTTP_200_OK)


class NotificationsReportView(ReportBaseView):
    def get(self, request):
        filters = self.parse_filters(request)
        today = timezone.localdate()
        customers = self.customer_queryset(filters)

        overdue_daily = []
        overdue_weekly = []
        outstanding_list = []

        for customer in customers:
            if customer.outstanding_amount > 0:
                outstanding_list.append({
                    'customer_id': customer.id,
                    'customer_name': customer.name,
                    'outstanding_amount': float(customer.outstanding_amount),
                    'collection_type': customer.collection_type,
                })

            last_payment = customer.last_payment_date or (customer.created_at.date() if customer.created_at else None)
            if last_payment is None:
                continue

            days_since = (today - last_payment).days
            if customer.collection_type == Customer.COLLECTION_TYPE_DAILY and days_since >= 1:
                overdue_daily.append({
                    'customer_id': customer.id,
                    'customer_name': customer.name,
                    'days_overdue': days_since,
                    'outstanding_amount': float(customer.outstanding_amount),
                })
            if customer.collection_type == Customer.COLLECTION_TYPE_WEEKLY and days_since >= 7:
                overdue_weekly.append({
                    'customer_id': customer.id,
                    'customer_name': customer.name,
                    'days_overdue': days_since,
                    'outstanding_amount': float(customer.outstanding_amount),
                })

        return Response({
            'outstanding_customers': outstanding_list,
            'daily_overdue_customers': overdue_daily,
            'weekly_overdue_customers': overdue_weekly,
        }, status=status.HTTP_200_OK)


class ExportReportView(ReportBaseView):
    def get(self, request, report_type):
        filters = self.parse_filters(request)
        export_format = request.query_params.get('format', 'csv').lower()

        report_map = {
            'daily': DailyReportView,
            'weekly': WeeklyReportView,
            'monthly': MonthlyReportView,
            'outstanding': OutstandingReportView,
            'dashboard': DashboardSummaryView,
            'workers': WorkerReportView,
        }

        view_class = report_map.get(report_type)
        if not view_class:
            return Response({'detail': 'Unsupported report type.'}, status=status.HTTP_400_BAD_REQUEST)

        view_instance = view_class()
        response = view_instance.get(request)

        if export_format == 'json':
            return Response(response.data, status=response.status_code)

        if export_format != 'csv':
            return Response({'detail': 'Unsupported export format. Use csv or json.'}, status=status.HTTP_400_BAD_REQUEST)

        rows = []
        headers = []
        data = response.data

        if report_type == 'dashboard':
            rows = [
                ['metric', 'value'],
                ['total_collection', data.get('total_collection')],
                ['total_outstanding', data.get('total_outstanding')],
                ['active_customers', data.get('active_customers')],
                ['active_workers', data.get('active_workers')],
            ]
        elif report_type == 'outstanding':
            headers = ['customer_id', 'customer_name', 'outstanding_amount', 'collection_type', 'current_balance']
            rows = [headers] + [
                [
                    item['customer_id'],
                    item['customer_name'],
                    item['outstanding_amount'],
                    item['collection_type'],
                    item['current_balance'],
                ]
                for item in data.get('customers_with_outstanding', [])
            ]
        elif report_type == 'workers':
            headers = ['worker_id', 'worker_name', 'customers_assigned', 'amount_collected', 'outstanding_collection', 'collection_performance']
            rows = [headers] + [
                [
                    item['worker_id'],
                    item['worker_name'],
                    item['customers_assigned'],
                    item['amount_collected'],
                    item['outstanding_collection'],
                    item['collection_performance'],
                ]
                for item in data.get('workers', [])
            ]
        else:
            # fallback for summary-style reports
            rows = [[key, value] for key, value in data.items() if not isinstance(value, (list, dict))]
            rows.insert(0, ['metric', 'value'])

        if not headers and len(rows) > 0:
            headers = rows[0]

        csv_content = []
        output = []
        for row in rows:
            output.append(','.join(str(value) for value in row))

        csv_data = '\n'.join(output)
        filename = f"{report_type}_report.csv"
        return HttpResponse(
            csv_data,
            content_type='text/csv',
            headers={'Content-Disposition': f'attachment; filename="{filename}"'},
        )
