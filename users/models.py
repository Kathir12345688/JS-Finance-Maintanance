from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_OWNER = 'owner'
    ROLE_WORKER = 'worker'

    ROLE_CHOICES = [
        (ROLE_OWNER, 'Owner'),
        (ROLE_WORKER, 'Worker'),
    ]

    name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_WORKER)

    REQUIRED_FIELDS = ['email']

    def save(self, *args, **kwargs):
        if not self.name:
            full_name = ' '.join(filter(None, [self.first_name, self.last_name]))
            self.name = full_name.strip()
        super().save(*args, **kwargs)

    def is_owner(self):
        return self.role == self.ROLE_OWNER

    def is_worker(self):
        return self.role == self.ROLE_WORKER


class PhoneOTP(models.Model):
    phone = models.CharField(max_length=20)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        from django.utils import timezone
        from datetime import timedelta
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.phone} - {self.code}'
