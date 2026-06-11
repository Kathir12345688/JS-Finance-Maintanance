from django import forms
from django.contrib import admin
from django.forms.widgets import ClearableFileInput
from django.utils.html import format_html

from .models import Customer, Location


class CustomerAdminForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = '__all__'
        widgets = {
            'photo': ClearableFileInput(attrs={'accept': 'image/*', 'capture': 'camera'}),
        }


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'state')
    search_fields = ('name',)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    form = CustomerAdminForm
    readonly_fields = ('photo_preview', 'outstanding_amount', 'last_payment_date')
    list_display = ('name', 'phone', 'location', 'latitude', 'longitude', 'collection_type', 'assigned_worker', 'current_balance', 'outstanding_amount', 'last_payment_date', 'is_active')
    list_filter = ('collection_type', 'is_active')
    search_fields = ('name', 'phone', 'location__name')

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="max-height:150px;" />', obj.photo.url)
        return '-'
    photo_preview.short_description = 'Photo Preview'

    class Media:
        js = ('customers/js/customer_admin.js',)
