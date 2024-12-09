GephiltePhish - Email Phishing Detection System

Environment Variables Configuration
--------------------------------

Backend (.env):
Required variables:
- DJANGO_SECRET_KEY: Django secret key for security
- DJANGO_DEBUG: Set to 'True' for development, 'False' for production
- OPENAI_API_KEY: Your OpenAI API key
- OPENAI_ORG_ID: Your OpenAI organization ID
- OPENAI_MODEL_NAME: OpenAI model to use (default: gpt-4o-mini)
- OPENAI_RATE_LIMIT_WINDOW: Rate limit window in seconds (default: 60)
- OPENAI_MAX_REQUESTS_PER_WINDOW: Maximum requests per window (default: 50)
- OPENAI_COOLDOWN_DELAY: Delay between requests in seconds (default: 1)
- API_HOST: API host (default: localhost)
- API_PORT: API port (default: 8000)

Frontend (.env):
Required variables:
- NEXT_PUBLIC_API_BASE_URL: Backend API URL (default: http://localhost:8000/api)

Extension Configuration:
The extension uses a config.js file for configuration. To modify settings, edit the values in extension/config.js:
- API_BASE_URL: Backend API URL (default: http://localhost:8000/api)
- Window dimensions for different views (prediction, popup, redaction)

Setup Instructions
----------------
1. For backend and frontend, copy the example .env files to create your own:
   ```
   cp backend/.env.example backend/.env
   cp frontend/gephiltephish/.env.example frontend/gephiltephish/.env
   ```

2. Update the .env files with your specific configuration values.

3. For the extension, modify config.js if you need to change any default values.

4. Install dependencies:
   ```
   # Backend
   cd backend
   pipenv install

   # Frontend
   cd frontend/gephiltephish
   npm install

   # Extension
   cd extension
   npm install
   ```

5. Start the services:
   ```
   # Backend
   cd backend
   pipenv run python manage.py runserver

   # Frontend
   cd frontend/gephiltephish
   npm run dev

   # Extension
   # Load the extension in Thunderbird
