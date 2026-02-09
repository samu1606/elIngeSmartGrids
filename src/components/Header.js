'use client'
import { useState } from 'react'

const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
)

const BellIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
)

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
)

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
)

export default function Header({ title, subtitle }) {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showNewMenu, setShowNewMenu] = useState(false)

    const notifications = [
        { id: 1, type: 'project', message: 'Proyecto "Casa García" actualizado', time: 'Hace 5 min' },
        { id: 2, type: 'payment', message: 'Pago recibido: €1,200', time: 'Hace 1 hora' },
        { id: 3, type: 'reminder', message: 'Cita mañana a las 9:00', time: 'Hace 2 horas' },
    ]

    const quickActions = [
        { name: 'Nuevo Proyecto', href: '/projects/new' },
        { name: 'Nuevo Cliente', href: '/clients/new' },
        { name: 'Nuevo Presupuesto', href: '/quotes/new' },
        { name: 'Cálculo Rápido', href: '/calculator' },
    ]

    return (
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button className="md:hidden p-2 rounded-lg bg-slate-800 text-white">
                    <MenuIcon />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="input-field w-64 pl-10 py-2"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon />
                    </div>
                </div>

                {/* Quick Add Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowNewMenu(!showNewMenu)}
                        className="btn-primary py-2 px-4 flex items-center gap-2"
                    >
                        <PlusIcon />
                        <span className="hidden sm:inline">Nuevo</span>
                    </button>

                    {showNewMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 glass-card p-2 animate-fadeIn z-50">
                            {quickActions.map((action) => (
                                <a
                                    key={action.name}
                                    href={action.href}
                                    className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    {action.name}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-xl bg-slate-800 text-gray-400 hover:text-white transition-colors"
                    >
                        <BellIcon />
                        <span className="notification-dot"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 glass-card p-4 animate-fadeIn z-50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-white">Notificaciones</h3>
                                <button className="text-sm text-blue-400 hover:text-blue-300">
                                    Marcar todo leído
                                </button>
                            </div>
                            <div className="space-y-3">
                                {notifications.map((notif) => (
                                    <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-300">{notif.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300">
                                Ver todas las notificaciones
                            </button>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                        JD
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-sm font-medium text-white">Juan Díaz</p>
                        <p className="text-xs text-gray-400">Professional</p>
                    </div>
                </button>
            </div>
        </header>
    )
}
