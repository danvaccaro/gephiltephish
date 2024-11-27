document.addEventListener('DOMContentLoaded', () => {
  const resultCard = document.getElementById('resultCard');
  const predictionDiv = document.getElementById('prediction');
  const closeButton = document.getElementById('closeButton');

  // Get the prediction data passed from background.js
  const params = new URLSearchParams(window.location.search);
  const phishy = params.get('phishy');
  const isPhishing = phishy === 'yes';

  // Update UI based on prediction
  resultCard.classList.add(isPhishing ? 'high-risk' : 'low-risk');
  predictionDiv.textContent = isPhishing ? 'Potential Phishing Email' : 'Likely Safe Email';

  // Handle close button
  closeButton.addEventListener('click', async () => {
    const currentWindow = await messenger.windows.getCurrent();
    await messenger.windows.remove(currentWindow.id);
  });
});
