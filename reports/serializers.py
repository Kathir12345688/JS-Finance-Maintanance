from rest_framework import serializers

from customers.models import Customer


class ReportFilterSerializer(serializers.Serializer):
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    worker_id = serializers.IntegerField(required=False)
    collection_type = serializers.ChoiceField(choices=Customer.COLLECTION_TYPE_CHOICES, required=False)


class WorkerReportSerializer(serializers.Serializer):
    worker_id = serializers.IntegerField()
    worker_name = serializers.CharField()
    customers_assigned = serializers.IntegerField()
    amount_collected = serializers.DecimalField(max_digits=14, decimal_places=2)
    outstanding_collection = serializers.DecimalField(max_digits=14, decimal_places=2)
    collection_performance = serializers.CharField()
