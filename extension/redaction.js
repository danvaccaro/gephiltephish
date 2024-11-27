// Regular expressions for detecting sensitive information
const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g
};

// Import safe encoding/decoding utilities
import { utils } from './preprocessing.js';

let originalSubject = '';
let originalContent = '';
let customPatterns = new Set();
let currentAction = 'submit'; // Default to submit if not specified
let extractedUrls = new Set();
let redactedUrls = new Set();
let originalUrlMap = new Map(); // Map to store original URLs and their redacted versions

function showStatus(message, isError = false) {
  const statusDiv = document.getElementById('statusMessage');
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = isError ? 'status-error' : 'status-success';
    statusDiv.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
  // Also log to console for debugging
  if (isError) {
    console.error(message);
  } else {
    console.log(message);
  }
}

async function loadSavedPatterns() {
  try {
    const result = await browser.storage.local.get('savedPatterns');
    const savedPatterns = result.savedPatterns || [];
    savedPatterns.forEach(pattern => customPatterns.add(pattern));
    updateSavedPatternsUI();
    updatePreview();
  } catch (error) {
    console.error('Error loading saved patterns:', error);
    showStatus('Error loading saved patterns', true);
  }
}

async function savePatterns() {
  try {
    await browser.storage.local.set({
      savedPatterns: Array.from(customPatterns)
    });
    showStatus('Patterns saved successfully');
    updateSavedPatternsUI();
  } catch (error) {
    console.error('Error saving patterns:', error);
    showStatus('Error saving patterns', true);
  }
}

async function deletePattern(pattern) {
  try {
    customPatterns.delete(pattern);
    await savePatterns();
    updatePreview();
    updateUrlList(); // Update URL list to reflect pattern removal
  } catch (error) {
    console.error('Error deleting pattern:', error);
    showStatus('Error deleting pattern', true);
  }
}

function updateSavedPatternsUI() {
  const container = document.getElementById('savedPatterns');
  if (!container) return;

  container.innerHTML = '';
  if (customPatterns.size === 0) {
    container.innerHTML = '<em>No saved patterns</em>';
    return;
  }

  customPatterns.forEach(pattern => {
    const div = document.createElement('div');
    div.className = 'pattern-item';
    
    const patternText = document.createElement('span');
    patternText.textContent = pattern;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-pattern';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deletePattern(pattern);
    
    div.appendChild(patternText);
    div.appendChild(deleteBtn);
    container.appendChild(div);
  });
}

