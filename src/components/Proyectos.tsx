import React from 'react'
import { Plus, Search, Filter, MoreVertical, Calendar, DollarSign, Clock } from 'lucide-react'

const projects = [
    { id: 1, name: 'Instalación Nave Industrial', client: 'Industrias García S.L.', status: 'EN PROGRESO', progress: 65, budget: 8500, spent: 5525, type: 'Industrial', date: '15 Feb 2026' },
    { id: 2, name: 'Reforma Vivienda Unifamiliar', client: 'María López', status: 'COMPLETADO', progress: 100, budget: 3200, spent: 3050, type: 'Residencial', date: '01 Feb 2026' },
    { id: 3, name: 'Instalación Solar 10kW', client: 'Comunidad Residencial Sol', status: 'PENDIENTE', progress: 20, budget: 15000, spent: 3000, type: 'Renovables', date: '28 Feb 2026' },
    { id: 4, name: 'Cuadro Eléctrico Oficinas', client: 'TechCorp S.A.', status: 'EN PROGRESO', progress: 45, budget: 2800, spent: 1260, type: 'Comercial', date: '20 Feb 2026' },
    { id: 5, name: 'Instalación Restaurante', client: 'Restaurante El Mar', status: 'EN PROGRESO', progress: 80, budget: 4500, spent: 3600, type: 'Comercial', date: '10 Feb 2026' },
    { id: 6, name: 'Mantenimiento Hotel Marina', client: 'Hotel Marina 5*', status: 'ACTIVO', progress: 10, budget: 12000, spent: 1000, type: 'Mantenimiento', date: '31 Dic 2026' },
]

const ProjectCard = ({ project }: any) => (
    <div className="glass card-hover project-card">
        <div className="project-card-header">
            <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>{project.status}</span>
            <span className="project-type">{project.type}</span>
        </div>

        <div className="project-card-body">
            <h3 className="project-name">{project.name}</h3>
            <p className="project-client">{project.client}</p>

            <div className="progress-section">
                <div className="flex-between">
                    <span className="label">Progreso</span>
                    <span className="value">{project.progress}%</span>
                </div>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${project.progress}%`, backgroundColor: project.progress === 100 ? 'var(--accent-green)' : 'var(--accent-blue)' }}></div>
                </div>
            </div>

            <div className="budget-grid">
                <div className="budget-item">
                    <span className="label">Presupuesto</span>
                    <p className="value">€{project.budget.toLocaleString()}</p>
                </div>
                <div className="budget-item text-right">
                    <span className="label">Gastado</span>
                    <p className="value" style={{ color: 'var(--accent-orange)' }}>€{project.spent.toLocaleString()}</p>
                </div>
            </div>
        </div>

        <div className="project-card-footer">
            <div className="date-info">
                <Calendar size={14} />
                <span>{project.date}</span>
            </div>
            <div className="card-actions">
                <button className="icon-btn-sm"><Search size={14} /></button>
                <button className="icon-btn-sm"><Plus size={14} /></button>
            </div>
        </div>
    </div>
)

const Proyectos = () => {
    return (
        <div className="proyectos-container">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Proyectos</h1>
                    <p className="view-subtitle">Gestiona tus instalaciones y trabajos</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    <span>Nuevo Proyecto</span>
                </button>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={16} color="#94A3B8" />
                    <input type="text" placeholder="Buscar proyecto..." />
                </div>
                <div className="filter-actions">
                    <select className="filter-select">
                        <option>Todos</option>
                        <option>En Progreso</option>
                        <option>Completados</option>
                        <option>Pendientes</option>
                    </select>
                    <button className="icon-btn-border"><Filter size={18} /></button>
                </div>
            </div>

            <div className="projects-grid">
                {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>

            <style>{`
        .proyectos-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 10px;
          flex: 0.5;
        }

        .search-box input {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          outline: none;
          font-size: 14px;
        }

        .filter-actions {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: white;
          padding: 8px 16px;
          border-radius: 10px;
          outline: none;
        }

        .icon-btn-border {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        .project-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .project-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .status-badge.en-progreso { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
        .status-badge.completado { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); }
        .status-badge.pendiente { background: rgba(245, 158, 11, 0.1); color: var(--accent-orange); }
        .status-badge.activo { background: rgba(139, 92, 246, 0.1); color: var(--accent-purple); }

        .project-type {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .project-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .project-client {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .progress-section {
          margin-bottom: 20px;
        }

        .progress-section .label {
           font-size: 11px;
           color: var(--text-secondary);
           font-weight: 600;
        }

        .progress-section .value {
           font-size: 12px;
           font-weight: 700;
        }

        .progress-bar-bg {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin-top: 8px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 10px;
        }

        .budget-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .budget-item .label {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 4px;
          display: block;
        }

        .budget-item .value {
          font-size: 16px;
          font-weight: 700;
        }

        .text-right { text-align: right; }

        .project-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .date-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .icon-btn-sm {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: white;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
        </div>
    )
}

export default Proyectos
