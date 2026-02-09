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

const PhoneIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
)

const MailIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
)

const LocationIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
)

export default function ClientsPage() {
    const [search, setSearch] = useState('')
    const [view, setView] = useState('grid')
    const [showNewModal, setShowNewModal] = useState(false)

    const clients = [
        {
            id: 1,
            name: 'Industrias García S.L.',
            type: 'Empresa',
            contact: 'Pedro García',
            email: 'pedro@industriasgarcia.com',
            phone: '+34 912 345 678',
            address: 'Polígono Industrial Norte, Nave 24, Madrid',
            projects: 3,
            totalBilled: 25500,
            status: 'Activo',
            since: '2024'
        },
        {
            id: 2,
            name: 'María López',
            type: 'Particular',
            contact: 'María López',
            email: 'maria.lopez@email.com',
            phone: '+34 666 123 456',
            address: 'C/ Principal 45, Madrid',
            projects: 1,
            totalBilled: 3200,
            status: 'Activo',
            since: '2025'
        },
        {
            id: 3,
            name: 'TechCorp S.A.',
            type: 'Empresa',
            contact: 'Ana Martínez',
            email: 'ana.martinez@techcorp.es',
            phone: '+34 915 678 901',
            address: 'Av. Tecnología 100, Planta 5, Barcelona',
            projects: 2,
            totalBilled: 8400,
            status: 'Activo',
            since: '2024'
        },
        {
            id: 4,
            name: 'Hotel Marina 5*',
            type: 'Empresa',
            contact: 'Carlos Ruiz',
            email: 'cRuiz@hotelmarina.com',
            phone: '+34 962 111 222',
            address: 'Av. del Puerto 1, Valencia',
            projects: 1,
            totalBilled: 12000,
            status: 'Activo',
            since: '2025'
        },
        {
            id: 5,
            name: 'Restaurante El Mar',
            type: 'Empresa',
            contact: 'Juan Fernández',
            email: 'info@restauranteelmar.es',
            phone: '+34 963 222 333',
            address: 'Paseo Marítimo 23, Valencia',
            projects: 1,
            totalBilled: 4500,
            status: 'Activo',
            since: '2026'
        },
        {
            id: 6,
            name: 'Comunidad Residencial Sol',
            type: 'Comunidad',
            contact: 'Presidente Comunidad',
            email: 'administracion@residencialsol.es',
            phone: '+34 914 555 666',
            address: 'Urbanización Sol, Bloque 3, Madrid',
            projects: 1,
            totalBilled: 15000,
            status: 'Activo',
            since: '2026'
        }
    ]

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.contact.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase())
    )

    const stats = [
        { label: 'Total Clientes', value: clients.length, icon: '👥', color: 'from-blue-500 to-cyan-500' },
        { label: 'Empresas', value: clients.filter(c => c.type === 'Empresa').length, icon: '🏢', color: 'from-purple-500 to-pink-500' },
        { label: 'Particulares', value: clients.filter(c => c.type === 'Particular').length, icon: '👤', color: 'from-green-500 to-emerald-500' },
        { label: 'Facturado Total', value: `€${clients.reduce((acc, c) => acc + c.totalBilled, 0).toLocaleString()}`, icon: '💰', color: 'from-amber-500 to-orange-500' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            <Sidebar />

            <main className="main-content">
                <Header
                    title="Clientes"
                    subtitle="Gestiona tu cartera de clientes"
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
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Buscar clientes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-10 w-full"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <SearchIcon />
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setView('grid')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-gray-400'
                                    }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-gray-400'
                                    }`}
                            >
                                Lista
                            </button>
                            <button
                                onClick={() => setShowNewModal(true)}
                                className="btn-primary flex items-center gap-2 ml-2"
                            >
                                <PlusIcon />
                                <span className="hidden sm:inline">Nuevo Cliente</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Clients Grid */}
                {view === 'grid' ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredClients.map((client) => (
                            <div key={client.id} className="glass-card p-6 hover:border-blue-500/50 cursor-pointer group">
                                {/* Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                            {client.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`badge ${client.type === 'Empresa' ? 'badge-info' :
                                                client.type === 'Particular' ? 'badge-success' : 'badge-warning'
                                                }`}>{client.type}</span>
                                            <span className="text-gray-500 text-xs">Cliente desde {client.since}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <PhoneIcon />
                                        <span>{client.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <MailIcon />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-gray-400 text-sm">
                                        <LocationIcon className="mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2">{client.address}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-slate-800/50 text-center">
                                        <p className="text-2xl font-bold text-white">{client.projects}</p>
                                        <p className="text-gray-400 text-xs">Proyectos</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-800/50 text-center">
                                        <p className="text-2xl font-bold text-green-400">€{client.totalBilled.toLocaleString()}</p>
                                        <p className="text-gray-400 text-xs">Facturado</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm font-medium transition-colors">
                                        Ver Detalle
                                    </button>
                                    <button className="flex-1 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium transition-colors">
                                        Nuevo Proyecto
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="glass-card overflow-hidden">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Tipo</th>
                                    <th>Contacto</th>
                                    <th>Teléfono</th>
                                    <th>Proyectos</th>
                                    <th>Facturado</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{client.name}</p>
                                                    <p className="text-gray-500 text-xs">{client.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${client.type === 'Empresa' ? 'badge-info' :
                                                client.type === 'Particular' ? 'badge-success' : 'badge-warning'
                                                }`}>{client.type}</span>
                                        </td>
                                        <td className="text-gray-400">{client.contact}</td>
                                        <td className="text-gray-400">{client.phone}</td>
                                        <td className="text-white font-medium">{client.projects}</td>
                                        <td className="text-green-400 font-medium">€{client.totalBilled.toLocaleString()}</td>
                                        <td>
                                            <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm">
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* New Client Modal */}
                {showNewModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-card w-full max-w-lg p-6 animate-fadeIn max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">Nuevo Cliente</h2>
                                <button
                                    onClick={() => setShowNewModal(false)}
                                    className="p-2 rounded-lg hover:bg-slate-700 text-gray-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="label">Nombre / Razón Social</label>
                                    <input type="text" className="input-field" placeholder="Ej: Empresa ABC S.L." />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Tipo</label>
                                        <select className="select-field">
                                            <option>Empresa</option>
                                            <option>Particular</option>
                                            <option>Comunidad</option>
                                            <option>Autónomo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">CIF/NIF</label>
                                        <input type="text" className="input-field" placeholder="B12345678" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Persona de Contacto</label>
                                    <input type="text" className="input-field" placeholder="Nombre del contacto" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Teléfono</label>
                                        <input type="tel" className="input-field" placeholder="+34 XXX XXX XXX" />
                                    </div>
                                    <div>
                                        <label className="label">Email</label>
                                        <input type="email" className="input-field" placeholder="email@ejemplo.com" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Dirección</label>
                                    <input type="text" className="input-field" placeholder="Calle, número, ciudad, CP" />
                                </div>

                                <div>
                                    <label className="label">Notas</label>
                                    <textarea className="input-field h-24 resize-none" placeholder="Información adicional..."></textarea>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setShowNewModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium"
                                >
                                    Cancelar
                                </button>
                                <button className="flex-1 btn-primary">
                                    Guardar Cliente
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
