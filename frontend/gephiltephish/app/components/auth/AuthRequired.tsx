'use client';

import Link from 'next/link';

interface AuthRequiredProps {
    message?: string;
    redirectPath?: string;
}

export default function AuthRequired({ 
    message = 'Please log in to access this page.',
    redirectPath = '/login'
}: AuthRequiredProps) {
    const loginPath = redirectPath.startsWith('/login') 
        ? redirectPath 
        : `/login?redirect=${redirectPath}`;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                <p className="text-muted-foreground mb-6">
                    {message}
                </p>
                <Link 
                    href={loginPath}
                    className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90 transition-colors"
                >
                    Log In
                </Link>
            </div>
        </div>
    );
}
