/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone para Docker y despliegue en VPS
  output: 'standalone',

  // Configuración de imágenes
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },

  // Compresión habilitada
  compress: true,

  // Trailing slashes
  trailingSlash: false,

  // Variables de entorno públicas
  env: {
    APP_NAME: 'ElectriPro',
    APP_VERSION: '1.0.0',
  },
};

export default nextConfig;
