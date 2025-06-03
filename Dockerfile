# Use the official Python base image from Docker Hub
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code into the container
COPY . .

# Expose the port your app runs on (e.g., 8000 for FastAPI or Flask)
EXPOSE 8000

# Command to run the application
# (adjust according to the framework you're using, e.g., FastAPI, Flask, etc.)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]