from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Email
from .serializers import EmailSerializer
from .ml_utils import redact_pii, predict_phishing
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit(request):
    try:
        # Handle JSON data
        data = request.data
        sender_domain = data.get("sender_domain")
        date = data.get("date")
        subject = data.get("subject")
        content = data.get("content")
        urls = data.get("urls", [])  # Get URLs from request data, default to empty list

        # Validate data
        if not sender_domain or not content or not subject or not date:
            return Response({"error": "sender_domain, content, subject, and date are required"},
                          status=status.HTTP_400_BAD_REQUEST)

        # Redact PII from the email
        redacted_subject = redact_pii(subject)
        redacted_content = redact_pii(content)

        # Save the email to the database
        try:
            email = Email.objects.create(
                user=request.user,
                sender_domain=sender_domain,
                subject=redacted_subject,
                date=date,
                content=redacted_content,
                urls=urls,  # Save URLs to the database
                created_at=timezone.now(),
                votes_phishing=0,
                votes_legitimate=0
            )
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Serialize and return the created email
        serializer = EmailSerializer(email)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict(request):
    try:
        data = request.data
        sender = data.get('sender_domain', '')
        subject = data.get('subject', '')
        content = data.get('content', '')

        # Use the prediction function from ml_utils
        is_phishing = predict_phishing(sender, subject, content)
        
        # Return simple yes/no response
        return Response({'phishy': 'yes' if is_phishing else 'no'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
