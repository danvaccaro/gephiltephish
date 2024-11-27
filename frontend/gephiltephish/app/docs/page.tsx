'use client';

import { useState } from 'react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
            <p className="mb-4 text-gray-800 dark:text-gray-200">
              GephiltePhish is a community-driven platform designed to improve email security through collective human intelligence 
              and advanced AI analysis. The platform combines a web interface for manual classification of suspicious emails with 
              a Thunderbird extension for real-time protection, powered by GPT-4 for enhanced phishing detection.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Key Components</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-200">
              <li>Web Platform: Vote on suspicious emails and contribute to the community database</li>
              <li>Thunderbird Extension: Real-time phishing detection with AI-powered analysis</li>
              <li>AI Integration: GPT-4 powered analysis for accurate phishing detection</li>
              <li>Privacy Protection: Automatic PII redaction system for enhanced security</li>
              <li>API: RESTful services for email analysis, user management, and ML integration</li>
            </ul>
          </div>
        );

      case 'getting-started':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Getting Started</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Create an Account</h3>
                <p className="text-gray-800 dark:text-gray-200">Visit the registration page and create an account with your email address.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Install the Extension</h3>
                <p className="text-gray-800 dark:text-gray-200">Download and install the Thunderbird extension from the download page.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Start Contributing</h3>
                <p className="text-gray-800 dark:text-gray-200">Begin voting on suspicious emails through the web interface and help improve the community database.</p>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">API Documentation</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Authentication</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-gray-800 dark:text-gray-200">
                  POST /api/login/
                  {'\n'}Content-Type: application/json
                  {'\n\n'}
                  {JSON.stringify({
                    username: "user@example.com",
                    password: "password"
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Submit Email</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-gray-800 dark:text-gray-200">
                  POST /api/submit/
                  {'\n'}Content-Type: application/json
                  {'\n'}Authorization: Bearer &lt;token&gt;
                  {'\n\n'}
                  {JSON.stringify({
                    sender_domain: "example.com",
                    date: "2024-01-01",
                    subject: "Email subject",
                    content: "Email content"
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI Prediction</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-gray-800 dark:text-gray-200">
                  POST /api/predict/
                  {'\n'}Content-Type: application/json
                  {'\n'}Authorization: Bearer &lt;token&gt;
                  {'\n\n'}
                  {JSON.stringify({
                    sender_domain: "example.com",
                    subject: "Email subject",
                    content: "Email content"
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Vote on Email</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-gray-800 dark:text-gray-200">
                  POST /api/vote/
                  {'\n'}Content-Type: application/json
                  {'\n'}Authorization: Bearer &lt;token&gt;
                  {'\n\n'}
                  {JSON.stringify({
                    email_id: "123",
                    is_phishing: true
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        );

      case 'extension':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Extension Guide</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Installation</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-800 dark:text-gray-200">
                  <li>Download the .xpi file from the download page</li>
                  <li>Open Thunderbird</li>
                  <li>Go to Tools → Add-ons and Themes</li>
                  <li>Click the gear icon and select "Install Add-on From File"</li>
                  <li>Select the downloaded .xpi file</li>
                  <li>Restart Thunderbird</li>
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-200">
                  <li>AI-powered real-time email analysis using GPT-4</li>
                  <li>Automatic PII redaction for enhanced privacy</li>
                  <li>Visual indicators for suspicious emails</li>
                  <li>One-click reporting of phishing attempts</li>
                  <li>Integration with community voting system</li>
                  <li>Secure storage of user preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Permissions</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-200">
                  <li>Read and modify messages for analysis</li>
                  <li>Access account information for authentication</li>
                  <li>Store local preferences and cached data</li>
                  <li>Connect to local development server</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">How does the AI analysis work?</h3>
                <p className="text-gray-800 dark:text-gray-200">We use GPT-4 to analyze emails for phishing indicators, combined with community voting to improve accuracy over time.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">How is my data protected?</h3>
                <p className="text-gray-800 dark:text-gray-200">All emails are automatically processed through our PII redaction system, removing sensitive information like email addresses, phone numbers, and other personal data before analysis.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">What happens to submitted emails?</h3>
                <p className="text-gray-800 dark:text-gray-200">Submitted emails are redacted, analyzed by our AI system, and added to the community database for voting. Personal information is never stored.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Can I use this with other email clients?</h3>
                <p className="text-gray-800 dark:text-gray-200">Currently, the extension is only available for Mozilla Thunderbird, but you can still use the web interface to contribute to the community database.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Documentation
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'getting-started', label: 'Getting Started' },
                  { id: 'api', label: 'API Documentation' },
                  { id: 'extension', label: 'Extension Guide' },
                  { id: 'faq', label: 'FAQ' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      activeSection === item.id
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
