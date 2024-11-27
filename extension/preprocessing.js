// preprocessing.js - Functions for preprocessing email content before submission/prediction

/**
 * Safely encodes text for URI components, handling special characters
 * @param {string} text - The text to encode
 * @returns {string} The safely encoded text
 */
function safeEncodeURIComponent(text) {
    if (!text) return '';
    
    // First encode using built-in function
    let encoded = encodeURIComponent(text);
    
    // Additionally escape characters that encodeURIComponent doesn't handle
    encoded = encoded.replace(/['()]/g, escape);
    
    return encoded;
}

/**
 * Safely decodes URI encoded text
 * @param {string} text - The text to decode
 * @returns {string} The safely decoded text
 */
function safeDecodeURIComponent(text) {
    if (!text) return '';
    
    try {
        // First unescape any additionally escaped characters
        let decoded = text.replace(/%27/g, "'")
                         .replace(/%28/g, "(")
                         .replace(/%29/g, ")");
        
        // Then decode using built-in function
        return decodeURIComponent(decoded);
    } catch (error) {
        console.error('Error decoding text:', error);
        return text; // Return original text if decoding fails
    }
}

/**
 * Converts HTML content to plain text
 * @param {string} html - The HTML content to convert
 * @returns {string} The plain text content
 */
function htmlToText(html) {
    if (!html) return '';
    
    try {
        // Create a temporary div to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Replace common HTML elements with text equivalents
        const elements = temp.getElementsByTagName('*');
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            
            // Handle lists
            if (el.tagName === 'LI') {
                el.textContent = '• ' + el.textContent;
            }
            
            // Add newlines after block elements
            if (getComputedStyle(el).display === 'block') {
                el.textContent = el.textContent + '\n';
            }
            
            // Handle links
            if (el.tagName === 'A' && el.href) {
                el.textContent = `${el.textContent} (${el.href})`;
            }
        }
        
        // Get the text content and clean it up
        let text = temp.textContent || temp.innerText || '';
        
        // Clean up extra whitespace while preserving intentional line breaks
        text = text.split('\n')
                  .map(line => line.trim())
                  .filter(line => line)
                  .join('\n');
        
        return text;
    } catch (error) {
        console.error('Error converting HTML to text:', error);
        return html; // Return original HTML if conversion fails
    }
}

/**
 * Preprocesses the email body content
 * @param {string} content - The raw email content
 * @returns {string} The preprocessed content
 */
export function preprocessEmailBody(content) {
    console.log('preprocessEmailBody received content length:', content?.length || 0);
    
    try {
        if (!content) return '';
        
        // First decode any HTML entities
        const decodedContent = content.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, "/");
        
        // Convert HTML to plain text
        const plainText = htmlToText(decodedContent);
        
        // Clean the text of any problematic characters
        const cleanText = plainText.replace(/[\uFEFF\uFFFD]/g, '') // Remove BOM and replacement characters
                                 .replace(/\u0000/g, ''); // Remove null characters
        
        console.log('Preprocessed content length:', cleanText.length);
        return cleanText;
    } catch (error) {
        console.error('Error preprocessing content:', error);
        return content || ''; // Return original content or empty string if null
    }
}

/**
 * Preprocesses the email subject
 * @param {string} subject - The raw email subject
 * @returns {string} The preprocessed subject
 */
export function preprocessSubject(subject) {
    console.log('preprocessSubject received length:', subject?.length || 0);
    
    try {
        if (!subject) return '';
        
        // Decode any HTML entities in subject
        const decodedSubject = subject.replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, "/");
        
        // Clean the text of any problematic characters
        const cleanSubject = decodedSubject.replace(/[\uFEFF\uFFFD]/g, '') // Remove BOM and replacement characters
                                         .replace(/\u0000/g, '') // Remove null characters
                                         .trim();
        
        return cleanSubject;
    } catch (error) {
        console.error('Error preprocessing subject:', error);
        return subject || ''; // Return original subject or empty string if null
    }
}

/**
 * Extracts URLs from the email content
 * @param {string} content - The raw email content
 * @returns {string[]} Array of extracted URLs
 */
export function extractURLs(content) {
    console.log('extractURLs received content length:', content?.length || 0);
    
    try {
        if (!content) return [];
        
        // Create temporary element to parse HTML and extract links
        const temp = document.createElement('div');
        temp.innerHTML = content;
        
        // Get all links from HTML
        const links = temp.getElementsByTagName('a');
        const urlSet = new Set();
        
        // Extract href attributes
        for (const link of links) {
            if (link.href) {
                try {
                    // Ensure URL is properly formatted
                    const url = new URL(link.href).toString();
                    urlSet.add(url);
                } catch (e) {
                    console.warn('Invalid URL found:', link.href);
                }
            }
        }
        
        // Also look for URLs in text content using regex
        const urlRegex = /https?:\/\/[^\s<>"]+/g;
        const textContent = temp.textContent || temp.innerText || content;
        const matches = textContent.match(urlRegex) || [];
        
        matches.forEach(url => {
            try {
                // Ensure URL is properly formatted
                const validUrl = new URL(url).toString();
                urlSet.add(validUrl);
            } catch (e) {
                console.warn('Invalid URL found:', url);
            }
        });
        
        return Array.from(urlSet);
    } catch (error) {
        console.error('Error extracting URLs:', error);
        return [];
    }
}

// Export additional utility functions for use in other modules
export const utils = {
    safeEncodeURIComponent,
    safeDecodeURIComponent
};
