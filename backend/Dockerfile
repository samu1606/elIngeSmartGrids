FROM python:3.11-slim

WORKDIR /app

# Instalamos dependencias del sistema necesarias si las hay
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el archivo de requerimientos primero para aprovechar la caché
COPY requirements.txt .

# Instalamos todas las librerías de Python (incluyendo httpx)
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el código de la app hacia el contenedor
COPY . .

# Exponemos el puerto de FastAPI
EXPOSE 8000

# Comando para arrancar uvicorn apuntando al main.py
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-server-header", "--no-date-header"]