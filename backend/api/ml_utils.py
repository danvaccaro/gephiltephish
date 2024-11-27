import pickle
import os
import re

def process_text(text):
    # process the text to remove non-alphanumeric characters,
    # convert to lowercase, and remove stopwords
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

# Load the model and vectorizer
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'model.pkl')
vectorizer_path = os.path.join(current_dir, 'vectorizer.pkl')

with open(model_path, 'rb') as model_file:
    model = pickle.load(model_file)

with open(vectorizer_path, 'rb') as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

def predict_phishing(sender: str, subject: str, content: str) -> bool:
    # Combine all text fields
    full_text = f"{sender} {subject} {content}"
    
    # Process the text
    processed_text = process_text(full_text)
    
    # Vectorize the text
    vectorized_text = vectorizer.transform([processed_text])
    
    # Make prediction
    classification = model.predict(vectorized_text)
    
    return classification[0] == 1
