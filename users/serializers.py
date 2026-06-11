from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
import random
from .models import User
from django.utils import timezone
from datetime import timedelta


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    phone = serializers.CharField()
    role = serializers.ChoiceField(choices=[(User.ROLE_OWNER, 'Owner'), (User.ROLE_WORKER, 'Worker')], default=User.ROLE_WORKER, required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        phone = attrs.get('phone')
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({'username': 'Username already registered'})
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError({'phone': 'Phone number already registered'})
        return attrs

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            name=validated_data['username'],
            phone=validated_data['phone'],
            role=validated_data.get('role', User.ROLE_WORKER),
            is_active=True,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UsernameTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError({'non_field_errors': ['Wrong username or password']})
        if not user.is_active:
            raise serializers.ValidationError({'non_field_errors': ['User inactive']})

        token = TokenObtainPairSerializer.get_token(user)
        return {
            'refresh': str(token),
            'access': str(token.access_token),
            'user': UserSerializer(user).data,
        }

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'username',
            'email',
            'phone',
            'role',
            'is_active',
            'status',
            'date_joined',
        ]
        read_only_fields = ['id', 'role', 'status', 'date_joined']

    def get_status(self, obj):
        return 'Active' if obj.is_active else 'Inactive'


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'username', 'email', 'phone', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False},
        }

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'username', 'email', 'role']
        read_only_fields = ['id', 'role']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_new_password(self, value):
        validate_password(value, self.context.get('request').user)
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        token['name'] = user.name
        return token
