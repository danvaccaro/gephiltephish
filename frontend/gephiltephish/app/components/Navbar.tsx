'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300';
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-8">
              <Image
                src="/logo.png"
                alt="GephiltePhish Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">GephiltePhish</span>
            </Link>
          </div>
          
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link 
              href="/"
              className={`${isActive('/')} hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors`}
            >
              Home
            </Link>
            <Link 
              href="/docs"
              className={`${isActive('/docs')} hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors`}
            >
              Docs
            </Link>
            <Link 
              href="/download"
              className={`${isActive('/download')} hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors`}
            >
              Download
            </Link>
            <Link 
              href="/vote"
              className={`${isActive('/vote')} hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors`}
            >
              Vote
            </Link>
            <div className="flex items-center space-x-4 ml-4 border-l pl-4 dark:border-gray-700">
              {!isLoading && (
                user ? (
                  <>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user.username}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login"
                      className={`${isActive('/login')} hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors`}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/register"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Register
                    </Link>
                  </>
                )
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
