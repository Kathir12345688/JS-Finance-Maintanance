from django.conf import settings
from django.db import models
from django.utils import timezone
from decimal import Decimal


class CustomerQuerySet(models.QuerySet):
    def delete(self):
        return super().update(is_deleted=True)

    def alive(self):
        return self.filter(is_deleted=False)


class CustomerManager(models.Manager):
    def get_queryset(self):
        return CustomerQuerySet(self.model, using=self._db).filter(is_deleted=False)


class Location(models.Model):
    name = models.CharField(max_length=255, blank=True)
    state = models.CharField(max_length=100, default='Tamil Nadu')
    district = models.CharField(max_length=100, default='Coimbatore')
    area = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Location'
        verbose_name_plural = 'Locations'
        ordering = ['state', 'district', 'area']

    def save(self, *args, **kwargs):
        name_parts = [self.area.strip() if self.area else None, self.district.strip() if self.district else None]
        self.name = ', '.join([part for part in name_parts if part])
        super().save(*args, **kwargs)

    def __str__(self):
        if self.area:
            return f'{self.area}, {self.district}, {self.state}'
        return f'{self.district}, {self.state}'


class Customer(models.Model):
    COLLECTION_TYPE_DAILY = 'daily'
    COLLECTION_TYPE_WEEKLY = 'weekly'

    COLLECTION_TYPE_CHOICES = [
        (COLLECTION_TYPE_DAILY, 'Daily'),
        (COLLECTION_TYPE_WEEKLY, 'Weekly'),
    ]

    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    address = models.CharField(max_length=255, blank=True)
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customers',
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    photo = models.ImageField(upload_to='customer_photos/', null=True, blank=True)
    collection_type = models.CharField(max_length=10, choices=COLLECTION_TYPE_CHOICES)
    assigned_worker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customers',
    )
    status = models.CharField(max_length=10, choices=[('active', 'Active'), ('closed', 'Closed')], default='active')
    is_deleted = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_customers',
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_customers',
    )
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    # Collection schedule and outstanding management
    daily_collection_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    weekly_collection_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    outstanding_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    loan_date = models.DateField(null=True, blank=True)
    last_payment_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomerManager()
    all_objects = models.Manager()

    def update_status_from_balance(self):
        if self.current_balance <= 0 and not self.is_deleted:
            self.status = 'closed'
            self.is_active = False
        elif self.current_balance > 0 and self.status == 'closed':
            self.status = 'active'
            self.is_active = True

    def apply_expected_collection_formula(self):
        opening = Decimal(self.opening_balance or 0)
        if self.collection_type == self.COLLECTION_TYPE_DAILY:
            self.daily_collection_amount = opening / Decimal('100')
            self.weekly_collection_amount = Decimal('0')
        else:
            self.weekly_collection_amount = opening / Decimal('10')
            self.daily_collection_amount = Decimal('0')

    def save(self, *args, **kwargs):
        previous_opening = None
        if self.pk:
            previous = Customer.all_objects.filter(pk=self.pk).first()
            if previous:
                previous_opening = previous.opening_balance

        if not self.pk or self.current_balance == 0 or (
            previous_opening is not None
            and self.opening_balance != previous_opening
            and self.current_balance == previous_opening
        ):
            self.current_balance = self.opening_balance

        self.apply_expected_collection_formula()
        self.update_status_from_balance()
        super().save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        self.is_deleted = True
        self.save(update_fields=['is_deleted'])

    def expected_amount_for_period(self):
        if self.collection_type == self.COLLECTION_TYPE_DAILY:
            return Decimal(self.daily_collection_amount or 0)
        return Decimal(self.weekly_collection_amount or 0)

    def compute_missed_periods(self, up_to_date=None):
        """Return (missed_count, missed_amount) since last_payment_date (or created_at) up to up_to_date."""
        if up_to_date is None:
            up_to_date = timezone.localdate()

        last_date = self.last_payment_date or (self.created_at.date() if self.created_at else None)
        if not last_date:
            return 0, Decimal('0')

        days_since = (up_to_date - last_date).days
        if days_since <= 0:
            return 0, Decimal('0')

        if self.collection_type == self.COLLECTION_TYPE_DAILY:
            missed = max(0, days_since - 1)
            amount = Decimal(missed) * Decimal(self.daily_collection_amount or 0)
            return missed, amount

        # weekly
        weeks_since = days_since // 7
        missed = max(0, weeks_since - 1)
        amount = Decimal(missed) * Decimal(self.weekly_collection_amount or 0)
        return missed, amount

    def get_current_due(self, up_to_date=None):
        """Return number of due periods and due amount from last payment/start date."""
        if up_to_date is None:
            up_to_date = timezone.localdate()

        last_date = self.last_payment_date or (self.created_at.date() if self.created_at else None)
        if not last_date:
            return 0, Decimal('0')

        days_since = (up_to_date - last_date).days
        if days_since <= 0:
            return 0, Decimal('0')

        if self.collection_type == self.COLLECTION_TYPE_DAILY:
            due_periods = days_since
            amount = Decimal(due_periods) * Decimal(self.daily_collection_amount or 0)
            return due_periods, amount

        # weekly
        if days_since < 7:
            return 0, Decimal('0')

        due_periods = 1 + ((days_since - 7) // 7)
        amount = Decimal(due_periods) * Decimal(self.weekly_collection_amount or 0)
        return due_periods, amount

    def apply_missed_collections(self, up_to_date=None):
        missed, amount = self.compute_missed_periods(up_to_date=up_to_date)
        if amount > 0:
            self.outstanding_amount = (Decimal(self.outstanding_amount or 0) + amount)
            self.save()
        return missed, amount

    def __str__(self):
        return f'{self.name} ({self.collection_type})'
