from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from customers.models import Customer
from .models import Payment
from .serializers import PaymentSerializer
from .permissions import PaymentPermission


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [PaymentPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'owner':
            return Payment.objects.all().order_by('-created_at')
        return Payment.objects.filter(
            Q(worker=user) | Q(customer__assigned_worker=user)
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(worker=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance is not None:
            instance._edited_by = self.request.user
        serializer.save()

    @action(detail=False, methods=['get'])
    def history(self, request):
        return self.list(request)

    @action(detail=False, methods=['get'])
    def outstanding_customers(self, request):
        customers = Customer.objects.filter(outstanding_amount__gt=0)
        if request.user.role == 'worker':
            customers = customers.filter(assigned_worker=request.user)
        data = customers.values('id', 'name', 'outstanding_amount', 'collection_type', 'current_balance')
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def daily_due_customers(self, request):
        today = timezone.localdate()
        customers = Customer.objects.filter(collection_type=Customer.COLLECTION_TYPE_DAILY, is_active=True)
        if request.user.role == 'worker':
            customers = customers.filter(assigned_worker=request.user)

        due = []
        for customer in customers:
            due_periods, due_amount = customer.get_current_due(today)
            if due_amount > 0:
                due.append({
                    'id': customer.id,
                    'name': customer.name,
                    'phone': customer.phone,
                    'daily_collection_amount': float(customer.daily_collection_amount),
                    'current_balance': float(customer.current_balance),
                    'outstanding_amount': float(customer.outstanding_amount),
                    'is_active': customer.is_active,
                    'assigned_worker_name': customer.assigned_worker.name if customer.assigned_worker else None,
                    'assigned_worker_id': customer.assigned_worker.id if customer.assigned_worker else None,
                    'due_periods': due_periods,
                    'due_amount': float(due_amount),
                    'last_payment_date': customer.last_payment_date,
                })
        return Response(due, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def weekly_due_customers(self, request):
        today = timezone.localdate()
        customers = Customer.objects.filter(collection_type=Customer.COLLECTION_TYPE_WEEKLY, is_active=True)
        if request.user.role == 'worker':
            customers = customers.filter(assigned_worker=request.user)

        due = []
        for customer in customers:
            due_periods, due_amount = customer.get_current_due(today)
            if due_amount > 0:
                due.append({
                    'id': customer.id,
                    'name': customer.name,
                    'phone': customer.phone,
                    'weekly_collection_amount': float(customer.weekly_collection_amount),
                    'current_balance': float(customer.current_balance),
                    'outstanding_amount': float(customer.outstanding_amount),
                    'is_active': customer.is_active,
                    'assigned_worker_name': customer.assigned_worker.name if customer.assigned_worker else None,
                    'assigned_worker_id': customer.assigned_worker.id if customer.assigned_worker else None,
                    'due_periods': due_periods,
                    'due_amount': float(due_amount),
                    'last_payment_date': customer.last_payment_date,
                })
        return Response(due, status=status.HTTP_200_OK)
