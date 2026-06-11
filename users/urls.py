from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, UsernameTokenObtainPairView

urlpatterns = [
    path('login/', UsernameTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
