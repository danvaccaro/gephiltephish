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
        
        // Remove all style and class attributes
        const allElements = temp.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
            allElements[i].removeAttribute('style');
            allElements[i].removeAttribute('class');
        }

        // Remove style tags and their contents
        const styleTags = temp.getElementsByTagName('style');
        while (styleTags.length > 0) {
            styleTags[0].parentNode.removeChild(styleTags[0]);
        }

        // Remove script tags
        const scriptTags = temp.getElementsByTagName('script');
        while (scriptTags.length > 0) {
            scriptTags[0].parentNode.removeChild(scriptTags[0]);
        }

        // Remove image tags
        const imageTags = temp.getElementsByTagName('img');
        while (imageTags.length > 0) {
            imageTags[0].parentNode.removeChild(imageTags[0]);
        }

        // Replace anchor tags with just their text content
        const anchorTags = temp.getElementsByTagName('a');
        for (let i = anchorTags.length - 1; i >= 0; i--) {
            const anchor = anchorTags[i];
            const text = anchor.textContent || '';
            anchor.replaceWith(text);
        }
        
        // Handle specific HTML elements
        const elements = temp.getElementsByTagName('*');
        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i];
            
            switch (el.tagName.toLowerCase()) {
                case 'br':
                    el.replaceWith('\n');
                    break;
                case 'p':
                case 'div':
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                case 'header':
                case 'footer':
                case 'section':
                case 'article':
                    el.innerHTML += '\n';
                    break;
                case 'li':
                    el.textContent = '• ' + el.textContent + '\n';
                    break;
                case 'tr':
                    el.innerHTML += '\n';
                    break;
                case 'td':
                case 'th':
                    el.innerHTML += '\t';
                    break;
            }
        }
        
        // Get the text content and clean it up
        let text = temp.textContent || temp.innerText || '';
        
        // Clean up whitespace while preserving intentional line breaks
        text = text.split('\n')
                  .map(line => line.trim())
                  .filter(line => line)
                  .join('\n');
        
        // Remove any remaining HTML tags using regex
        text = text.replace(/<[^>]*>/g, '');
        
        // Clean up multiple consecutive line breaks and spaces
        text = text.replace(/\n{3,}/g, '\n\n')
                  .replace(/[ \t]+/g, ' ')
                  .trim();
        
        return text;
    } catch (error) {
        console.error('Error converting HTML to text:', error);
        return html.replace(/<[^>]*>/g, ''); // Fallback to simple tag stripping
    }
}

/**
 * Preprocesses the email body content
 * @param {string} content - The raw email content
 * @returns {string} The preprocessed content
 */
function preprocessEmailBody(content) {
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
            .replace(/&#x2F;/g, "/")
            .replace(/&nbsp;/g, ' ');
        
        // Convert HTML to plain text
        const plainText = htmlToText(decodedContent);
        
        // Clean the text of any problematic characters
        const cleanText = plainText.replace(/[\uFEFF\uFFFD]/g, '') // Remove BOM and replacement characters
                                 .replace(/\u0000/g, '') // Remove null characters
                                 .replace(/\r\n/g, '\n') // Normalize line endings
                                 .replace(/\r/g, '\n');
        
        console.log('Preprocessed content length:', cleanText.length);
        return cleanText;
    } catch (error) {
        console.error('Error preprocessing content:', error);
        return content?.replace(/<[^>]*>/g, '') || ''; // Fallback to simple tag stripping
    }
}

/**
 * Preprocesses the email subject
 * @param {string} subject - The raw email subject
 * @returns {string} The preprocessed subject
 */
function preprocessSubject(subject) {
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
            .replace(/&#x2F;/g, "/")
            .replace(/&nbsp;/g, ' ');
        
        // Remove any HTML tags
        const strippedSubject = decodedSubject.replace(/<[^>]*>/g, '');
        
        // Clean the text of any problematic characters
        const cleanSubject = strippedSubject.replace(/[\uFEFF\uFFFD]/g, '') // Remove BOM and replacement characters
                                          .replace(/\u0000/g, '') // Remove null characters
                                          .replace(/\s+/g, ' ') // Normalize whitespace
                                          .trim();
        
        return cleanSubject;
    } catch (error) {
        console.error('Error preprocessing subject:', error);
        return subject?.replace(/<[^>]*>/g, '').trim() || ''; // Fallback to simple tag stripping
    }
}

/**
 * Helper function to safely extract domain from URL
 * @param {string} urlString - The URL to process
 * @returns {string|null} The domain if valid, null otherwise
 */
function extractDomain(urlString) {
    try {
        const url = new URL(urlString);
        const domain = url.hostname.trim();
        return domain ? domain : null;  // Return null if domain is empty
    } catch (e) {
        console.warn('Invalid URL found:', urlString);
        return null;
    }
}

/**
 * Extracts URLs from the email content and returns them in a format compatible with redaction
 * @param {string} content - The raw email content
 * @returns {string[]} Array of domain-based URLs with counts
 */
function extractURLs(content) {
    console.log('extractURLs received content length:', content?.length || 0);
    
    try {
        if (!content) return [];
        
        // Create temporary element to parse HTML and extract links
        const temp = document.createElement('div');
        temp.innerHTML = content;
        
        // Object to store domain counts
        const domainCounts = {};
        
        // Get all links from HTML
        const links = temp.getElementsByTagName('a');
        
        // Extract domains from href attributes
        for (const link of links) {
            if (link.href && !link.href.startsWith('javascript:')) {
                const domain = extractDomain(link.href);
                if (domain) {
                    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
                }
            }
        }
        
        // Also look for URLs in text content using regex
        const urlRegex = /https?:\/\/[^\s<>"]+/g;
        const textContent = temp.textContent || temp.innerText || content;
        const matches = textContent.match(urlRegex) || [];
        
        matches.forEach(url => {
            const domain = extractDomain(url);
            if (domain) {
                domainCounts[domain] = (domainCounts[domain] || 0) + 1;
            }
        });
        
        // Convert domain counts to array format compatible with redaction system
        // Format: ["domain.com (2 links)", "otherdomain.com (1 link)"]
        return Object.entries(domainCounts)
            .filter(([domain]) => domain) // Extra safety check to filter out any empty domains
            .map(([domain, count]) => 
                `${domain} (${count} link${count === 1 ? '' : 's'})`
            );
    } catch (error) {
        console.error('Error extracting URLs:', error);
        return [];
    }
}

// Export using ES modules
export { preprocessEmailBody, preprocessSubject, extractURLs };
export const utils = {
    safeEncodeURIComponent,
    safeDecodeURIComponent
};
