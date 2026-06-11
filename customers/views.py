import logging

from rest_framework import filters, permissions, viewsets

from .models import Customer, Location
from .serializers import CustomerSerializer, LocationSerializer

logger = logging.getLogger(__name__)


class IsCustomerEditable(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['owner', 'worker']

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'owner':
            return True
        return obj.assigned_worker_id == request.user.id


class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsCustomerEditable]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'phone', 'location__name']
    ordering_fields = ['created_at', 'current_balance']

    def get_queryset(self):
        queryset = Customer.objects.all().order_by('-created_at')
        status = self.request.query_params.get('status')
        collection_type = self.request.query_params.get('collection_type')
        if status:
            if status.lower() == 'active':
                queryset = queryset.filter(is_active=True)
            elif status.lower() == 'closed':
                queryset = queryset.filter(is_active=False)
        if collection_type:
            queryset = queryset.filter(collection_type__iexact=collection_type)
        return queryset

    def perform_create(self, serializer):
        logger.debug(
            'Customer create request by user=%s payload=%s',
            self.request.user,
            serializer.validated_data,
        )
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
