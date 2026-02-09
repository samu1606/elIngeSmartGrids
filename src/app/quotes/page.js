'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
)

const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
)

const DownloadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
)

const SendIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
)

const CopyIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
)

export default function QuotesPage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showNewModal, setShowNewModal] = useState(false)
    const [showPreview, setShowPreview] = useState(null)

    const quotes = [
        {
            id: 'P-2026-001',
            client: 'Industrias García S.L.',
            project: 'Ampliación Cuadro General',
            date: '05 Feb 2026',
            validUntil: '05 Mar 2026',
            status: 'Pendiente',
            statusColor: 'badge-warning',
            subtotal: 4500,
            iva: 945,
            total: 5445,
            items: [
                { description: 'Cuadro eléctrico 400A', qty: 1, price: 1200 },
                { description: 'Interruptor automático 4P 250A', qty: 2, price: 450 },
                { description: 'Cable RZ1-K 0.6/1kV 4x95mm²', qty: 50, price: 28 },
                { description: 'Mano de obra instalación', qty: 16, price: 45 }
            ]
        },
        {
            id: 'P-2026-002',
            client: 'María López',
            project: 'Instalación domótica',
            date: '03 Feb 2026',
            validUntil: '03 Mar 2026',
            status: 'Aceptado',
            statusColor: 'badge-success',
            subtotal: 2800,
            iva: 588,
            total: 3388,
            items: []
        },
        {
            id: 'P-2026-003',
            client: 'TechCorp S.A.',
            project: 'Instalación SAI 30kVA',
            date: '01 Feb 2026',
            validUntil: '01 Mar 2026',
            status: 'Enviado',
            statusColor: 'badge-info',
            subtotal: 8500,
            iva: 1785,
            total: 10285,
            items: []
        },
        {
            id: 'P-2026-004',
            client: 'Hotel Marina 5*',
            project: 'Mantenimiento Anual',
            date: '28 Ene 2026',
            validUntil: '28 Feb 2026',
            status: 'Rechazado',
            statusColor: 'badge-danger',
            subtotal: 18000,
            iva: 3780,
            total: 21780,
            items: []
        },
        {
            id: 'P-2026-005',
            client: 'Restaurante El Mar',
            project: 'Instalación cocina industrial',
            date: '25 Ene 2026',
            validUntil: '25 Feb 2026',
            status: 'Aceptado',
            statusColor: 'badge-success',
            subtotal: 4500,
            iva: 945,
            total: 5445,
            items: []
        },
        {
            id: 'P-2026-006',
            client: 'Comunidad Residencial Sol',
            project: 'Instalación fotovoltaica 10kW',
            date: '20 Ene 2026',
            validUntil: '20 Feb 2026',
            status: 'Pendiente',
            statusColor: 'badge-warning',
            subtotal: 15000,
            iva: 3150,
            total: 18150,
            items: []
        }
    ]

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch = quote.client.toLowerCase().includes(search.toLowerCase()) ||
            quote.project.toLowerCase().includes(search.toLowerCase()) ||
            quote.id.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' ||
            quote.status.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
    })

    const stats = [
        { label: 'Total Presupuestos', value: quotes.length, icon: '📋', color: 'from-blue-500 to-cyan-500' },
        { label: 'Pendientes', value: quotes.filter(q => q.status === 'Pendiente' || q.status === 'Enviado').length, icon: '⏳', color: 'from-amber-500 to-orange-500' },
        { label: 'Aceptados', value: quotes.filter(q => q.status === 'Aceptado').length, icon: '✅', color: 'from-green-500 to-emerald-500' },
        { label: 'Valor Total', value: `€${quotes.filter(q => q.status === 'Aceptado').reduce((acc, q) => acc + q.total, 0).toLocaleString()}`, icon: '💰', color: 'from-purple-500 to-pink-500' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            <Sidebar />

            <main className="main-content">
                <Header
                    title="Presupuestos"
                    subtitle="Gestiona tus cotizaciones y propuestas"
                />

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{stat.icon}</span>
                                <div>
                                    <p className="text-gray-400 text-sm">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Actions */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar presupuestos..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="input-field pl-10 w-full sm:w-64"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <SearchIcon />
                                </div>
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="select-field w-full sm:w-40"
                            >
                                <option value="all">Todos</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="enviado">Enviado</option>
                                <option value="aceptado">Aceptado</option>
                                <option value="rechazado">Rechazado</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setShowNewModal(true)}
                            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            <PlusIcon />
                            Nuevo Presupuesto
                        </button>
                    </div>
                </div>

                {/* Quotes List */}
                <div className="glass-card overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nº Presupuesto</th>
                                <th>Cliente</th>
                                <th>Proyecto</th>
                                <th>Fecha</th>
                                <th>Válido hasta</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotes.map((quote) => (
                                <tr key={quote.id}>
                                    <td>
                                        <span className="text-white font-mono font-medium">{quote.id}</span>
                                    </td>
                                    <td className="text-white">{quote.client}</td>
                                    <td className="text-gray-400">{quote.project}</td>
                                    <td className="text-gray-400 text-sm">{quote.date}</td>
                                    <td className="text-gray-400 text-sm">{quote.validUntil}</td>
                                    <td className="text-white font-semibold">€{quote.total.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${quote.statusColor}`}>{quote.status}</span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowPreview(quote)}
                                                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300"
                                                title="Ver"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300"
                                                title="Descargar PDF"
                                            >
                                                <DownloadIcon />
                                            </button>
                                            <button
                                                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                                                title="Enviar"
                                            >
                                                <SendIcon />
                                            </button>
                                            <button
                                                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300"
                                                title="Duplicar"
                                            >
                                                <CopyIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Conversion Rate */}
                <div className="mt-6 glass-card p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Tasa de Conversión</h3>
                            <p className="text-gray-400 text-sm">Presupuestos aceptados vs enviados este mes</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-green-400">67%</p>
                                <p className="text-gray-400 text-sm">Aceptados</p>
                            </div>
                            <div className="w-32 h-32 relative">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="40" fill="none"
                                        stroke="url(#gradient)" strokeWidth="8"
                                        strokeDasharray="251.2" strokeDashoffset="82.9"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="#0ea5e9" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">67%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quote Preview Modal */}
                {showPreview && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-card w-full max-w-3xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">Presupuesto {showPreview.id}</h2>
                                <button
                                    onClick={() => setShowPreview(null)}
                                    className="p-2 rounded-lg hover:bg-slate-700 text-gray-400"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Quote Header */}
                            <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                ⚡
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">ElectriPro</h3>
                                                <p className="text-gray-400 text-sm">Instalaciones Eléctricas</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{showPreview.id}</p>
                                        <span className={`badge ${showPreview.statusColor}`}>{showPreview.status}</span>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Cliente</p>
                                        <p className="text-white font-semibold">{showPreview.client}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Proyecto</p>
                                        <p className="text-white font-semibold">{showPreview.project}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Fecha</p>
                                        <p className="text-white">{showPreview.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Válido hasta</p>
                                        <p className="text-white">{showPreview.validUntil}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quote Items */}
                            {showPreview.items.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-white font-semibold mb-4">Detalle</h4>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Descripción</th>
                                                <th className="text-right">Cantidad</th>
                                                <th className="text-right">Precio Unit.</th>
                                                <th className="text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {showPreview.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="text-gray-300">{item.description}</td>
                                                    <td className="text-right text-gray-400">{item.qty}</td>
                                                    <td className="text-right text-gray-400">€{item.price}</td>
                                                    <td className="text-right text-white font-medium">€{(item.qty * item.price).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Totals */}
                            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">€{showPreview.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                                    <span className="text-gray-400">IVA (21%)</span>
                                    <span className="text-white">€{showPreview.iva.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-white font-semibold text-lg">Total</span>
                                    <span className="text-2xl font-bold text-green-400">€{showPreview.total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium flex items-center justify-center gap-2">
                                    <DownloadIcon /> Descargar PDF
                                </button>
                                <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                                    <SendIcon /> Enviar al Cliente
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Quote Modal */}
                {showNewModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-card w-full max-w-2xl p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">Nuevo Presupuesto</h2>
                                <button
                                    onClick={() => setShowNewModal(false)}
                                    className="p-2 rounded-lg hover:bg-slate-700 text-gray-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Cliente</label>
                                        <select className="select-field">
                                            <option>Seleccionar cliente...</option>
                                            <option>Industrias García S.L.</option>
                                            <option>María López</option>
                                            <option>TechCorp S.A.</option>
                                            <option>Hotel Marina 5*</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Proyecto (opcional)</label>
                                        <select className="select-field">
                                            <option>Seleccionar o nuevo...</option>
                                            <option>Nuevo proyecto</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Título/Descripción</label>
                                    <input type="text" className="input-field" placeholder="Ej: Instalación cuadro eléctrico" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Fecha</label>
                                        <input type="date" className="input-field" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div>
                                        <label className="label">Validez (días)</label>
                                        <input type="number" className="input-field" defaultValue="30" />
                                    </div>
                                </div>

                                {/* Items Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="label mb-0">Partidas</label>
                                        <button className="text-sm text-blue-400 hover:text-blue-300">
                                            + Añadir partida
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-4 rounded-xl bg-slate-800/50">
                                            <div className="grid grid-cols-12 gap-3">
                                                <input type="text" className="input-field col-span-6" placeholder="Descripción" />
                                                <input type="number" className="input-field col-span-2" placeholder="Uds" />
                                                <input type="number" className="input-field col-span-2" placeholder="€/ud" />
                                                <div className="col-span-2 flex items-center justify-between">
                                                    <span className="text-white font-medium">€0.00</span>
                                                    <button className="text-red-400 hover:text-red-300">✕</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="p-4 rounded-xl bg-slate-800/50">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="text-white">€0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-400">IVA (21%)</span>
                                        <span className="text-white">€0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-t border-slate-700">
                                        <span className="text-white font-semibold">Total</span>
                                        <span className="text-xl font-bold text-green-400">€0.00</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Notas / Condiciones</label>
                                    <textarea className="input-field h-20 resize-none" placeholder="Condiciones de pago, garantías, etc."></textarea>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setShowNewModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium"
                                >
                                    Cancelar
                                </button>
                                <button className="flex-1 py-3 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium">
                                    Guardar Borrador
                                </button>
                                <button className="flex-1 btn-primary">
                                    Crear y Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