// Helper function to clean text of problematic Unicode characters
function cleanText(text) {
  return text
    // Remove zero-width characters, soft hyphens, and other invisible Unicode
    .replace(/[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\u0000-\u001F\u00AD\u034F]/g, '')
    // Replace Unicode whitespace characters with regular space
    .replace(/[\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    // Normalize multiple horizontal spaces to single space, preserving newlines
    .replace(/[^\S\n]+/g, ' ')
    .trim();
}

// Helper function to normalize line breaks in text
function normalizeLineBreaks(text) {
  // First split into lines and clean each line
  const lines = text.split('\n');
  let result = '';
  let consecutiveEmptyLines = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const cleanedLine = cleanText(lines[i]);
    
    // If the line was just invisible characters, it will now be empty
    if (!cleanedLine) {
      consecutiveEmptyLines++;
      // Only add newline if we haven't exceeded 2 consecutive empty lines
      if (consecutiveEmptyLines <= 2) {
        result += '\n';
      }
    } else {
      consecutiveEmptyLines = 0;
      result += (result ? '\n' : '') + cleanedLine;
    }
  }
  
  return result.trim();
}

// Helper function to convert HTML content to text while preserving line breaks
function getFormattedContent(element) {
  // Replace <br> tags with newline characters
  const html = element.innerHTML;
  // First convert <br> tags to newlines
  let content = html.replace(/<br\s*\/?>/gi, '\n');
  // Then strip any remaining HTML tags
  content = content.replace(/<[^>]*>/g, '');
  // Decode any HTML entities
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  content = tempDiv.textContent;
  
  // Clean and normalize line breaks
  return normalizeLineBreaks(content);
}

// Initialize elements
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Initializing redaction window...');
    
    // Load saved patterns first
    await loadSavedPatterns();
    
    // Get content from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const encodedSubject = urlParams.get('subject');
    const encodedContent = urlParams.get('content');
    const encodedUrls = urlParams.get('urls');
    currentAction = urlParams.get('action') || 'submit';
    
    // Update submit button text based on action
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
      submitButton.textContent = currentAction === 'predict' ? 'Analyze Email' : 'Submit Email';
    }
    
    if (encodedSubject && encodedContent) {
      console.log('Received encoded subject length:', encodedSubject.length);
      console.log('Received encoded content length:', encodedContent.length);
      
      try {
        // Use safe decoding functions
        originalSubject = utils.safeDecodeURIComponent(encodedSubject);
        originalContent = utils.safeDecodeURIComponent(encodedContent);
        
        // Clean and normalize line breaks in original content
        originalContent = normalizeLineBreaks(originalContent);
        
        // Decode URLs if present
        if (encodedUrls) {
          const decodedUrls = utils.safeDecodeURIComponent(encodedUrls);
          const urls = JSON.parse(decodedUrls);
          extractedUrls = new Set(urls);
          // Store original URLs
          urls.forEach(url => originalUrlMap.set(url, url));
          console.log('Loaded URLs:', urls);
        }
        
        console.log('Decoded subject length:', originalSubject.length);
        console.log('Decoded content length:', originalContent.length);
        
        if (originalSubject && originalContent) {
          showStatus('Email content loaded successfully');
          // Update URL list in UI
          updateUrlList();
          updatePreview();
        } else {
          showStatus('Failed to process email content', true);
        }
      } catch (error) {
        console.error('Error decoding content:', error);
        showStatus('Error decoding email content', true);
      }
    } else {
      showStatus('Missing email content', true);
      console.error('Missing subject or content parameters in URL');
    }

    // Add event listeners
    document.getElementById('redactEmails').addEventListener('change', updatePreview);
    document.getElementById('redactPhones').addEventListener('change', updatePreview);
    document.getElementById('redactSSN').addEventListener('change', updatePreview);
    
    document.getElementById('addCustom').addEventListener('click', () => {
      const customInput = document.getElementById('customText');
      const newPatterns = customInput.value.split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      if (newPatterns.length > 0) {
        newPatterns.forEach(pattern => customPatterns.add(pattern));
        customInput.value = '';
        updatePreview();
        updateSavedPatternsUI();
        updateUrlList(); // Update URL list to reflect new patterns
        showStatus(`Added ${newPatterns.length} custom pattern(s)`);
      }
    });

    // Add save button listener
    document.getElementById('saveCustom').addEventListener('click', savePatterns);

    // Allow pressing Enter in custom text input
    document.getElementById('customText').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('addCustom').click();
      }
    });

    document.getElementById('cancelButton').addEventListener('click', async () => {
      try {
        const currentWindow = await messenger.windows.getCurrent();
        await messenger.windows.remove(currentWindow.id);
      } catch (error) {
        console.error('Error closing window:', error);
        showStatus('Error closing window', true);
      }
    });

    document.getElementById('submitButton').addEventListener('click', async () => {
      try {
        if (!originalSubject || !originalContent) {
          showStatus('Missing content to process', true);
          return;
        }

        // Get the redacted content while preserving formatting
        const subjectElement = document.getElementById('previewSubject');
        const contentElement = document.getElementById('previewContent');
        
        const redactedSubject = getFormattedContent(subjectElement);
        const redactedContent = getFormattedContent(contentElement);
        
        console.log('Processing redacted subject length:', redactedSubject.length);
        console.log('Processing redacted content length:', redactedContent.length);
        
        // Send message to background script with redacted content
        await messenger.runtime.sendMessage({
          type: currentAction === 'predict' ? 'PREDICT_REDACTED_EMAIL' : 'SUBMIT_REDACTED_EMAIL',
          subject: redactedSubject,
          content: redactedContent,
          urls: Array.from(extractedUrls).map(url => getRedactedText(url)) // Send redacted URLs
        });
        
        // Close the redaction window
        const currentWindow = await messenger.windows.getCurrent();
        await messenger.windows.remove(currentWindow.id);
      } catch (error) {
        console.error('Error processing redacted content:', error);
        showStatus('Error processing redacted content', true);
      }
    });

    // Add URL redaction functionality
    const urlList = document.getElementById('urlList');
    if (urlList) {
      urlList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
          const url = originalUrlMap.get(e.target.value) || e.target.value;
          if (e.target.checked) {
            redactedUrls.add(url);
          } else {
            redactedUrls.delete(url);
          }
          updatePreview();
        }
      });
    }
  } catch (error) {
    console.error('Error initializing redaction window:', error);
    showStatus('Error initializing redaction window', true);
  }
});

