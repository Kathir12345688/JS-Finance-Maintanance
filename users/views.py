from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ChangePasswordSerializer,
    RegisterSerializer,
    UserCreateSerializer,
    UserProfileSerializer,
    UserSerializer,
    UsernameTokenObtainPairSerializer,
)
from .permissions import IsOwner
from .models import PhoneOTP
from .sms import send_otp_sms
from rest_framework_simplejwt.tokens import RefreshToken
import random
from django.utils import timezone

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'User registered successfully.'}, status=status.HTTP_201_CREATED)


class UsernameTokenObtainPairView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsernameTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class RequestPasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        if not phone:
            return Response({'detail': 'Phone number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.filter(phone=phone).first()
            if not user:
                return Response({'detail': 'No user with that phone number.'}, status=status.HTTP_400_BAD_REQUEST)

            code = f"{random.randint(100000, 999999)}"
            otp = PhoneOTP.objects.create(phone=phone, code=code)
            try:
                send_otp_sms(phone, code)
            except Exception:
                # In development send_otp_sms may log the code; still return success to client
                pass

            return Response({'detail': 'OTP sent to your phone.'})
        except Exception as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone')
        code = request.data.get('code')
        password = request.data.get('password')

        if not phone or not code or not password:
            return Response({'detail': 'phone, code and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_qs = PhoneOTP.objects.filter(phone=phone, code=code, is_used=False, expires_at__gt=timezone.now()).order_by('-created_at')
        otp = otp_qs.first()
        if not otp:
            return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(phone=phone).first()
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        otp.is_used = True
        otp.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('id')
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset

    def get_permissions(self):
        if self.action in ['profile', 'update_profile', 'change_password']:
            return [IsAuthenticated()]
        return [IsOwner()]

    def get_serializer_class(self):
        if self.action in ['create', 'create_worker']:
            return UserCreateSerializer
        if self.action in ['profile', 'update_profile']:
            return UserProfileSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        payload = request.data.copy()
        if 'role' not in payload:
            payload['role'] = User.ROLE_WORKER
        serializer = UserCreateSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsOwner])
    def create_worker(self, request):
        payload = request.data.copy()
        payload['role'] = User.ROLE_WORKER
        serializer = UserCreateSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': ['Old password is not correct.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsOwner])
    def workers(self, request):
        workers = User.objects.filter(role=User.ROLE_WORKER)
        serializer = UserSerializer(workers, many=True)
        return Response(serializer.data)
