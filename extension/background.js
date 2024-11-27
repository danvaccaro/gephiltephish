// background.js - Main logic for Thunderbird extension focused on phishing detection

import { preprocessEmailBody, preprocessSubject, extractURLs, utils } from './preprocessing.js';

let isAuthenticated = false;
let currentEmailMessage = null;
let currentAction = null; // Track whether we're doing prediction or submission

// Get stored auth token
async function getAuthToken() {
  const result = await messenger.storage.local.get('authToken');
  return result.authToken;
}

// Listen for auth status updates from popup and redaction window
messenger.runtime.onMessage.addListener((message) => {
  if (message.type === 'AUTH_STATUS') {
    isAuthenticated = message.isAuthenticated;
  } else if (message.type === 'SUBMIT_REDACTED_EMAIL') {
    // Handle redacted content submission
    submitRedactedEmail(message.subject, message.content);
  } else if (message.type === 'PREDICT_REDACTED_EMAIL') {
    // Handle redacted content prediction
    predictRedactedEmail(message.subject, message.content);
  }
});

async function checkAuth() {
  try {
    const token = await getAuthToken();
    if (!token) {
      isAuthenticated = false;
      return false;
    }

    const response = await fetch('http://localhost:8000/api/get_emails/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    isAuthenticated = response.ok;
    return response.ok;
  } catch (error) {
    isAuthenticated = false;
    return false;
  }
}

async function showLoginPopup() {
  await messenger.windows.create({
    url: "popup.html",
    type: "popup",
    width: 350,
    height: 450
  });
}

async function showPredictionWindow(phishy) {
  const url = `prediction.html?phishy=${phishy}`;
  await messenger.windows.create({
    url: url,
    type: "popup",
    width: 450,
    height: 200
  });
}

async function showSubmissionResult(success) {
  const url = `submission.html?success=${success}`;
  await messenger.windows.create({
    url: url,
    type: "popup",
    width: 450,
    height: 200
  });
}

async function showRedactionWindow(subject, content) {
  try {
    // Preprocess both subject and content
    const processedSubject = preprocessSubject(subject);
    const processedContent = preprocessEmailBody(content);
    
    // Extract URLs before any content processing
    const urls = extractURLs(content);
    
    // Use safe encoding functions for all fields
    const encodedSubject = utils.safeEncodeURIComponent(processedSubject);
    const encodedContent = utils.safeEncodeURIComponent(processedContent);
    const encodedUrls = utils.safeEncodeURIComponent(JSON.stringify(urls));
    
    const url = `redaction.html?subject=${encodedSubject}&content=${encodedContent}&urls=${encodedUrls}&action=${currentAction}`;
    
    await messenger.windows.create({
      url: url,
      type: "popup",
      width: 900,
      height: 700
    });
  } catch (error) {
    console.error('Error showing redaction window:', error);
  }
}

messenger.runtime.onInstalled.addListener(async () => {
  console.log('gephiltephish initialized');
  // Check initial auth status
  await checkAuth();

  messenger.menus.create({
    id: "analyze-email",
    title: "Analyze Email for Phishing",
    contexts: ["message_list"],
  });

  messenger.menus.create({
    id: "submit-email",
    title: "Submit Email for Model Training",
    contexts: ["message_list"],
  });
});

// Helper function to extract domain from email
function extractDomain(sender) {
  const match = sender.match(/@([^>]+)/);
  return match ? match[1].toLowerCase() : '';
}

// Helper function to process message parts
async function processMessageParts(messageId, parts) {
  let textContent = "";
  let htmlContent = "";

  // First try to get the displayed message for best text representation
  try {
    const displayedMessage = await messenger.messages.getDisplayedMessage(messageId);
    if (displayedMessage && displayedMessage.body) {
      textContent = displayedMessage.body;
      return { textContent, htmlContent: "" };
    }
  } catch (error) {
    console.log("Falling back to manual part processing");
  }

  // Fall back to manual part processing if displayed message isn't available
  for (const part of parts) {
    if (part.parts) {
      // Recursively process nested parts
      const nestedContent = await processMessageParts(messageId, part.parts);
      textContent += nestedContent.textContent;
      htmlContent += nestedContent.htmlContent;
    } else {
      if (part.contentType === "text/plain") {
        textContent += part.body + "\n";
      } else if (part.contentType === "text/html") {
        htmlContent += part.body + "\n";
      }
    }
  }

  // Prefer HTML content if available, as our preprocessing can handle it better
  return {
    textContent: textContent.trim(),
    htmlContent: htmlContent.trim()
  };
}

//Helper function to extract JSON from email
async function emailToJSON(fullMessage, redactedSubject = null, redactedContent = null) {
  // Process message content
  const processedContent = await processMessageParts(fullMessage.id, fullMessage.parts || []);
        
  // Get the raw content, preferring HTML as our preprocessing can handle it better
  const rawContent = processedContent.htmlContent || processedContent.textContent;
  
  // Extract URLs before any content processing
  const urls = extractURLs(rawContent);
  
  // Use redacted content if provided, otherwise use original content
  const bodyContent = redactedContent || rawContent;
  const subject = redactedSubject || fullMessage.headers.subject[0];
  
  // Extract domain and convert to lowercase for consistency
  const domain = extractDomain(fullMessage.headers.from[0]);
  
  // Construct streamlined analysis payload focused on ML-relevant data
  const analysisData = {
    sender_domain: domain,
    subject: preprocessSubject(subject),
    date: fullMessage.headers.date[0],
    content: preprocessEmailBody(bodyContent),
    urls: urls
  };
  return analysisData;
}

// Function to handle submitting redacted email content
async function submitRedactedEmail(redactedSubject, redactedContent) {
  try {
    console.log('Submitting redacted email...');
    
    if (!currentEmailMessage) {
      console.error("No email message stored for submission");
      await showSubmissionResult(false);
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      await showLoginPopup();
      return;
    }

    const emailData = await emailToJSON(currentEmailMessage, redactedSubject, redactedContent);
    console.log('Prepared email data for submission');

    // Send POST request to submit endpoint using redacted content
    const response = await fetch('http://localhost:8000/api/submit/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        isAuthenticated = false;
        await showLoginPopup();
        return;
      }
      throw new Error('API request failed');
    }

    await showSubmissionResult(true);
  } catch (error) {
    console.error("Error submitting message:", error);
    await showSubmissionResult(false);
    if (error.message?.includes('401') || error.message?.includes('403')) {
      isAuthenticated = false;
      await showLoginPopup();
    }
  } finally {
    // Clear the stored message and action
    currentEmailMessage = null;
    currentAction = null;
  }
}

