'use client';

import { useState } from 'react';

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

interface EmailCardProps {
    email: Email;
    onVote: (emailId: number, isPhishing: boolean) => Promise<void>;
    onDelete: (emailId: number) => Promise<void>;
}

export default function EmailCard({ email, onVote, onDelete }: EmailCardProps) {
    const [showUrls, setShowUrls] = useState(false);
    const [showContent, setShowContent] = useState(false);

    // Calculate total number of links from domain count strings
    const totalLinks = email.urls.reduce((total, domainString) => {
        const match = domainString.match(/\((\d+) links?\)/);
        return total + (match ? parseInt(match[1]) : 0);
    }, 0);

    return (
        <div className="bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 rounded-lg shadow-lg p-6 hover:bg-zinc-100 dark:hover:bg-slate-800 transition-colors">
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-slate-100 whitespace-pre-wrap">
                        {email.subject}
                    </h2>
                    {email.is_mine && (
                        <button
                            onClick={() => onDelete(email.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete this email"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
                <p className="text-zinc-800 dark:text-slate-300 mb-2">
                    From: {email.sender_domain}
                </p>
                <div className="mb-4">
                    <button 
                        onClick={() => setShowContent(!showContent)}
                        className="flex items-center text-sm font-semibold mb-2 text-zinc-900 dark:text-slate-200 hover:text-primary transition-colors"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 mr-1 transition-transform ${showContent ? 'rotate-90' : ''}`} 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Email Content
                    </button>
                    {showContent && (
                        <div className="bg-white dark:bg-slate-800 rounded p-3">
                            <p className="text-sm text-zinc-800 dark:text-slate-300 whitespace-pre-wrap">
                                {email.content}
                            </p>
                        </div>
                    )}
                </div>
                {email.urls && email.urls.length > 0 && (
                    <div className="mb-4">
                        <button 
                            onClick={() => setShowUrls(!showUrls)}
                            className="flex items-center text-sm font-semibold mb-2 text-zinc-900 dark:text-slate-200 hover:text-primary transition-colors"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`h-4 w-4 mr-1 transition-transform ${showUrls ? 'rotate-90' : ''}`} 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            Links in Email ({totalLinks})
                        </button>
                        {showUrls && (
                            <div className="bg-white dark:bg-slate-800 rounded p-3">
                                <ul className="space-y-1">
                                    {email.urls.map((domain, index) => (
                                        <li key={index} className="text-sm text-zinc-600 dark:text-slate-400">
                                            {domain}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                    <div className="text-sm text-zinc-800 dark:text-slate-200">
                        <span className="font-medium">Phishing votes:</span>{' '}
                        {email.votes_phishing}
                    </div>
                    <div className="text-sm text-zinc-800 dark:text-slate-200">
                        <span className="font-medium">Legitimate votes:</span>{' '}
                        {email.votes_legitimate}
                    </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                    {email.user_vote && (
                        <div className="text-sm text-zinc-800 dark:text-slate-300">
                            Your current vote: <span className="font-medium">{email.user_vote_type}</span>
                            {email.user_vote_type !== 'phishing' && email.user_vote_type !== 'legitimate' && (
                                <span> (Click to vote)</span>
                            )}
                        </div>
                    )}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onVote(email.id, true)}
                            className={`px-4 py-2 rounded transition-colors ${
                                email.user_vote_type === 'phishing'
                                    ? 'bg-blue-600 text-white font-semibold shadow-md dark:bg-blue-700'
                                    : 'bg-blue-300 hover:bg-blue-400 text-blue-900 dark:bg-blue-500/60 dark:hover:bg-blue-500/80 dark:text-white'
                            }`}
                            disabled={email.user_vote_type === 'phishing'}
                        >
                            {email.user_vote_type === 'phishing' ? 'Current: Phishing' : 'Phishing'}
                        </button>
                        <button
                            onClick={() => onVote(email.id, false)}
                            className={`px-4 py-2 rounded transition-colors ${
                                email.user_vote_type === 'legitimate'
                                    ? 'bg-blue-600 text-white font-semibold shadow-md dark:bg-blue-700'
                                    : 'bg-blue-300 hover:bg-blue-400 text-blue-900 dark:bg-blue-500/60 dark:hover:bg-blue-500/80 dark:text-white'
                            }`}
                            disabled={email.user_vote_type === 'legitimate'}
                        >
                            {email.user_vote_type === 'legitimate' ? 'Current: Legitimate' : 'Legitimate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
