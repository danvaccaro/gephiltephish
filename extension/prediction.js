document.addEventListener('DOMContentLoaded', () => {
  const resultCard = document.getElementById('resultCard');
  const predictionDiv = document.getElementById('prediction');
  const modelInfoDiv = document.getElementById('modelInfo');
  const confidenceDiv = document.getElementById('confidence');
  const errorDetailsDiv = document.getElementById('errorDetails');
  const closeButton = document.getElementById('closeButton');
  const retryButton = document.getElementById('retryButton');
  const modelSelect = document.getElementById('modelSelect');

  // Get the prediction data passed from background.js
  const params = new URLSearchParams(window.location.search);
  const phishy = params.get('phishy');
  const error = params.get('error');
  const model = params.get('model') || 'openai';
  const confidence = params.get('confidence');

  // Set initial model selection
  modelSelect.value = model;

  // Remove loading state and update UI based on response
  if (phishy || error) {
    resultCard.classList.remove('loading');
    errorDetailsDiv.textContent = ''; // Clear loading message
    
    if (error) {
      // Handle error state
      resultCard.classList.add('error');
      predictionDiv.textContent = 'Analysis Error';
      errorDetailsDiv.textContent = decodeURIComponent(error);
      retryButton.style.display = 'block';
      modelInfoDiv.textContent = '';
      confidenceDiv.textContent = '';
    } else if (phishy === 'yes' || phishy === 'no') {
      // Handle valid prediction
      const isPhishing = phishy === 'yes';
      resultCard.classList.add(isPhishing ? 'high-risk' : 'low-risk');
      predictionDiv.textContent = isPhishing ? 'Potential Phishing Email' : 'Likely Safe Email';
      modelInfoDiv.textContent = `Model: ${model === 'openai' ? 'OpenAI GPT' : 'ML Pipeline'}`;
      
      // Only show confidence for pipeline model
      if (model === 'pipeline' && confidence) {
        confidenceDiv.textContent = `Confidence: ${(parseFloat(confidence) * 100).toFixed(1)}%`;
      } else {
        confidenceDiv.textContent = '';
      }
      
      retryButton.style.display = 'none';
    } else {
      // Handle invalid response
      resultCard.classList.add('error');
      predictionDiv.textContent = 'Invalid Response';
      errorDetailsDiv.textContent = 'Received an unexpected response from the analysis service. Please try again.';
      retryButton.style.display = 'block';
      modelInfoDiv.textContent = '';
      confidenceDiv.textContent = '';
    }
  }

  // Handle model selection change
  modelSelect.addEventListener('change', async () => {
    // Reset to loading state
    resultCard.className = 'result-card loading';
    predictionDiv.innerHTML = 'Submitting to model for analysis<span class="loading-dots"></span>';
    errorDetailsDiv.textContent = `Analyzing with ${modelSelect.value === 'openai' ? 'OpenAI GPT' : 'ML Pipeline'} model`;
    modelInfoDiv.textContent = '';
    confidenceDiv.textContent = '';
    retryButton.style.display = 'none';
    
    // Send message to background script to retry with new model
    await messenger.runtime.sendMessage({ 
      action: 'retryPrediction',
      model: modelSelect.value
    });
  });

  // Handle close button
  closeButton.addEventListener('click', async () => {
    const currentWindow = await messenger.windows.getCurrent();
    await messenger.windows.remove(currentWindow.id);
  });

  // Handle retry button
  retryButton.addEventListener('click', async () => {
    // Reset to loading state
    resultCard.className = 'result-card loading';
    predictionDiv.innerHTML = 'Analyzing Email<span class="loading-dots"></span>';
    errorDetailsDiv.textContent = `Analyzing with ${modelSelect.value === 'openai' ? 'OpenAI GPT' : 'ML Pipeline'} model`;
    modelInfoDiv.textContent = '';
    confidenceDiv.textContent = '';
    retryButton.style.display = 'none';
    
    // Send message to background script to retry the prediction
    await messenger.runtime.sendMessage({ 
      action: 'retryPrediction',
      model: modelSelect.value
    });
  });
});
