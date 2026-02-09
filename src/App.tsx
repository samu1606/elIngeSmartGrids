import React, { useState } from 'react'
import {
  LayoutDashboard,
  Calculator,
  FolderKanban,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Bell,
  Search
} from 'lucide-react'
import Dashboard from './components/Dashboard'
import Calculadora from './components/Calculadora'
import Proyectos from './components/Proyectos'
import Clientes from './components/Clientes'
import Presupuestos from './components/Presupuestos'
import Agenda from './components/Agenda'
import Reportes from './components/Reportes'
import Landing from './components/Landing'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showLanding, setShowLanding] = useState(true)

  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'calculadora', icon: <Calculator size={20} />, label: 'Calculadora' },
    { id: 'proyectos', icon: <FolderKanban size={20} />, label: 'Proyectos' },
    { id: 'clientes', icon: <Users size={20} />, label: 'Clientes' },
    { id: 'presupuestos', icon: <FileText size={20} />, label: 'Presupuestos' },
    { id: 'agenda', icon: <Calendar size={20} />, label: 'Agenda' },
    { id: 'reportes', icon: <BarChart3 size={20} />, label: 'Reportes' },
  ]

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />
  }

  return (
    <>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container" onClick={() => setShowLanding(true)} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <Plus size={24} color="#3B82F6" strokeWidth={3} />
          </div>
          <span className="logo-text">El Inge : <span style={{ color: 'var(--accent-blue)' }}>Smart Grids</span></span>
        </div>

        <nav className="nav-menu">
          <p className="menu-group-label">MENU PRINCIPAL</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <Settings size={20} />
            <span>Configuración</span>
          </button>
          <button className="nav-item text-red">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>

          <div className="upgrade-card">
            <p>Plan Gratuito</p>
            <button className="upgrade-btn">Actualizar</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-search">
            <Search size={18} color="#94A3B8" />
            <input type="text" placeholder="Buscar..." />
          </div>
          <div className="header-actions">
            <button className="btn-primary">
              <Plus size={18} />
              <span>Nuevo</span>
            </button>
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <div className="user-profile">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Juan" alt="User" />
              <div className="user-info">
                <span className="user-name">Juan Díaz</span>
                <span className="user-role">Professional</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'calculadora' && <Calculadora />}
          {activeTab === 'proyectos' && <Proyectos />}
          {activeTab === 'clientes' && <Clientes />}
          {activeTab === 'presupuestos' && <Presupuestos />}
          {activeTab === 'agenda' && <Agenda />}
          {activeTab === 'reportes' && <Reportes />}
        </div>
      </main>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          height: 100vh;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          padding: 0 8px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-weight: 700;
          font-size: 20px;
          letter-spacing: -0.5px;
        }

        .menu-group-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 12px;
          padding: 0 8px;
          letter-spacing: 0.5px;
        }

        .nav-menu {
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .text-red {
          color: var(--accent-red);
        }

        .upgrade-card {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .upgrade-card p {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .upgrade-btn {
          width: 100%;
          padding: 8px;
          border-radius: 8px;
          border: none;
          background: var(--accent-blue);
          color: white;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .header {
          height: 72px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
        }

        .header-search {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-secondary);
          padding: 8px 16px;
          border-radius: 12px;
          width: 400px;
          border: 1px solid var(--border-color);
        }

        .header-search input {
          background: transparent;
          border: none;
          color: white;
          flex: 1;
          outline: none;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-profile img {
          width: 36px;
          height: 36px;
          border-radius: 10px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
        }

        .user-role {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .content-area {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        .placeholder-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 80%;
          color: var(--text-secondary);
        }
      `}</style>
    </>
  )
}

export default App
