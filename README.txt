gephiltephish v0
By: Dan Vaccaro

A community-driven platform for phishing reporting and detection via OpenAI's GPT model.

## Setup

### Environment Variables

The backend requires the following environment variables in `backend/.env`:

```bash
DJANGO_SECRET_KEY=your-django-secret-key
DJANGO_DEBUG=False
OPENAI_API_KEY=your-openai-api-key
```

Make sure to replace `your-openai-api-key` with your actual OpenAI API key. You can obtain an API key from the [OpenAI platform](https://platform.openai.com/api-keys).

### Dependencies

The backend uses pipenv for dependency management. Install dependencies with:
```bash
cd backend
pipenv install
```

## Testing

The project includes comprehensive test suites for all three components: frontend, backend, and browser extension.

### Running Tests

You can run all tests using the provided script:
```bash
./test-all.sh
```

Or run tests for individual components:

#### Frontend Tests (Next.js/React)
```bash
cd frontend/gephiltephish
npm test                # Run tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

The frontend uses Jest and React Testing Library for:
- Component testing
- User interaction simulation
- DOM assertions
- Snapshot testing

#### Backend Tests (Django/Python)
```bash
cd backend
python -m pytest       # Run all tests
python -m pytest -v    # Run with verbose output
python -m pytest --cov # Run with coverage report
```

The backend uses pytest and Django's test framework for:
- API endpoint testing
- Model testing
- Authentication testing
- Database operations testing

#### Extension Tests (JavaScript)
```bash
cd extension
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

The browser extension uses Jest for:
- Unit testing of utility functions
- HTML preprocessing testing
- URL extraction testing
- DOM manipulation testing

### Test Structure

- Frontend tests are located in `frontend/gephiltephish/app/**/__tests__/`
- Backend tests are located in `backend/api/tests/`
- Extension tests are located in `extension/tests/`

### Writing Tests

#### Frontend Component Tests
Tests for React components should:
- Test component rendering
- Test user interactions
- Test state changes
- Test prop changes
- Use meaningful assertions

Example:
```javascript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import YourComponent from '../YourComponent'

describe('YourComponent', () => {
    it('should render correctly', () => {
        render(<YourComponent />)
        expect(screen.getByText('Expected Text')).toBeInTheDocument()
    })
})
```

#### Backend API Tests
Tests for API endpoints should:
- Test authentication
- Test request validation
- Test response format
- Test error handling
- Use appropriate status codes

Example:
```python
def test_api_endpoint(authenticated_client):
    response = authenticated_client.get('/api/endpoint/')
    assert response.status_code == 200
    assert 'expected_key' in response.data
```

#### Extension Tests
Tests for extension functionality should:
- Test input validation
- Test data transformation
- Test URL processing
- Test HTML handling
- Handle edge cases

Example:
```javascript
describe('preprocessEmailBody', () => {
    it('should handle valid input', () => {
        const result = preprocessEmailBody('<div>Test</div>')
        expect(result).toBe('Test')
    })
})
```

### Continuous Integration

The test-all.sh script can be used in CI/CD pipelines to ensure all components pass their tests before deployment.

### Coverage Requirements

Aim for:
- Frontend: >80% coverage
- Backend: >90% coverage
- Extension: >85% coverage

Run coverage reports regularly to identify areas needing additional test coverage.
