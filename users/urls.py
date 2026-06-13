from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    UsernameTokenObtainPairView,
    RequestPasswordResetView,
    VerifyOTPResetView,
)

urlpatterns = [
    path('login/', UsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    path('request-reset/', RequestPasswordResetView.as_view(), name='request_password_reset'),
    path('verify-otp/', VerifyOTPResetView.as_view(), name='verify_otp_reset'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
