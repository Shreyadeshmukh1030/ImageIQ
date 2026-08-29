FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
# We copy ml and backend because backend depends on ml
COPY ml /ml
COPY backend /app

# Expose port
EXPOSE 8000

# Set Python path so backend can import ml module
ENV PYTHONPATH=/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
