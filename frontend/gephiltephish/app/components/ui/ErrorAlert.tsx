'use client';

interface ErrorAlertProps {
    message: string;
    type: 'error' | 'warning' | 'info';
}

export default function ErrorAlert({ message, type }: ErrorAlertProps) {
    const getErrorStyles = (type: ErrorAlertProps['type']) => {
        switch (type) {
            case 'error':
                return 'bg-red-100 border-red-400 text-red-700';
            case 'warning':
                return 'bg-yellow-100 border-yellow-400 text-yellow-700';
            case 'info':
                return 'bg-blue-100 border-blue-400 text-blue-700';
            default:
                return 'bg-red-100 border-red-400 text-red-700';
        }
    };

    return (
        <div className={`border px-4 py-3 rounded mb-4 ${getErrorStyles(type)}`}>
            {message}
        </div>
    );
}
