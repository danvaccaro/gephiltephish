from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSerializer, RegisterSerializer
from .models import Email, Vote
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.db import models
import json
import re
import logging
import os
from openai import OpenAI
from django.db.models import Case, When, Value, BooleanField

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key='your-api-key-here')  # Replace with your actual API key

def process_text(text):
    # process the text to remove non-alphanumeric characters and convert to lowercase
    processed_text = text.lower()
    processed_text = ''.join(char for char in processed_text if char.isalnum() or char.isspace())
    return processed_text

def redact_pii(text: str) -> str:
    # Redact email addresses
    res = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[REDACTED_EMAIL]', text, flags=re.IGNORECASE)
    
    # Redact phone numbers
    res = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[REDACTED_PHONE]', res)
    
    # Redact credit card numbers
    res = re.sub(r'\b\d{4}[-.]?\d{4}[-.]?\d{4}[-.]?\d{4}\b', '[REDACTED_CC]', res)
    
    # Redact SSNs
    res = re.sub(r'\b\d{3}[-.]?\d{2}[-.]?\d{4}\b', '[REDACTED_SSN]', res)
    
    return res

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Please provide both username and password'},
                      status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if not user:
        return Response({'error': 'Invalid credentials'},
                      status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user_id': user.id,
        'username': user.username
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'},
                      status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)},
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                created_at=timezone.now(),
                votes_phishing=0,
                votes_legitimate=0
            )
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Return a success message
        return Response({
            "message": "Email submitted successfully.",
            "email_id": email.id,
            "email_sender_domain": email.sender_domain,
            "email_subject": email.subject,
            "email_content": email.content
        }, status=status.HTTP_201_CREATED)

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

        # Combine all text fields
        full_text = f"Sender Domain: {sender}\nSubject: {subject}\nContent: {content}"
        
        # System prompt for phishing detection
        system_prompt = """You are a cybersecurity expert specializing in phishing email detection. 
        Analyze the provided email and determine if it's a phishing attempt. 
        Consider sender domain legitimacy, urgency tactics, suspicious links, and grammatical errors. 
        Respond with only 'yes' if it's phishing or 'no' if it's legitimate."""

        # Make API call to OpenAI
        response = client.chat.completions.create(
            model="gpt-4",  # or gpt-3.5-turbo
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": full_text}
            ],
            temperature=0.3,  # Lower temperature for more consistent results
            max_tokens=10  # We only need a short response
        )
        
        # Extract the prediction
        prediction = response.choices[0].message.content.strip().lower()
        is_phishing = prediction == 'yes'
        
        # Return prediction
        return Response({'phishy': 'yes' if is_phishing else 'no'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_emails(request):
    # Get all emails and annotate with user's vote status
    emails = Email.objects.all().annotate(
        user_vote=Case(
            When(vote__user=request.user, then=Value(True)),
            default=Value(False),
            output_field=BooleanField(),
        ),
        user_vote_type=Case(
            When(vote__user=request.user, vote__is_phishing=True, then=Value('phishing')),
            When(vote__user=request.user, vote__is_phishing=False, then=Value('legitimate')),
            default=Value(None),
            output_field=models.CharField(),
        )
    ).values(
        'id', 
        'sender_domain', 
        'subject', 
        'content', 
        'votes_phishing', 
        'votes_legitimate',
        'user_vote',
        'user_vote_type'
    )
    return Response(list(emails))

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote(request):
    logger.info(f"Received vote request from user: {request.user.username}")
    
    try:
        data = request.data
        email_id = data.get('email_id')
        is_phishing = data.get('is_phishing')  # true for phishing, false for legitimate
        
        logger.info(f"Email ID: {email_id}, Is Phishing: {is_phishing}")
        
        # Ensure required data is provided
        if email_id is None or is_phishing is None:
            logger.error("Missing data")
            return Response({'error': 'Missing data'},
                          status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the email object
            email = Email.objects.get(id=email_id)
            logger.info(f"Found email: {email}")

        except Email.DoesNotExist:
            logger.error(f"Email not found: {email_id}")
            return Response({'error': 'Email not found'},
                          status=status.HTTP_404_NOT_FOUND)

        # Check if user has already voted
        existing_vote = Vote.objects.filter(user=request.user, email=email).first()
        if existing_vote:
            # If the vote type is the same, return an error
            if existing_vote.is_phishing == is_phishing:
                return Response({'error': 'You have already voted this way for this email'},
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Decrement the old vote count
            if existing_vote.is_phishing:
                email.votes_phishing = max(0, email.votes_phishing - 1)
            else:
                email.votes_legitimate = max(0, email.votes_legitimate - 1)
            
            # Update the vote
            existing_vote.is_phishing = is_phishing
            existing_vote.save()
        else:
            # Create new vote
            Vote.objects.create(
                user=request.user,
                email=email,
                is_phishing=is_phishing
            )

        # Update vote counts
        if is_phishing:
            email.votes_phishing += 1
        else:
            email.votes_legitimate += 1
        email.save()

        logger.info(f"Updated email votes: Phishing: {email.votes_phishing}, Legitimate: {email.votes_legitimate}")

        return Response({
            'message': 'Vote recorded successfully',
            'votes_phishing': email.votes_phishing,
            'votes_legitimate': email.votes_legitimate
        })
    
    except Exception as e:
        logger.error(f"Unexpected error in vote function: {str(e)}", exc_info=True)
        return Response({'error': 'An unexpected error occurred'},
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)
