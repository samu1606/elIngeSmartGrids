import { Inter, Outfit } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata = {
  title: 'ElectriPro | Software Profesional para Electricistas',
  description: 'Plataforma SaaS para profesionales de instalaciones eléctricas. Gestiona proyectos, calcula secciones de cables, genera presupuestos y facturas, todo desde una sola plataforma.',
  keywords: 'electricista, software electricistas, gestión proyectos eléctricos, calculadora eléctrica, presupuestos electricidad, SaaS electricistas',
  authors: [{ name: 'ElectriPro' }],
  openGraph: {
    title: 'ElectriPro | Software Profesional para Electricistas',
    description: 'La plataforma todo-en-uno para profesionales de instalaciones eléctricas',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
