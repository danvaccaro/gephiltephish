import pandas as pd
import json

# Read the CSV file
df = pd.read_csv('balanced_dataset.csv')

# Calculate email lengths and remove 100 longest emails
df['email_length'] = df['body'].str.len()
df = df.sort_values('email_length', ascending=False).iloc[100:].reset_index(drop=True)
print(f"Removed 100 longest emails. Remaining dataset size: {len(df)}")

# Create the system message that will be the same for all rows
system_message = {
    "role": "system",
    "content": "You are a cybersecurity expert specializing in phishing email detection. Analyze the provided email and determine if it's a phishing attempt. Consider urgency tactics, suspicious links, grammatical errors, too-good-to-be-true offers, and other markers. You must respond with ONLY the word 'yes' if it's phishing or 'no' if it's legitimate. Do not include any other text, explanation, or punctuation in your response."
}

# First create all examples and store them in memory
phishing_examples = []
legitimate_examples = []

# Process each row in the dataset
for _, row in df.iterrows():
    # Create the user message with the email content
    user_message = {
        "role": "user",
        "content": f"SENDER_DOMAIN: {row['sender']} SUBJECT: {row['subject']} BODY: {row['body']}"
    }
    
    # Create the assistant message (convert 0/1 to no/yes)
    is_phishing = row['label'] == 1
    assistant_message = {
        "role": "assistant",
        "content": "yes" if is_phishing else "no"
    }
    
    # Create the full training example
    training_example = {
        "messages": [
            system_message,
            user_message,
            assistant_message
        ]
    }
    
    # Store in appropriate list
    if is_phishing:
        phishing_examples.append(training_example)
    else:
        legitimate_examples.append(training_example)

# Function to create balanced batches
def create_balanced_batches(phishing_examples, legitimate_examples, batch_size=1000):
    # Ensure batch_size is even to have equal distribution
    if batch_size % 2 != 0:
        batch_size -= 1
    
    examples_per_class = batch_size // 2
    
    # Calculate how many complete batches we can make
    num_phishing = len(phishing_examples)
    num_legitimate = len(legitimate_examples)
    possible_batches = min(num_phishing // examples_per_class, 
                          num_legitimate // examples_per_class)
    
    print(f"Creating {possible_batches} balanced batches with {examples_per_class} examples per class")
    
    # Create the batches
    for i in range(possible_batches):
        batch = []
        
        # Get examples for this batch
        start_idx = i * examples_per_class
        end_idx = start_idx + examples_per_class
        
        # Add equal numbers of phishing and legitimate examples
        batch.extend(phishing_examples[start_idx:end_idx])
        batch.extend(legitimate_examples[start_idx:end_idx])
        
        # Write batch to file
        batch_filename = f'training_batches/batch_{i+1:03d}.jsonl'
        with open(batch_filename, 'w') as f:
            for example in batch:
                f.write(json.dumps(example) + '\n')
    
    return possible_batches

# Create the balanced batches
num_batches = create_balanced_batches(phishing_examples, legitimate_examples)
print(f"Created {num_batches} balanced batch files in training_batches/ directory")

# Also save complete dataset for reference
print("Saving complete training dataset...")
with open('training_data.jsonl', 'w') as f:
    # Write all examples
    for example in phishing_examples + legitimate_examples:
        f.write(json.dumps(example) + '\n')

print("Training data has been written to training_data.jsonl")
