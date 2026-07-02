# El Inge Smart Grids — Microservicios

## Estructura

```
services/
├── quote-service/          # Puerto 8002 - Presupuestos + Cotizaciones
│   ├── main.py            # FastAPI app
│   ├── models.py          # SQLAlchemy models (referencia)
│   ├── schemas.py         # Pydantic schemas
│   ├── database.py        # DB connection (Supabase REST)
│   ├── crud.py            # CRUD operations
│   ├── routers/
│   │   ├── quotes.py      # /api/quotes
│   │   ├── materials.py   # /api/materials
│   │   └── suppliers.py   # /api/suppliers
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── marketplace-service/    # Puerto 8003 - Marketplace de Técnicos
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── crud.py
│   ├── routers/
│   │   ├── technicians.py     # /api/technicians
│   │   ├── certifications.py # /api/certifications
│   │   ├── jobs.py           # /api/jobs
│   │   └── reviews.py        # /api/reviews
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
└── shared/
    ├── config.py          # Config compartida
    └── supabase_client.py # Cliente Supabase REST (httpx)
```

## Endpoints

### Quote Service (Puerto 8002)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/quotes | Crear presupuesto |
| GET | /api/quotes | Listar presupuestos |
| GET | /api/quotes/{id} | Obtener presupuesto |
| PUT | /api/quotes/{id} | Actualizar |
| DELETE | /api/quotes/{id} | Eliminar |
| POST | /api/quotes/{id}/send-to-suppliers | Enviar a proveedores |
| GET | /api/materials | Listar materiales |
| POST | /api/materials | Crear material |
| GET | /api/materials/{id} | Obtener material |
| PUT | /api/materials/{id} | Actualizar material |
| DELETE | /api/materials/{id} | Eliminar material |
| GET | /api/suppliers | Listar proveedores |
| POST | /api/suppliers | Registrar proveedor |
| GET | /api/suppliers/{id} | Obtener proveedor |
| GET | /api/suppliers/{id}/quotes | Cotizaciones de proveedor |

### Marketplace Service (Puerto 8003)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/technicians | Registrar técnico |
| GET | /api/technicians | Listar técnicos (filtros) |
| GET | /api/technicians/{id} | Perfil de técnico |
| PUT | /api/technicians/{id} | Actualizar técnico |
| PUT | /api/technicians/{id}/verify | Verificar técnico |
| GET | /api/technicians/{id}/certifications | Certificaciones |
| POST | /api/certifications | Subir certificación |
| POST | /api/jobs | Crear trabajo |
| GET | /api/jobs | Listar trabajos |
| GET | /api/jobs/{id} | Obtener trabajo |
| PUT | /api/jobs/{id}/assign | Asignar técnico |
| PUT | /api/jobs/{id}/complete | Completar trabajo |
| POST | /api/reviews | Crear reseña |
| GET | /api/reviews | Listar reseñas |
| GET | /api/reviews/{id} | Obtener reseña |

## Base de Datos

Las tablas se crean ejecutando el migration SQL en:
`supabase/migrations/20260702000002_create_microservice_tables.sql`

**Para crear las tablas:**
1. Ir a Supabase Dashboard > SQL Editor
2. Pegar el contenido del archivo migration
3. Ejecutar

### Tablas nuevas (8):
- `technicians` - Perfiles de técnicos
- `certifications` - Certificaciones de técnicos
- `materials` - Catálogo de materiales
- `suppliers` - Proveedores
- `jobs` - Trabajos/solicitudes
- `quotes` - Presupuestos
- `supplier_quotes` - Cotizaciones de proveedores
- `reviews` - Reseñas

## Despliegue

### Local
```bash
cd services/quote-service
pip install -r requirements.txt
export SUPABASE_URL=https://ziwwfjpiegkxpflfpmxs.supabase.co
export SUPABASE_SERVICE_KEY=your-service-key
uvicorn main:app --port 8002
```

### Docker
```bash
cd services/quote-service
docker build -t quote-service .
docker run -p 8002:8002 -e SUPABASE_SERVICE_KEY=your-key quote-service
```
