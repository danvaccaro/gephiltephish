export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            GephiltePhish for Thunderbird
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Protect yourself from phishing attempts directly in your email client
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Notice</h3>
              <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                This extension is currently unverified by Mozilla. When installing, you may see a security warning. This is normal for developer-distributed extensions. We are in the process of obtaining official verification.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Key Features
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">Real-time phishing detection</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">Seamless Thunderbird integration</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">Community-driven protection</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">Regular security updates</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Download Now
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <a
                  href="/extension/gephiltephish.zip"
                  className="block w-full bg-indigo-600 text-white text-center py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700 mb-4 transition-colors"
                >
                  Download Extension
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Version 1.0.0 | Compatible with Thunderbird 91+
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Installation Instructions
            </h2>
            <ol className="space-y-4">
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center mr-3">
                  1
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  Download and extract the GephiltePhish zip file, which contains the extension file (.xpi)
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center mr-3">
                  2
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  Open Thunderbird and go to Tools → Add-ons and Themes
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center mr-3">
                  3
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  Click the gear icon and select &quot;Install Add-on From File&quot;
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center mr-3">
                  4
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  Select the extracted .xpi file and click &quot;Add&quot;
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center mr-3">
                  5
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  When prompted with a security warning, click &quot;Continue Installation&quot;. This warning appears because the extension is currently unverified.
                </div>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center mr-3">
                  6
                </span>
                <div className="text-gray-700 dark:text-gray-300">
                  Restart Thunderbird to complete the installation
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About Unverified Extensions</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Mozilla requires extensions to go through a verification process before they can be installed without warnings. While GephiltePhish is currently unverified:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>The extension is open source and can be inspected on our GitHub repository</li>
              <li>We are actively working on obtaining official verification from Mozilla</li>
              <li>The warning is a standard security measure for developer-distributed extensions</li>
              <li>The extension's functionality is not affected by its verification status</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 dark:border-blue-500 p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Need help? Contact our support team or visit our documentation for detailed installation guides.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
