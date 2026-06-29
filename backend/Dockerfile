# python:3.11-slim — smaller image (~200MB vs ~900MB full), faster Railway deploys
FROM python:3.11-slim

WORKDIR /app

# gcc needed to compile C extensions (cryptography, grpcio used by google-generativeai)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy only the backend folder contents into the container
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

# --workers 2: SSE endpoints hold long-lived connections.
# A single worker blocks ALL other requests while streaming.
# Railway injects $PORT dynamically — must use it or health check will fail
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
