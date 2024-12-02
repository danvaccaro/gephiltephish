import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import User
from api.models import Email, Vote

pytestmark = pytest.mark.django_db

class TestEmailViews:
    def test_list_emails(self, authenticated_client):
        url = reverse('get_emails')
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list)

    def test_create_email(self, authenticated_client):
        url = reverse('submit')
        data = {
            'sender_domain': 'test.com',
            'subject': 'New Test Email',
            'content': 'This is a test email content',
            'urls': ['test.com (1 link)', 'example.com (2 links)'],
            'date': '2024-01-01'  # Added required date field
        }
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert Email.objects.count() == 1
        assert Email.objects.first().subject == 'New Test Email'

    def test_retrieve_email(self, authenticated_client, sample_email):
        url = reverse('get_emails')  # We'll filter by ID in the query params
        response = authenticated_client.get(f"{url}?id={sample_email.id}")
        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]['subject'] == sample_email.subject

    def test_delete_own_email(self, authenticated_client, sample_email):
        url = reverse('delete_email', args=[sample_email.id])
        response = authenticated_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Email.objects.filter(id=sample_email.id).exists()

    def test_cannot_delete_others_email(self, api_client, sample_email):
        # Create another user and authenticate as them
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123'
        )
        api_client.force_authenticate(user=other_user)
        
        url = reverse('delete_email', args=[sample_email.id])
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Email.objects.filter(id=sample_email.id).exists()

    def test_vote_on_email(self, authenticated_client, sample_email):
        url = reverse('vote')
        
        # Test phishing vote
        response = authenticated_client.post(url, {
            'email_id': sample_email.id,
            'is_phishing': True
        }, format='json')
        assert response.status_code == status.HTTP_200_OK
        sample_email.refresh_from_db()
        assert sample_email.votes_phishing == 1
        assert Vote.objects.filter(
            email=sample_email,
            user=authenticated_client.handler._force_user,
            is_phishing=True
        ).exists()

        # Test changing vote to legitimate
        response = authenticated_client.post(url, {
            'email_id': sample_email.id,
            'is_phishing': False
        }, format='json')
        assert response.status_code == status.HTTP_200_OK
        sample_email.refresh_from_db()
        assert sample_email.votes_phishing == 0
        assert sample_email.votes_legitimate == 1
        assert Vote.objects.filter(
            email=sample_email,
            user=authenticated_client.handler._force_user,
            is_phishing=False
        ).exists()

    def test_email_list_filters(self, authenticated_client, sample_email):
        # Create additional test emails with date field
        Email.objects.create(
            sender_domain='phishing.com',
            subject='Phishing Email',
            content='This is a phishing email',
            urls=['phishing.com (1 link)'],
            votes_phishing=5,
            votes_legitimate=0,
            user=authenticated_client.handler._force_user,
            date='2024-01-01'  # Added required date field
        )
        
        # Test filtering by domain
        url = reverse('get_emails') + '?domain=example.com'
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['sender_domain'] == 'example.com'

        # Test filtering by high phishing votes
        url = reverse('get_emails') + '?min_phishing_votes=3'
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['votes_phishing'] >= 3
