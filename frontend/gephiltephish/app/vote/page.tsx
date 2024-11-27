'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, apiRequest, ApiError, DuplicateVoteError, AuthenticationError } from '../config/api';
import EmailCard from '../components/email/EmailCard';
import FilterControls from '../components/email/FilterControls';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingState from '../components/ui/LoadingState';
import AuthRequired from '../components/auth/AuthRequired';

interface Email {
    id: number;
    sender_domain: string;
    subject: string;
    content: string;
    urls: string[];
    votes_phishing: number;
    votes_legitimate: number;
    user_vote: boolean;
    user_vote_type: string | null;
    is_mine: boolean;
}

interface ErrorState {
    message: string;
    type: 'error' | 'warning' | 'info';
}

export default function VotePage() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorState | null>(null);
    const [showMineOnly, setShowMineOnly] = useState(false);
    const [showUnvotedOnly, setShowUnvotedOnly] = useState(false);
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (user && !isLoading) {
            fetchEmails();
        }
    }, [user, isLoading, showMineOnly, showUnvotedOnly]);

    const handleError = (err: unknown) => {
        if (err instanceof DuplicateVoteError) {
            setError({
                message: err.message,
                type: 'warning'
            });
        } else if (err instanceof AuthenticationError) {
            setError({
                message: 'Please log in again to continue.',
                type: 'info'
            });
        } else if (err instanceof ApiError) {
            setError({
                message: err.message,
                type: 'error'
            });
        } else {
            setError({
                message: 'An unexpected error occurred. Please try again.',
                type: 'error'
            });
        }
        console.error('Operation failed:', err);
    };

    const fetchEmails = async () => {
        try {
            const params = new URLSearchParams();
            if (showMineOnly) params.append('show_mine', 'true');
            if (showUnvotedOnly) params.append('show_unvoted', 'true');
            
            const data = await apiRequest(`${API_ENDPOINTS.GET_EMAILS}?${params.toString()}`, {
                method: 'GET',
            });
            setEmails(data);
            setError(null);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (emailId: number, isPhishing: boolean) => {
        try {
            await apiRequest(API_ENDPOINTS.VOTE, {
                method: 'POST',
                body: JSON.stringify({
                    email_id: emailId,
                    is_phishing: isPhishing,
                }),
            });
            await fetchEmails();
            setError(null);
        } catch (err) {
            handleError(err);
            if (!(err instanceof DuplicateVoteError)) {
                await fetchEmails();
            }
        }
    };

    const handleDelete = async (emailId: number) => {
        if (!confirm('Are you sure you want to delete this email? This action cannot be undone.')) {
            return;
        }

        try {
            await apiRequest(API_ENDPOINTS.DELETE_EMAIL(emailId), {
                method: 'DELETE',
            });
            await fetchEmails();
            setError(null);
        } catch (err) {
            handleError(err);
        }
    };

    if (isLoading) {
        return <LoadingState />;
    }

    if (!user) {
        return (
            <AuthRequired 
                message="Please log in to access the voting page and help identify phishing emails."
                redirectPath="/vote"
            />
        );
    }

    if (loading) {
        return <LoadingState message="Loading emails..." />;
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vote on Emails</h1>
                    <FilterControls
                        showMineOnly={showMineOnly}
                        showUnvotedOnly={showUnvotedOnly}
                        onShowMineOnlyChange={setShowMineOnly}
                        onShowUnvotedOnlyChange={setShowUnvotedOnly}
                    />
                </div>
                
                {error && (
                    <ErrorAlert
                        message={error.message}
                        type={error.type}
                    />
                )}

                <div className="space-y-4">
                    {emails.map((email) => (
                        <EmailCard
                            key={email.id}
                            email={email}
                            onVote={handleVote}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
