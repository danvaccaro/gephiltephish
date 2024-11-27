const API_URL = 'http://localhost:8000';

// Store auth token in extension storage
async function storeAuthToken(token) {
  await messenger.storage.local.set({ authToken: token });
}

// Get stored auth token
async function getAuthToken() {
  const result = await messenger.storage.local.get('authToken');
  return result.authToken;
}

async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: email,
        password: password
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Login failed');
    }

    const data = await response.json();
    await storeAuthToken(data.token);
    return data;
  } catch (error) {
    throw error;
  }
}

async function checkAuth() {
  try {
    const token = await getAuthToken();
    if (!token) return false;

    const response = await fetch(`${API_URL}/api/get_emails/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function closePopup() {
  // Get the current window
  const currentWindow = await messenger.windows.getCurrent();
  // Close it using the Thunderbird API
  await messenger.windows.remove(currentWindow.id);
}

function showAuthenticatedState(loginForm) {
  loginForm.innerHTML = `
    <p class="success">You are logged in!</p>
    <button id="closeButton" class="close-button">Close Window</button>
  `;
  
  // Add click handler for close button
  const closeButton = document.getElementById('closeButton');
  if (closeButton) {
    closeButton.addEventListener('click', closePopup);
  }
  
  // Auto-close after 1.5 seconds
  setTimeout(closePopup, 1500);
}

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('loginButton');
  const errorDiv = document.getElementById('error');
  const successDiv = document.getElementById('success');

  // Check if already authenticated
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    showAuthenticatedState(loginForm);
    // Notify background script of authentication
    messenger.runtime.sendMessage({ type: 'AUTH_STATUS', isAuthenticated: true });
  }

  loginButton.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    try {
      await login(email, password);
      // Notify background script of authentication
      messenger.runtime.sendMessage({ type: 'AUTH_STATUS', isAuthenticated: true });
      showAuthenticatedState(loginForm);
    } catch (error) {
      errorDiv.textContent = error.message || 'Login failed. Please try again.';
      errorDiv.style.display = 'block';
    }
  });
});
