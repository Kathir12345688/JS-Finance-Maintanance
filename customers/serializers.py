from decimal import Decimal
from rest_framework import serializers
from django.db.models import Sum

from .models import Customer, Location


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'state', 'district', 'area']


class CustomerSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        source='location',
        queryset=Location.objects.all(),
        allow_null=True,
        required=False,
    )
    state = serializers.CharField(write_only=True, required=False, allow_blank=True, default='Tamil Nadu')
    district = serializers.CharField(write_only=True, required=False, allow_blank=True, default='Coimbatore')
    area = serializers.CharField(write_only=True, required=False, allow_blank=True)
    total_amount_paid = serializers.SerializerMethodField()
    expected_collection_amount = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.name', read_only=True)
    assigned_worker_name = serializers.CharField(source='assigned_worker.name', read_only=True)
    due_amount = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'phone',
            'address',
            'location',
            'location_id',
            'state',
            'district',
            'area',
            'latitude',
            'longitude',
            'photo',
            'collection_type',
            'daily_collection_amount',
            'weekly_collection_amount',
            'assigned_worker',
            'opening_balance',
            'current_balance',
            'outstanding_amount',
            'status',
            'is_deleted',
            'loan_date',
            'last_payment_date',
            'due_amount',
            'total_amount_paid',
            'expected_collection_amount',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'assigned_worker_name',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'current_balance',
            'created_at',
            'updated_at',
            'is_deleted',
            'created_by',
            'updated_by',
            'created_by_name',
            'updated_by_name',
            'assigned_worker_name',
            'total_amount_paid',
            'expected_collection_amount',
        ]

    def _build_location(self, attrs):
        location_data = {
            'state': attrs.pop('state', 'Tamil Nadu'),
            'district': attrs.pop('district', 'Coimbatore'),
            'area': attrs.pop('area', ''),
        }
        if location_data['area'] or location_data['district'] or location_data['state']:
            location, _ = Location.objects.get_or_create(
                state=location_data['state'] or 'Tamil Nadu',
                district=location_data['district'] or 'Coimbatore',
                area=location_data['area'] or '',
            )
            return location
        return None

    def _ensure_expected_collection_amounts(self, validated_data, instance=None):
        opening_balance = Decimal(
            validated_data.get('opening_balance', instance.opening_balance if instance else 0) or 0
        )
        collection_type = validated_data.get(
            'collection_type', instance.collection_type if instance else None
        )

        if collection_type == Customer.COLLECTION_TYPE_DAILY:
            validated_data['daily_collection_amount'] = opening_balance / Decimal('100')
            validated_data['weekly_collection_amount'] = Decimal('0')
        elif collection_type == Customer.COLLECTION_TYPE_WEEKLY:
            validated_data['weekly_collection_amount'] = opening_balance / Decimal('10')
            validated_data['daily_collection_amount'] = Decimal('0')

        return validated_data

    def create(self, validated_data):
        if 'location' not in validated_data:
            location = self._build_location(validated_data)
            if location:
                validated_data['location'] = location

        validated_data.setdefault('current_balance', validated_data.get('opening_balance', 0))
        validated_data = self._ensure_expected_collection_amounts(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'location' not in validated_data:
            location = self._build_location(validated_data)
            if location:
                validated_data['location'] = location

        validated_data = self._ensure_expected_collection_amounts(validated_data, instance=instance)
        return super().update(instance, validated_data)

    def get_total_amount_paid(self, obj):
        from payments.models import Payment
        total = Payment.objects.filter(customer=obj).aggregate(total=Sum('amount_paid'))['total']
        return total or 0

    def get_expected_collection_amount(self, obj):
        return obj.expected_amount_for_period()
    
    def get_due_amount(self, obj):
        _, due_amount = obj.get_current_due()
        return float(due_amount)
