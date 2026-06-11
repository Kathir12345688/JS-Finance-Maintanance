from django.conf import settings
from django.db import models
from django.utils import timezone
from decimal import Decimal
from django.db import transaction

from customers.models import Customer


def default_payment_time():
    return timezone.localtime().time()


class Payment(models.Model):
    METHOD_CASH = 'cash'
    METHOD_GPAY = 'gpay'
    METHOD_PHONEPE = 'phonepe'

    PAYMENT_CHOICES = [
        (METHOD_CASH, 'Cash'),
        (METHOD_GPAY, 'GPay'),
        (METHOD_PHONEPE, 'PhonePe'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='payments')
    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField(default=timezone.localdate)
    payment_time = models.TimeField(default=default_payment_time)
    payment_mode = models.CharField(max_length=10, choices=PAYMENT_CHOICES)
    remarks = models.TextField(blank=True)
    receipt_number = models.CharField(max_length=32, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_receipt_number(self):
        year = self.payment_date.year if self.payment_date else timezone.localdate().year
        prefix = f'RCPT-{year}-'
        latest = Payment.objects.filter(receipt_number__startswith=prefix).order_by('-receipt_number').first()
        if latest and latest.receipt_number:
            try:
                number = int(latest.receipt_number.split('-')[-1]) + 1
            except Exception:
                number = 1
        else:
            number = 1
        return f'{prefix}{number:06d}'

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = self.generate_receipt_number()
        is_new = self.pk is None
        # capture old amount for edits
        old_amount = None
        if not is_new:
            try:
                old = Payment.objects.get(pk=self.pk)
                old_amount = old.amount_paid
            except Payment.DoesNotExist:
                old_amount = None

        with transaction.atomic():
            # For new payments, first apply missed collections to outstanding
            if is_new:
                # ensure fresh customer data
                customer = Customer.objects.select_for_update().get(pk=self.customer.pk)
                customer.apply_missed_collections(up_to_date=self.payment_date)

                # apply payment to outstanding first
                remaining = Decimal(self.amount_paid)
                if customer.outstanding_amount and customer.outstanding_amount > 0:
                    apply_to_outstanding = min(remaining, Decimal(customer.outstanding_amount))
                    customer.outstanding_amount = Decimal(customer.outstanding_amount) - apply_to_outstanding
                    remaining -= apply_to_outstanding

                # reduce current balance by full payment amount
                customer.current_balance = Decimal(customer.current_balance) - Decimal(self.amount_paid)
                # update last payment date
                customer.last_payment_date = self.payment_date
                customer.save()

                super().save(*args, **kwargs)
                return

            # editing existing payment: adjust customer balances by delta
            super().save(*args, **kwargs)
            if old_amount is not None and old_amount != self.amount_paid:
                delta = Decimal(self.amount_paid) - Decimal(old_amount)
                customer = Customer.objects.select_for_update().get(pk=self.customer.pk)
                # if more paid, reduce outstanding first
                if delta > 0 and customer.outstanding_amount and customer.outstanding_amount > 0:
                    apply_to_outstanding = min(Decimal(customer.outstanding_amount), delta)
                    customer.outstanding_amount = Decimal(customer.outstanding_amount) - apply_to_outstanding
                    delta -= apply_to_outstanding
                elif delta < 0:
                    # decreased payment, increase outstanding by the shortfall
                    customer.outstanding_amount = Decimal(customer.outstanding_amount) + (abs(delta))

                # adjust current balance by delta
                customer.current_balance = Decimal(customer.current_balance) - delta
                # update last payment date if this payment_date is the latest
                if not customer.last_payment_date or self.payment_date > customer.last_payment_date:
                    customer.last_payment_date = self.payment_date

                customer.save()
                # record edit log
                try:
                    PaymentEditLog.objects.create(
                        payment=self,
                        edited_by=getattr(self, '_edited_by', None),
                        previous_amount=old_amount,
                        new_amount=self.amount_paid,
                    )
                except Exception:
                    # avoid failing save due to logging issues
                    pass

    def __str__(self):
        return f'{self.customer.name} - {self.amount_paid} via {self.payment_mode}'


class PaymentEditLog(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='edit_logs')
    edited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    previous_amount = models.DecimalField(max_digits=12, decimal_places=2)
    new_amount = models.DecimalField(max_digits=12, decimal_places=2)
    edited_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f'Edit {self.payment_id} at {self.edited_at}'
