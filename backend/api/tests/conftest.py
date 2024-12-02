import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from api.models import Email

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user():
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )
    return user

@pytest.fixture
def authenticated_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client

@pytest.fixture
def sample_email(test_user):
    email = Email.objects.create(
        sender_domain='example.com',
        subject='Test Email',
        content='This is a test email content.',
        urls=['example.com (1 link)', 'test.com (2 links)'],
        votes_phishing=0,
        votes_legitimate=0,
        user=test_user
    )
    return email
