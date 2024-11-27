'use client';

interface LoadingStateProps {
    message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">{message}</h1>
            </div>
        </div>
    );
}
