import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import EmailCard from '../EmailCard'

const mockEmail = {
    id: 1,
    sender_domain: 'example.com',
    subject: 'Test Email Subject',
    content: 'Test email content',
    urls: ['example.com (2 links)', 'test.com (1 link)'],
    votes_phishing: 5,
    votes_legitimate: 3,
    user_vote: true,
    user_vote_type: 'legitimate',
    is_mine: true
}

describe('EmailCard', () => {
    const mockOnVote = jest.fn()
    const mockOnDelete = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders email information correctly', () => {
        render(<EmailCard email={mockEmail} onVote={mockOnVote} onDelete={mockOnDelete} />)
        
        expect(screen.getByText('Test Email Subject')).toBeInTheDocument()
        expect(screen.getByText('From: example.com')).toBeInTheDocument()
        expect(screen.getByText('Phishing votes:')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('Legitimate votes:')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('toggles content visibility when clicking content button', async () => {
        const user = userEvent.setup()
        render(<EmailCard email={mockEmail} onVote={mockOnVote} onDelete={mockOnDelete} />)
        
        const contentButton = screen.getByText('Email Content')
        expect(screen.queryByText('Test email content')).not.toBeInTheDocument()
        
        await user.click(contentButton)
        expect(screen.getByText('Test email content')).toBeInTheDocument()
        
        await user.click(contentButton)
        expect(screen.queryByText('Test email content')).not.toBeInTheDocument()
    })

    it('toggles URLs visibility when clicking links button', async () => {
        const user = userEvent.setup()
        render(<EmailCard email={mockEmail} onVote={mockOnVote} onDelete={mockOnDelete} />)
        
        const linksButton = screen.getByText(/Links in Email/)
        expect(screen.queryByText('example.com (2 links)')).not.toBeInTheDocument()
        
        await user.click(linksButton)
        expect(screen.getByText('example.com (2 links)')).toBeInTheDocument()
        expect(screen.getByText('test.com (1 link)')).toBeInTheDocument()
        
        await user.click(linksButton)
        expect(screen.queryByText('example.com (2 links)')).not.toBeInTheDocument()
    })

    it('calls onVote when voting buttons are clicked', async () => {
        const user = userEvent.setup()
        render(<EmailCard email={mockEmail} onVote={mockOnVote} onDelete={mockOnDelete} />)
        
        const phishingButton = screen.getByText('Phishing')
        await user.click(phishingButton)
        expect(mockOnVote).toHaveBeenCalledWith(1, true)

        const legitimateButton = screen.getByText('Current: Legitimate')
        expect(legitimateButton).toBeDisabled()
    })

    it('shows delete button only for owned emails and calls onDelete', async () => {
        const user = userEvent.setup()
        
        // First render with non-owned email
        const nonOwnedEmail = { ...mockEmail, is_mine: false }
        const { rerender } = render(
            <EmailCard 
                email={nonOwnedEmail} 
                onVote={mockOnVote} 
                onDelete={mockOnDelete} 
            />
        )
        
        expect(screen.queryByTitle('Delete this email')).not.toBeInTheDocument()

        // Then render with owned email
        rerender(
            <EmailCard 
                email={mockEmail} 
                onVote={mockOnVote} 
                onDelete={mockOnDelete} 
            />
        )
        
        const deleteButton = screen.getByTitle('Delete this email')
        expect(deleteButton).toBeInTheDocument()
        
        await user.click(deleteButton)
        expect(mockOnDelete).toHaveBeenCalledWith(1)
    })
})
