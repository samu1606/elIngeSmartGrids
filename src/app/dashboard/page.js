'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

// Icons
const TrendUpIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
)

const TrendDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
)

const MoreIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
)

const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)

const CheckCircleIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)

const AlertIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
)

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
)

export default function DashboardPage() {
    const [period, setPeriod] = useState('month')

    const stats = [
        {
            title: 'Ingresos del Mes',
            value: '€12,450',
            change: '+23%',
            trend: 'up',
            icon: '💰',
            color: 'from-green-500 to-emerald-500'
        },
        {
            title: 'Proyectos Activos',
            value: '24',
            change: '+5',
            trend: 'up',
            icon: '📁',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Clientes Nuevos',
            value: '18',
            change: '+12%',
            trend: 'up',
            icon: '👥',
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Presupuestos Pendientes',
            value: '7',
            change: '-2',
            trend: 'down',
            icon: '📋',
            color: 'from-amber-500 to-orange-500'
        }
    ]

    const recentProjects = [
        {
            id: 1,
            name: 'Instalación Nave Industrial',
            client: 'Industrias García S.L.',
            status: 'En Progreso',
            statusColor: 'badge-info',
            progress: 65,
            dueDate: '15 Feb 2026',
            budget: '€8,500'
        },
        {
            id: 2,
            name: 'Reforma Vivienda Unifamiliar',
            client: 'María López',
            status: 'Completado',
            statusColor: 'badge-success',
            progress: 100,
            dueDate: '01 Feb 2026',
            budget: '€3,200'
        },
        {
            id: 3,
            name: 'Instalación Solar 10kW',
            client: 'Comunidad Residencial Sol',
            status: 'Pendiente',
            statusColor: 'badge-warning',
            progress: 20,
            dueDate: '28 Feb 2026',
            budget: '€15,000'
        },
        {
            id: 4,
            name: 'Cuadro Eléctrico Oficinas',
            client: 'TechCorp S.A.',
            status: 'En Progreso',
            statusColor: 'badge-info',
            progress: 45,
            dueDate: '20 Feb 2026',
            budget: '€2,800'
        }
    ]

    const upcomingTasks = [
        {
            id: 1,
            task: 'Revisión cuadro eléctrico',
            client: 'Hotel Marina',
            time: '09:00',
            type: 'maintenance'
        },
        {
            id: 2,
            task: 'Firma contrato instalación',
            client: 'Fábrica Norte',
            time: '11:30',
            type: 'meeting'
        },
        {
            id: 3,
            task: 'Entrega presupuesto',
            client: 'Restaurante El Sol',
            time: '14:00',
            type: 'quote'
        },
        {
            id: 4,
            task: 'Instalación diferencial',
            client: 'Vivienda Rodríguez',
            time: '16:00',
            type: 'installation'
        }
    ]

    const recentActivity = [
        {
            id: 1,
            action: 'Factura #2024-047 cobrada',
            amount: '€1,200',
            time: 'Hace 2 horas',
            type: 'payment'
        },
        {
            id: 2,
            action: 'Nuevo cliente añadido',
            detail: 'Empresa ABC S.L.',
            time: 'Hace 4 horas',
            type: 'client'
        },
        {
            id: 3,
            action: 'Proyecto actualizado',
            detail: 'Nave Industrial - 65%',
            time: 'Hace 5 horas',
            type: 'project'
        },
        {
            id: 4,
            action: 'Presupuesto enviado',
            detail: 'Local Comercial Centro',
            time: 'Ayer',
            type: 'quote'
        }
    ]

    // Simple chart data for the revenue chart
    const chartData = [
        { month: 'Ene', value: 8500 },
        { month: 'Feb', value: 9200 },
        { month: 'Mar', value: 7800 },
        { month: 'Abr', value: 10500 },
        { month: 'May', value: 11200 },
        { month: 'Jun', value: 9800 },
        { month: 'Jul', value: 12450 },
    ]

    const maxValue = Math.max(...chartData.map(d => d.value))

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            <Sidebar />

            <main className="main-content">
                <Header
                    title="Dashboard"
                    subtitle="Bienvenido de vuelta, Juan 👋"
                />

                {/* Period Selector */}
                <div className="flex gap-2 mb-6">
                    {['week', 'month', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800 text-gray-400 hover:text-white'
                                }`}
                        >
                            {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                        </button>
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl">{stat.icon}</span>
                                <span className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {stat.trend === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                            <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${stat.color}`}></div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Ingresos Mensuales</h2>
                                <p className="text-gray-400 text-sm">Evolución de facturación 2026</p>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-slate-700 text-gray-400">
                                <MoreIcon />
                            </button>
                        </div>

                        {/* Simple Bar Chart */}
                        <div className="flex items-end justify-between h-48 gap-4">
                            {chartData.map((data, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all hover:from-blue-400 hover:to-cyan-300"
                                        style={{ height: `${(data.value / maxValue) * 100}%` }}
                                    ></div>
                                    <span className="text-xs text-gray-400">{data.month}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                                <span className="text-sm text-gray-400">Ingresos</span>
                            </div>
                            <div className="text-sm text-gray-400">
                                Total: <span className="text-white font-semibold">€69,450</span>
                            </div>
                        </div>
                    </div>

                    {/* Today's Tasks */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Tareas de Hoy</h2>
                                <p className="text-gray-400 text-sm">7 de Febrero</p>
                            </div>
                            <span className="badge badge-info">4 pendientes</span>
                        </div>

                        <div className="space-y-4">
                            {upcomingTasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm min-w-[50px]">
                                        <ClockIcon />
                                        {task.time}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-medium">{task.task}</p>
                                        <p className="text-gray-400 text-xs">{task.client}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-3 text-sm text-blue-400 hover:text-blue-300 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-colors">
                            Ver Agenda Completa
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Recent Projects */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Proyectos Recientes</h2>
                            <a href="/projects" className="text-sm text-blue-400 hover:text-blue-300">
                                Ver todos →
                            </a>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Proyecto</th>
                                        <th>Cliente</th>
                                        <th>Estado</th>
                                        <th>Progreso</th>
                                        <th>Presupuesto</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentProjects.map((project) => (
                                        <tr key={project.id}>
                                            <td>
                                                <p className="font-medium text-white">{project.name}</p>
                                                <p className="text-xs text-gray-500">Vence: {project.dueDate}</p>
                                            </td>
                                            <td className="text-gray-400">{project.client}</td>
                                            <td>
                                                <span className={`badge ${project.statusColor}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="progress-bar w-24">
                                                        <div
                                                            className="progress-bar-fill bg-gradient-to-r from-blue-500 to-cyan-500"
                                                            style={{ width: `${project.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-400">{project.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="text-white font-medium">{project.budget}</td>
                                            <td>
                                                <button className="p-2 rounded-lg hover:bg-slate-700 text-gray-400">
                                                    <EyeIcon />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Actividad Reciente</h2>
                            <button className="p-2 rounded-lg hover:bg-slate-700 text-gray-400">
                                <MoreIcon />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                                        activity.type === 'client' ? 'bg-purple-500/20 text-purple-400' :
                                            activity.type === 'project' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {activity.type === 'payment' ? <CheckCircleIcon /> :
                                            activity.type === 'client' ? '👤' :
                                                activity.type === 'project' ? '📁' : '📋'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-white">{activity.action}</p>
                                        {activity.amount && (
                                            <p className="text-sm text-green-400 font-medium">{activity.amount}</p>
                                        )}
                                        {activity.detail && (
                                            <p className="text-xs text-gray-400">{activity.detail}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Calculator Widget */}
                <div className="mt-8 glass-card p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                                ⚡
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Calculadora Rápida</h3>
                                <p className="text-gray-400 text-sm">Calcula secciones de cable, caídas de tensión y más</p>
                            </div>
                        </div>
                        <a href="/calculator" className="btn-primary">
                            Abrir Calculadora →
                        </a>
                    </div>
                </div>
            </main>
        </div>
    )
}
