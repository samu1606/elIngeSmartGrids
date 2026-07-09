/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone para Docker y despliegue en VPS
  output: 'standalone',

  // Remover header que revela el stack
  poweredByHeader: false,

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

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://elingesmartgrids.cloud' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
