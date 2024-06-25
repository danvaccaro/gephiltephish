from flask import Flask, render_template, jsonify, request
import pickle
app = Flask(__name__)
with open('model.pkl', 'rb') as model_file:
    model = pickle.load(model_file)
with open('vectorizer.pkl', 'rb') as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)
def process_text(text):
    # process the text to remove non-alphanumeric characters,
    # convert to lowercase, and remove stopwords
    processed_text = text.lower()
    processed_text = ''.join(char for char in processed_text if char.isalnum() or char.isspace())
    processed_text = ' '.join(word for word in processed_text.split() if word not in stopwords)
    return processed_text
@app.route('/', methods=['GET'])
def index():
    # serve index.html from the templates directory
    return render_template('index.html')
@app.route('/classify', methods=['POST'])
def classify():
    data = request.get_json()
    text = data['text']
    # process the text with the same pipeline used in the training
    # model and return the classification
    #processed_text = process_text(text)
    processed_text = text
    vectorized_text = vectorizer.transform([processed_text])
    classification = model.predict(vectorized_text)
    prediction = 'Phishy' if classification[0] == 1 else 'Not so phishy'
    return jsonify({'classification': prediction})
if __name__ == '__main__':
    app.run(host='192.168.0.42', port=5000)
