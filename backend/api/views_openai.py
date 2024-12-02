import os
from openai import OpenAI
from rest_framework.response import Response
from rest_framework import status
import logging
import time
from datetime import datetime, timedelta
from collections import deque

logger = logging.getLogger(__name__)

# Initialize OpenAI client with API key from environment variable
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    organization=os.getenv('OPENAI_ORG_ID')
)

# Rate limiting setup
# Keep track of requests in a rolling window
request_timestamps = deque()
RATE_LIMIT_WINDOW = 60  # Window size in seconds
MAX_REQUESTS_PER_WINDOW = 50  # Maximum requests per minute
COOLDOWN_DELAY = 1  # Delay between requests in seconds

def check_rate_limit():
    """
    Check if we're within rate limits and clean up old timestamps.
    Returns True if we can proceed, False if we need to wait.
    """
    current_time = datetime.now()
    window_start = current_time - timedelta(seconds=RATE_LIMIT_WINDOW)
    
    # Remove timestamps outside the window
    while request_timestamps and request_timestamps[0] < window_start:
        request_timestamps.popleft()
    
    # Check if we're at the limit
    return len(request_timestamps) < MAX_REQUESTS_PER_WINDOW

def predict_with_openai(sender: str, subject: str, content: str, max_retries: int = 3) -> bool:
    """
    Use OpenAI's API to predict if an email is phishing.
    Returns True if the email is predicted to be phishing, False otherwise.
    
    Args:
        sender: The email sender domain
        subject: The email subject
        content: The email content
        max_retries: Maximum number of attempts to get a valid yes/no response
    
    Returns:
        bool: True if phishing, False if legitimate
    
    Raises:
        Exception: If unable to get a valid response after max_retries
    """
    # Combine all text fields
    full_text = f"Sender Domain: {sender}\nSubject: {subject}\nContent: {content}"
    
    # System prompt for phishing detection
    system_prompt = """You are a cybersecurity expert specializing in phishing email detection. 
    Analyze the provided email and determine if it's a phishing attempt. 
    Consider sender domain legitimacy, urgency tactics, suspicious links, and grammatical errors. 
    You must respond with ONLY the word 'yes' if it's phishing or 'no' if it's legitimate.
    Do not include any other text, explanation, or punctuation in your response."""

    attempts = 0
    while attempts < max_retries:
        try:
            # Check rate limit before making request
            while not check_rate_limit():
                time.sleep(COOLDOWN_DELAY)
            
            # Add timestamp for this request
            request_timestamps.append(datetime.now())
            
            # Add small delay between requests
            time.sleep(COOLDOWN_DELAY)
            
            # Make API call to OpenAI
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": full_text}
                ],
                temperature=0.3,  # Lower temperature for more consistent results
                max_tokens=10  # We only need a short response
            )
            
            # Extract and validate the prediction
            prediction = response.choices[0].message.content.strip().lower()
            logger.debug(f"OpenAI response (attempt {attempts + 1}): {prediction}")
            
            # Check if response is exactly "yes" or "no"
            if prediction in ["yes", "no"]:
                return prediction == "yes"
            
            logger.warning(f"Invalid response from OpenAI (attempt {attempts + 1}): {prediction}")
            attempts += 1
            
        except Exception as e:
            logger.error(f"OpenAI API error (attempt {attempts + 1}): {str(e)}")
            attempts += 1
            if attempts == max_retries:
                raise Exception(f"OpenAI API error after {max_retries} attempts: {str(e)}")
            # Add delay before retry
            time.sleep(COOLDOWN_DELAY * 2)
    
    raise Exception(f"Failed to get valid yes/no response after {max_retries} attempts")
