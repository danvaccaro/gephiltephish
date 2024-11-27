import './globals.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialTheme() {
                  const persistedTheme = localStorage.getItem('theme');
                  const hasPersistedPreference = typeof persistedTheme === 'string';

                  if (hasPersistedPreference) {
                    return persistedTheme;
                  }

                  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                  const hasMediaQueryPreference = typeof mediaQuery.matches === 'boolean';

                  if (hasMediaQueryPreference) {
                    return mediaQuery.matches ? 'dark' : 'light';
                  }

                  return 'light';
                }

                const theme = getInitialTheme();
                
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }

                // Set initial color scheme meta tag
                const meta = document.createElement('meta');
                meta.name = 'color-scheme';
                meta.content = theme === 'dark' ? 'dark' : 'light';
                document.head.appendChild(meta);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
