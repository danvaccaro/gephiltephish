# Use Python slim image
FROM python:3.9-slim

# Set the working directory
WORKDIR /backend

# Create a user and switch to it (optional, but good for security)
RUN useradd -m appuser
USER appuser

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY --chown=appuser:appuser . .

# Expose the port
EXPOSE 5000

# Run wait-for-it.sh to wait for PostgreSQL to be ready, then run the app
CMD ["./wait-for-it.sh", "db:5432", "--", "python", "manage.py", "runserver", "0.0.0.0:5000"]