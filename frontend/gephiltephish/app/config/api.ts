// Custom error classes for different scenarios
export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export class AuthenticationError extends ApiError {
    constructor(message = 'Authentication required') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

export class DuplicateVoteError extends ApiError {
    constructor(message = 'You have already voted this way for this email') {
        super(message, 409);
        this.name = 'DuplicateVoteError';
    }
}

const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/login/`,
    REGISTER: `${API_BASE_URL}/register/`,
    LOGOUT: `${API_BASE_URL}/logout/`,
    GET_EMAILS: `${API_BASE_URL}/get_emails/`,
    VOTE: `${API_BASE_URL}/vote/`,
    DELETE_EMAIL: (id: number) => `${API_BASE_URL}/delete_email/${id}/`,
};

// Helper function to get user-friendly error message
const getErrorMessage = (error: any, status: number): string => {
    if (error?.message) {
        return error.message;
    }

    switch (status) {
        case 400:
            return 'Invalid request. Please check your input.';
        case 401:
            return 'Please log in to continue.';
        case 403:
            return 'You do not have permission to perform this action.';
        case 404:
            return 'The requested resource was not found.';
        case 409:
            return 'This action conflicts with an existing record.';
        case 429:
            return 'Too many requests. Please try again later.';
        case 500:
            return 'An internal server error occurred. Please try again later.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    
    // Default options for all requests
    const defaultOptions: RequestInit = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    // Merge default options with provided options
    const mergedOptions: RequestInit = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(token ? { 'Authorization': `Token ${token}` } : {}),
            ...(options.headers || {}),
        },
    };

    try {
        const response = await fetch(endpoint, mergedOptions);

        // Handle no content responses
        if (response.status === 204) {
            return null;
        }

        // Parse response data
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (error) {
                throw new ApiError('Invalid response format from server', 500);
            }
        }

        // Handle different error scenarios
        if (!response.ok) {
            const errorMessage = data?.error || getErrorMessage(data, response.status);

            switch (response.status) {
                case 401:
                    throw new AuthenticationError(errorMessage);
                case 409:
                    if (endpoint.includes('/vote/')) {
                        throw new DuplicateVoteError(errorMessage);
                    }
                    throw new ApiError(errorMessage, 409);
                default:
                    throw new ApiError(errorMessage, response.status);
            }
        }

        return data;
    } catch (error) {
        // Log error for debugging but throw a cleaned version
        console.error('API request failed:', {
            endpoint,
            error,
            timestamp: new Date().toISOString()
        });

        // Re-throw API errors as-is
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new ApiError('Network error. Please check your connection.', 0);
        }

        // Handle any other unexpected errors
        throw new ApiError('An unexpected error occurred. Please try again.', 500);
    }
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    try {
        return await apiRequest(url, options);
    } catch (error) {
        // Handle token expiration
        if (error instanceof AuthenticationError) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw error;
        }
        throw error;
    }
};
