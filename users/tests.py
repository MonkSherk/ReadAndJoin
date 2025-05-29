from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User

class UsersFlowTest(APITestCase):
    def test_register_confirm_login(self):
        # Регистрация
        url = reverse('register')
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'strongpass123',
            'password_confirm': 'strongpass123'
        }
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='testuser')
        self.assertFalse(user.is_active)

        # Подтверждение email
        url = reverse('confirm_email')
        res = self.client.post(url, {
            'email': 'test@example.com',
            'confirmation_code': user.confirmation_code
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_active)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

        # Логин
        url = reverse('login')
        res = self.client.post(url, {
            'username': 'testuser',
            'password': 'strongpass123'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
