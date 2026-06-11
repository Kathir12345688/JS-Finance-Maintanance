from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('customer', 'worker', 'amount_paid', 'payment_mode', 'created_at')
    list_filter = ('payment_mode',)
    search_fields = ('customer__name', 'worker__username')