// Function to handle predicting with redacted email content
async function predictRedactedEmail(redactedSubject, redactedContent) {
  try {
    console.log('Predicting with redacted email...');
    
    if (!currentEmailMessage) {
      console.error("No email message stored for prediction");
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      await showLoginPopup();
      return;
    }

    const emailData = await emailToJSON(currentEmailMessage, redactedSubject, redactedContent);
    console.log('Prepared email data for prediction');

    // Send POST request to predict endpoint using redacted content
    const response = await fetch('http://localhost:8000/api/predict/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        isAuthenticated = false;
        await showLoginPopup();
        return;
      }
      throw new Error('API request failed');
    }

    const result = await response.json();
    await showPredictionWindow(result.phishy);
  } catch (error) {
    console.error("Error predicting message:", error);
    if (error.message?.includes('401') || error.message?.includes('403')) {
      isAuthenticated = false;
      await showLoginPopup();
    }
  } finally {
    // Clear the stored message and action
    currentEmailMessage = null;
    currentAction = null;
  }
}

messenger.menus.onClicked.addListener(async (info, tab) => {
  // Check authentication first
  if (!isAuthenticated) {
    const authStatus = await checkAuth();
    if (!authStatus) {
      await showLoginPopup();
      return;
    }
  }

  if (info.menuItemId === "analyze-email") {
    try {
      const messages = await messenger.mailTabs.getSelectedMessages();
      const token = await getAuthToken();

      if (!token) {
        await showLoginPopup();
        return;
      }

      if (messages.messages.length > 0) {
        const message = messages.messages[0];
        const fullMessage = await messenger.messages.getFull(message.id);
        
        // Store the current message and action for prediction
        currentEmailMessage = fullMessage;
        currentAction = 'predict';
        
        // Show redaction window with preprocessed email content
        const processedContent = await processMessageParts(message.id, fullMessage.parts || []);
        const content = processedContent.htmlContent || processedContent.textContent;
        const subject = fullMessage.headers.subject[0];
        
        console.log('Processing email for redaction before prediction');
        console.log('Subject length:', subject.length);
        console.log('Content length:', content.length);
        
        await showRedactionWindow(subject, content);
      } else {
        console.error("No message selected");
      }
    } catch (error) {
      console.error("Error processing message:", error);
      // If error is due to authentication, show login popup
      if (error.message?.includes('401') || error.message?.includes('403')) {
        isAuthenticated = false;
        await showLoginPopup();
      }
    }
  } else if (info.menuItemId === "submit-email") {
    try {
      const messages = await messenger.mailTabs.getSelectedMessages();
      const token = await getAuthToken();

      if (!token) {
        await showLoginPopup();
        return;
      }

      if (messages.messages.length > 0) {
        const message = messages.messages[0];
        const fullMessage = await messenger.messages.getFull(message.id);
        
        // Store the current message and action for submission
        currentEmailMessage = fullMessage;
        currentAction = 'submit';
        
        // Show redaction window with preprocessed email content
        const processedContent = await processMessageParts(message.id, fullMessage.parts || []);
        const content = processedContent.htmlContent || processedContent.textContent;
        const subject = fullMessage.headers.subject[0];
        
        console.log('Processing email for redaction');
        console.log('Subject length:', subject.length);
        console.log('Content length:', content.length);
        
        await showRedactionWindow(subject, content);
      } else {
        console.error("No message selected");
      }
    } catch (error) {
      console.error("Error processing message:", error);
      await showSubmissionResult(false);
      // If error is due to authentication, show login popup
      if (error.message?.includes('401') || error.message?.includes('403')) {
        isAuthenticated = false;
        await showLoginPopup();
      }
    }
  }
});