function applyCustomPatterns(text) {
  let result = text;
  // Apply custom redactions
  customPatterns.forEach(pattern => {
    if (pattern) {
      try {
        // Try to use the pattern as a regex first
        const regex = new RegExp(pattern, 'gi');
        result = result.replace(regex, '[REDACTED]');
      } catch (e) {
        // If pattern is not a valid regex, treat it as literal text
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const literalRegex = new RegExp(escapedPattern, 'gi');
        result = result.replace(literalRegex, '[REDACTED]');
      }
    }
  });
  return result;
}

function updateUrlList() {
  const urlList = document.getElementById('urlList');
  if (urlList) {
    urlList.innerHTML = '';
    if (extractedUrls.size === 0) {
      urlList.innerHTML = '<em>No URLs found in email</em>';
      return;
    }
    
    extractedUrls.forEach(url => {
      const div = document.createElement('div');
      div.className = 'checkbox-label';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = url;
      checkbox.id = `url-${url}`;
      
      const label = document.createElement('label');
      label.htmlFor = `url-${url}`;
      // Apply redaction to URL display
      const redactedUrl = getRedactedText(url);
      label.textContent = redactedUrl;
      label.style.marginLeft = '8px';
      label.style.wordBreak = 'break-all';
      
      // Update the URL map with redacted version
      originalUrlMap.set(redactedUrl, url);
      
      div.appendChild(checkbox);
      div.appendChild(label);
      urlList.appendChild(div);
    });
  }
}

function getRedactedText(text) {
  let result = text;
  
  // Apply standard redactions based on checkbox states
  if (document.getElementById('redactEmails').checked) {
    result = result.replace(PATTERNS.email, '[REDACTED EMAIL]');
  }
  if (document.getElementById('redactPhones').checked) {
    result = result.replace(PATTERNS.phone, '[REDACTED PHONE]');
  }
  if (document.getElementById('redactSSN').checked) {
    result = result.replace(PATTERNS.ssn, '[REDACTED SSN]');
  }

  // Apply custom patterns to all content including URLs
  result = applyCustomPatterns(result);

  // Apply specific URL redactions after patterns
  redactedUrls.forEach(url => {
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const urlRegex = new RegExp(escapedUrl, 'g');
    result = result.replace(urlRegex, '[REDACTED URL]');
  });

  return result;
}

function updatePreview() {
  const subjectDiv = document.getElementById('previewSubject');
  const contentDiv = document.getElementById('previewContent');
  
  if (!subjectDiv || !contentDiv) {
    console.error('Preview divs not found');
    return;
  }
  
  if (!originalSubject || !originalContent) {
    console.error('No content to preview');
    subjectDiv.innerHTML = '<em>No subject to preview</em>';
    contentDiv.innerHTML = '<em>No content to preview</em>';
    return;
  }

  const redactedSubject = getRedactedText(originalSubject);
  const redactedContent = getRedactedText(originalContent);
  
  console.log('Updating preview - Subject length:', redactedSubject.length);
  console.log('Updating preview - Content length:', redactedContent.length);
  
  // Display redacted content with highlighting
  const highlightRedactions = text => 
    text.replace(/\[REDACTED[^\]]*\]/g, match => `<span class="redacted">${match}</span>`);
  
  subjectDiv.innerHTML = highlightRedactions(cleanText(redactedSubject));
  
  // Handle line breaks in content preview
  const formattedContent = normalizeLineBreaks(redactedContent)
    .split('\n')
    .map(line => highlightRedactions(line))
    .join('<br>');
  
  contentDiv.innerHTML = formattedContent;
}
