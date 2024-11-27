import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="GephiltePhish Logo"
              width={120}
              height={120}
              priority
              className="dark:filter dark:brightness-90"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to GephiltePhish
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Help improve email security by identifying phishing attempts
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
          {/* Login Card */}
          <a
            href="/login"
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Login</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Already have an account? Sign in to access your dashboard.
              </p>
            </div>
          </a>

          {/* Register Card */}
          <a
            href="/register"
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Register</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                New to GephiltePhish? Create an account to get started.
              </p>
            </div>
          </a>

          {/* Vote Card */}
          <a
            href="/vote"
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Vote</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Help identify phishing emails by voting on suspicious messages.
              </p>
            </div>
          </a>

          {/* Download Card */}
          <a
            href="/download"
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Download</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Get our Thunderbird extension for real-time phishing protection.
              </p>
            </div>
          </a>

          {/* Documentation Card */}
          <a
            href="/docs"
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Docs</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Learn how to use GephiltePhish and integrate with our API.
              </p>
            </div>
          </a>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            About GephiltePhish
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            GephiltePhish is a community-driven platform that helps improve email security
            by collecting human insights on potential phishing attempts. By participating,
            you contribute to building better email security systems and protecting users
            from malicious attacks.
          </p>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                Secure
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your data is protected
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                Simple
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Easy to participate
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                Impactful
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Help protect others
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
