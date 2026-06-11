from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


class UserTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_login_endpoint_available(self):
        response = self.client.post(reverse('token_obtain_pair'), {'username': 'test', 'password': 'pass'})
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST])
