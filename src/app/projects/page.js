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

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
)

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
)

const FilterIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
)

export default function ProjectsPage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showNewModal, setShowNewModal] = useState(false)

    const projects = [
        {
            id: 1,
            name: 'Instalación Nave Industrial',
            client: 'Industrias García S.L.',
            type: 'Industrial',
            status: 'En Progreso',
            statusColor: 'badge-info',
            progress: 65,
            startDate: '01 Ene 2026',
            dueDate: '15 Feb 2026',
            budget: 8500,
            spent: 5525,
            address: 'Polígono Industrial Norte, Nave 24',
            description: 'Instalación eléctrica completa de nave industrial 2000m²'
        },
        {
            id: 2,
            name: 'Reforma Vivienda Unifamiliar',
            client: 'María López',
            type: 'Residencial',
            status: 'Completado',
            statusColor: 'badge-success',
            progress: 100,
            startDate: '15 Dic 2025',
            dueDate: '01 Feb 2026',
            budget: 3200,
            spent: 3050,
            address: 'C/ Principal 45, Madrid',
            description: 'Actualización de instalación eléctrica antigua'
        },
        {
            id: 3,
            name: 'Instalación Solar 10kW',
            client: 'Comunidad Residencial Sol',
            type: 'Renovables',
            status: 'Pendiente',
            statusColor: 'badge-warning',
            progress: 20,
            startDate: '20 Ene 2026',
            dueDate: '28 Feb 2026',
            budget: 15000,
            spent: 3000,
            address: 'Urbanización Sol, Bloque 3',
            description: 'Instalación fotovoltaica para autoconsumo colectivo'
        },
        {
            id: 4,
            name: 'Cuadro Eléctrico Oficinas',
            client: 'TechCorp S.A.',
            type: 'Comercial',
            status: 'En Progreso',
            statusColor: 'badge-info',
            progress: 45,
            startDate: '10 Ene 2026',
            dueDate: '20 Feb 2026',
            budget: 2800,
            spent: 1260,
            address: 'Av. Tecnología 100, Planta 5',
            description: 'Renovación de cuadro general y subcuadros'
        },
        {
            id: 5,
            name: 'Instalación Restaurante',
            client: 'Restaurante El Mar',
            type: 'Comercial',
            status: 'En Progreso',
            statusColor: 'badge-info',
            progress: 80,
            startDate: '05 Ene 2026',
            dueDate: '10 Feb 2026',
            budget: 4500,
            spent: 3600,
            address: 'Paseo Marítimo 23',
            description: 'Instalación completa para nuevo local hostelero'
        },
        {
            id: 6,
            name: 'Mantenimiento Hotel Marina',
            client: 'Hotel Marina 5*',
            type: 'Mantenimiento',
            status: 'Activo',
            statusColor: 'badge-success',
            progress: null,
            startDate: '01 Ene 2026',
            dueDate: '31 Dic 2026',
            budget: 12000,
            spent: 1000,
            address: 'Av. del Puerto 1',
            description: 'Contrato anual de mantenimiento preventivo'
        }
    ]

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
            project.client.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' ||
            project.status.toLowerCase().includes(statusFilter.toLowerCase())
        return matchesSearch && matchesStatus
    })

    const stats = [
        { label: 'Total Proyectos', value: projects.length, icon: '📁', color: 'from-blue-500 to-cyan-500' },
        { label: 'En Progreso', value: projects.filter(p => p.status === 'En Progreso').length, icon: '🔧', color: 'from-amber-500 to-orange-500' },
        { label: 'Completados', value: projects.filter(p => p.status === 'Completado').length, icon: '✅', color: 'from-green-500 to-emerald-500' },
        { label: 'Facturación Total', value: `€${projects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}`, icon: '💰', color: 'from-purple-500 to-pink-500' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            <Sidebar />

            <main className="main-content">
                <Header
                    title="Proyectos"
                    subtitle="Gestiona tus instalaciones y trabajos"
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
                                    placeholder="Buscar proyectos..."
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
                                <option value="progreso">En Progreso</option>
                                <option value="completado">Completados</option>
                                <option value="pendiente">Pendientes</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setShowNewModal(true)}
                            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                        >
                            <PlusIcon />
                            Nuevo Proyecto
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="glass-card p-6 hover:border-blue-500/50 cursor-pointer group">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <span className={`badge ${project.statusColor} mb-2`}>{project.status}</span>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                        {project.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm">{project.client}</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-slate-700 text-gray-300 text-xs">
                                    {project.type}
                                </span>
                            </div>

                            {/* Progress */}
                            {project.progress !== null && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-gray-400">Progreso</span>
                                        <span className="text-white font-medium">{project.progress}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className={`progress-bar-fill ${project.progress === 100
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                                }`}
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Budget */}
                            <div className="p-3 rounded-xl bg-slate-800/50 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-xs">Presupuesto</p>
                                        <p className="text-white font-semibold">€{project.budget.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-xs">Gastado</p>
                                        <p className="text-amber-400 font-semibold">€{project.spent.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                                <span>📅 {project.startDate}</span>
                                <span>→</span>
                                <span>{project.dueDate}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                    <EyeIcon /> Ver
                                </button>
                                <button className="flex-1 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                    <EditIcon /> Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-3xl">
                            📁
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No se encontraron proyectos</h3>
                        <p className="text-gray-400 mb-6">Intenta ajustar los filtros o crea un nuevo proyecto</p>
                        <button className="btn-primary" onClick={() => setShowNewModal(true)}>
                            <PlusIcon className="inline mr-2" />
                            Crear Primer Proyecto
                        </button>
                    </div>
                )}

                {/* New Project Modal */}
                {showNewModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="glass-card w-full max-w-lg p-6 animate-fadeIn">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-white">Nuevo Proyecto</h2>
                                <button
                                    onClick={() => setShowNewModal(false)}
                                    className="p-2 rounded-lg hover:bg-slate-700 text-gray-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="label">Nombre del Proyecto</label>
                                    <input type="text" className="input-field" placeholder="Ej: Instalación Nave Industrial" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Cliente</label>
                                        <select className="select-field">
                                            <option>Seleccionar cliente...</option>
                                            <option>Industrias García S.L.</option>
                                            <option>María López</option>
                                            <option>TechCorp S.A.</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Tipo</label>
                                        <select className="select-field">
                                            <option>Residencial</option>
                                            <option>Comercial</option>
                                            <option>Industrial</option>
                                            <option>Renovables</option>
                                            <option>Mantenimiento</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Fecha Inicio</label>
                                        <input type="date" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Fecha Fin Estimada</label>
                                        <input type="date" className="input-field" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Presupuesto (€)</label>
                                    <input type="number" className="input-field" placeholder="0.00" />
                                </div>

                                <div>
                                    <label className="label">Dirección</label>
                                    <input type="text" className="input-field" placeholder="Dirección de la instalación" />
                                </div>

                                <div>
                                    <label className="label">Descripción</label>
                                    <textarea className="input-field h-24 resize-none" placeholder="Detalles del proyecto..."></textarea>
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
                                    Crear Proyecto
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
