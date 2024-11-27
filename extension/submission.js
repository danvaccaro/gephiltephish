document.addEventListener('DOMContentLoaded', () => {
  const resultCard = document.getElementById('resultCard');
  const submissionResult = document.getElementById('submissionResult');
  const closeButton = document.getElementById('closeButton');

  // Get the submission result from URL parameters
  const params = new URLSearchParams(window.location.search);
  const success = params.get('success') === 'true';

  // Update UI based on submission result
  resultCard.classList.add(success ? 'success' : 'error');
  submissionResult.textContent = success 
    ? 'Email submitted successfully!' 
    : 'Error submitting email. Please try again.';

  // Handle close button
  closeButton.addEventListener('click', async () => {
    const currentWindow = await messenger.windows.getCurrent();
    await messenger.windows.remove(currentWindow.id);
  });
});
