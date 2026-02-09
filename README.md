# ⚡ ElectriPro

**Software Profesional para Electricistas e Instaladores**

![ElectriPro Logo](https://img.shields.io/badge/ElectriPro-v1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![License](https://img.shields.io/badge/License-Private-red)

## 🚀 Descripción

ElectriPro es una plataforma SaaS todo-en-uno para profesionales de instalaciones eléctricas. Incluye:

- 📊 **Dashboard Analytics** - Métricas de tu negocio en tiempo real
- 🔢 **Calculadora Eléctrica** - Cálculos según REBT e IEC
- 📁 **Gestión de Proyectos** - Organiza todas tus instalaciones
- 👥 **CRM de Clientes** - Gestiona tu cartera de clientes
- 📋 **Presupuestos y Facturas** - Genera documentos profesionales
- 📅 **Agenda** - Programa citas y mantenimientos

## 🛠️ Tecnologías

- **Framework:** Next.js 16
- **Styling:** Tailwind CSS 4
- **Despliegue:** Docker / VPS

## 📦 Instalación Local

### Prerrequisitos
- Node.js 20+
- npm o yarn

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd electripro
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🐳 Despliegue con Docker

### Build y ejecutar localmente
```bash
# Construir la imagen
docker build -t electripro .

# Ejecutar el contenedor
docker run -p 3000:3000 electripro
```

### Con Docker Compose
```bash
docker-compose up -d
```

## 🌐 Despliegue en VPS (Hostinger)

### Opción 1: Con Docker

1. **Conectarse al VPS por SSH**
   ```bash
   ssh root@tu-ip-hostinger
   ```

2. **Instalar Docker (si no está instalado)**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Clonar y desplegar**
   ```bash
   git clone <repo-url>
   cd electripro
   docker-compose up -d
   ```

4. **Configurar nginx como reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name electripro.tudominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Configurar SSL con Certbot**
   ```bash
   sudo certbot --nginx -d electripro.tudominio.com
   ```

### Opción 2: Sin Docker (Node.js directo)

1. **Instalar Node.js 20**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clonar y construir**
   ```bash
   git clone <repo-url>
   cd electripro
   npm install
   npm run build
   ```

3. **Ejecutar con PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "electripro" -- start
   pm2 save
   pm2 startup
   ```

## 📁 Estructura del Proyecto

```
electripro/
├── src/
│   ├── app/
│   │   ├── page.js           # Landing page
│   │   ├── dashboard/        # Dashboard principal
│   │   ├── calculator/       # Calculadora eléctrica
│   │   ├── projects/         # Gestión de proyectos
│   │   ├── clients/          # CRM de clientes
│   │   ├── quotes/          # Presupuestos
│   │   └── api/              # API endpoints
│   └── components/           # Componentes reutilizables
├── public/                   # Assets estáticos
├── Dockerfile               # Configuración Docker
├── docker-compose.yml       # Docker Compose
└── package.json
```

## 📊 Características de la Calculadora

| Herramienta | Descripción |
|-------------|-------------|
| Sección de Cable | Calcula la sección mínima por intensidad y caída de tensión |
| Caída de Tensión | Verifica cumplimiento REBT (3% alumbrado, 5% fuerza) |
| Potencia | Calcula P activa, reactiva y aparente |
| Cortocircuito | Estima Icc en cualquier punto de la instalación |

## 💰 Modelo de Monetización

| Plan | Precio | Características |
|------|--------|-----------------|
| **Starter** | Gratis | 5 proyectos, calculadora básica |
| **Professional** | $29/mes | Ilimitado, facturación, reportes |
| **Enterprise** | $79/mes | Multi-usuario, API, white-label |

## 🔒 Seguridad

- Autenticación JWT implementable
- HTTPS obligatorio en producción
- Variables de entorno para credenciales

## 📞 Soporte

Para soporte técnico, contactar a: soporte@electripro.com

## 📄 Licencia

Este software es propietario y confidencial.
© 2026 ElectriPro. Todos los derechos reservados.
