document.addEventListener('DOMContentLoaded', () => {
  const resultCard = document.getElementById('resultCard');
  const predictionDiv = document.getElementById('prediction');
  const errorDetailsDiv = document.getElementById('errorDetails');
  const closeButton = document.getElementById('closeButton');
  const retryButton = document.getElementById('retryButton');

  // Get the prediction data passed from background.js
  const params = new URLSearchParams(window.location.search);
  const phishy = params.get('phishy');
  const error = params.get('error');

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
    } else if (phishy === 'yes' || phishy === 'no') {
      // Handle valid prediction
      const isPhishing = phishy === 'yes';
      resultCard.classList.add(isPhishing ? 'high-risk' : 'low-risk');
      predictionDiv.textContent = isPhishing ? 'Potential Phishing Email' : 'Likely Safe Email';
      retryButton.style.display = 'none';
    } else {
      // Handle invalid response
      resultCard.classList.add('error');
      predictionDiv.textContent = 'Invalid Response';
      errorDetailsDiv.textContent = 'Received an unexpected response from the analysis service. Please try again.';
      retryButton.style.display = 'block';
    }
  }

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
    errorDetailsDiv.textContent = 'Submitting to OpenAI for analysis';
    retryButton.style.display = 'none';
    
    // Send message to background script to retry the prediction
    await messenger.runtime.sendMessage({ action: 'retryPrediction' });
    // Close current window
    const currentWindow = await messenger.windows.getCurrent();
    await messenger.windows.remove(currentWindow.id);
  });
});
