from rest_framework import serializers

from .models import Payment, PaymentEditLog


class PaymentEditLogSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    edited_by_name = serializers.CharField(source='edited_by.name', read_only=True)

    class Meta:
        model = PaymentEditLog
        fields = ['id', 'previous_amount', 'new_amount', 'edited_by', 'edited_by_name', 'edited_at', 'note']
        read_only_fields = ['edited_by', 'edited_at']


class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    edit_history = PaymentEditLogSerializer(source='edit_logs', many=True, read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'customer',
            'customer_name',
            'worker',
            'amount_paid',
            'payment_mode',
            'payment_date',
            'payment_time',
            'remarks',
            'receipt_number',
            'created_at',
            'edit_history',
        ]
        read_only_fields = ['worker', 'created_at', 'receipt_number', 'edit_history']
