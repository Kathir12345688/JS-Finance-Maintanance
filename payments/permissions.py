from django.db.models import Q
from rest_framework import permissions


class PaymentPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['owner', 'worker']

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'owner':
            return True

        # Workers can view payments for their assigned customers
        if request.method in permissions.SAFE_METHODS:
            return obj.customer.assigned_worker_id == request.user.id or obj.worker_id == request.user.id

        # Workers can edit only their own payment entries
        if request.method in ['PUT', 'PATCH']:
            return obj.worker_id == request.user.id

        # Workers cannot delete
        return False
