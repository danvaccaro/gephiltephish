from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from .models import Email
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
import json
import re
import logging
import pickle
import os
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LinearRegression

logger = logging.getLogger(__name__)

# Fetch a user (hardcoded for now, replace with actual user later)
user = User.objects.first()  # Replace with the logged-in user

# Load the model and vectorizer
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'model.pkl')
vectorizer_path = os.path.join(current_dir, 'vectorizer.pkl')

with open(model_path, 'rb') as model_file:
    model = pickle.load(model_file)

with open(vectorizer_path, 'rb') as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

def process_text(text):
    # process the text to remove non-alphanumeric characters,
    # convert to lowercase, and remove stopwords
    processed_text = text.lower()
    processed_text = ''.join(char for char in processed_text if char.isalnum() or char.isspace())
    # Note: stopwords removal is omitted as it requires additional setup
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

@csrf_exempt
def submit(request):
    if request.method == "POST":
        try:
            # Check if the request is an AJAX call
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                # Handle JSON data
                try:
                    data = json.loads(request.body)
                    sender = data.get("sender")
                    subject = data.get("subject")
                    body = data.get("body")
                except json.JSONDecodeError:
                    return JsonResponse({"error": "Invalid JSON"}, status=400)
            else:
                # Handle form data (both application/x-www-form-urlencoded and multipart/form-data)
                sender = request.POST.get("sender")
                subject = request.POST.get("subject")
                body = request.POST.get("body")

            # Validate data
            if not sender or not body or not subject:
                return JsonResponse({"error": "Sender, body, and subject are required"}, status=400)

            # Redact PII from the email
            redacted_subject = redact_pii(subject)
            redacted_body = redact_pii(body)

            # Save the email to the database
            try:
                email = Email.objects.create(
                    user=user,
                    sender=sender,
                    subject=redacted_subject,
                    body=redacted_body,
                    created_at=timezone.now(),
                    votes_phishing=0,
                    votes_legitimate=0
                )
            except ValidationError as e:
                return JsonResponse({"error": str(e)}, status=400)

            # Return a success message
            return JsonResponse({
                "message": "Email submitted successfully.",
                "email_id": email.id,
                "email_sender": email.sender,
                "email_subject": email.subject,
                "email_body": email.body
            }, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    # If GET request, render the HTML form for testing
    return render(request, 'submit_email.html')

@csrf_exempt
def predict(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sender = data.get('sender', '')
            subject = data.get('subject', '')
            body = data.get('body', '')

            # Combine all text fields
            full_text = f"{sender} {subject} {body}"
            
            # Process the text
            processed_text = process_text(full_text)
            
            # Vectorize the text
            vectorized_text = vectorizer.transform([processed_text])
            
            # Make prediction
            classification = model.predict(vectorized_text)
            
            prediction = 'Phishy' if classification[0] == 1 else 'Not so phishy'
            
            return JsonResponse({'classification': prediction})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return render(request, 'predict.html')

@csrf_exempt
def vote_page(request):
    emails = Email.objects.all()  # Fetch all emails from the database
    return render(request, 'vote_page.html', {'emails': emails})

def get_emails(request):
    if request.method == 'GET':
        emails = Email.objects.all().values('id', 'sender', 'subject', 'body', 'votes_phishing', 'votes_legitimate')
        return JsonResponse(list(emails), safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def vote(request):
    logger.info(f"Received vote request: {request.method}")
    logger.info(f"Request headers: {request.headers}")
    
    if request.method == 'POST':
        try:
            logger.info(f"Request body: {request.body}")
            data = json.loads(request.body)
            logger.info(f"Parsed data: {data}")
            
            user_id = data.get('userid')
            email_id = data.get('email_id')
            vote_type = data.get('vote_type')  # 'yes' or 'no'
            
            logger.info(f"User ID: {user_id}, Email ID: {email_id}, Vote Type: {vote_type}")
            
            # Ensure required data is provided
            if not user_id or not email_id or vote_type not in ['yes', 'no']:
                logger.error("Missing or invalid data")
                return JsonResponse({'error': 'Missing or invalid data'}, status=400)

            try:
                # Fetch the email object
                email = Email.objects.get(id=email_id)
                logger.info(f"Found email: {email}")

                # Fetch the user object (assuming you have a User model)
                user = User.objects.get(id=user_id)
                logger.info(f"Found user: {user}")
            except Email.DoesNotExist:
                logger.error(f"Email not found: {email_id}")
                return JsonResponse({'error': 'Email not found'}, status=404)
            except User.DoesNotExist:
                logger.error(f"User not found: {user_id}")
                return JsonResponse({'error': 'User not found'}, status=404)

            # Update vote based on the type ('yes' for phishing, 'no' for legitimate)
            if vote_type == 'yes':
                email.votes_phishing += 1
            elif vote_type == 'no':
                email.votes_legitimate += 1

            # Save the updated email object
            email.save()
            logger.info(f"Updated email votes: Phishing: {email.votes_phishing}, Legitimate: {email.votes_legitimate}")

            return JsonResponse({
                'message': 'Vote recorded successfully',
                'votes_phishing': email.votes_phishing,
                'votes_legitimate': email.votes_legitimate
            })
        
        except json.JSONDecodeError:
            logger.error("Invalid JSON format", exc_info=True)
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in vote function: {str(e)}", exc_info=True)
            return JsonResponse({'error': 'An unexpected error occurred'}, status=500)
    else:
        logger.error(f"Invalid request method: {request.method}")
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def login(request):
    #TODO
    res = None
    return res

def register(request):
    #TODO
    res = None
    return res
