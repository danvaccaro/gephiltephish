import os
import pickle
import logging
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

# Load the trained pipeline
PIPELINE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                           'model_comparison', 'email_classifier_pipeline.pkl')

try:
    with open(PIPELINE_PATH, 'rb') as f:
        pipeline = pickle.load(f)
    logger.info("Successfully loaded ML pipeline")
except Exception as e:
    logger.error(f"Failed to load ML pipeline: {str(e)}")
    pipeline = None

def predict_with_pipeline(sender: str, subject: str, content: str) -> bool:
    """
    Use the trained scikit-learn pipeline to predict if an email is phishing.
    Returns True if the email is predicted to be phishing, False otherwise.
    
    Args:
        sender: The email sender domain
        subject: The email subject
        content: The email content
    
    Returns:
        bool: True if phishing, False if legitimate
        float: Confidence score of the prediction
    
    Raises:
        Exception: If pipeline is not loaded or prediction fails
    """
    if pipeline is None:
        raise Exception("ML pipeline not loaded")
    
    try:
        # Combine text fields similar to training
        subject = str(subject).lower() if subject else ''
        content = str(content).lower() if content else ''
        combined_text = f"{subject} {content}".strip()
        
        # Get prediction and probability
        prediction = pipeline.predict([combined_text])[0]
        probability = pipeline.predict_proba([combined_text])[0]
        confidence = probability.max()
        
        return bool(prediction), float(confidence)
        
    except Exception as e:
        logger.error(f"Pipeline prediction error: {str(e)}")
        raise Exception(f"Pipeline prediction failed: {str(e)}")
