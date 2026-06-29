# Use python:3.11-slim for a smaller image (~200MB vs ~900MB full),
# which results in faster Railway deploys and lower memory usage.

FROM python:3.11-slim

WORKDIR /app

# gcc is required to compile certain Python C extensions
# (e.g., cryptography, grpcio used by google-generativeai).
# Removed after install to keep image lean.
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# --workers 2 is required because SSE endpoints hold long-lived connections.
# A single worker would block ALL other requests while streaming.
# Two workers allow SSE + regular API calls to run concurrently.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
