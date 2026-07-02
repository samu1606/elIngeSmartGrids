FROM python:3.12-slim

WORKDIR /app

COPY services/shared /app/shared
COPY services/marketplace-service/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY services/marketplace-service /app

EXPOSE 8007

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8007"]