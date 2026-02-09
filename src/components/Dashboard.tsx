import React from 'react'
import {
  TrendingUp,
  Folder,
  Users,
  Clock,
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const data = [
  { name: 'Ene', ingresos: 4000 },
  { name: 'Feb', ingresos: 3000 },
  { name: 'Mar', ingresos: 5000 },
  { name: 'Abr', ingresos: 4500 },
  { name: 'May', ingresos: 6000 },
  { name: 'Jun', ingresos: 5500 },
  { name: 'Jul', ingresos: 7000 },
]

const StatCard = ({ icon, label, value, trend, color }: any) => (
  <div className="glass card-hover stat-card">
    <div className="stat-header">
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
      {trend && (
        <div className="stat-trend" style={{ color: trend.startsWith('+') ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          <TrendingUp size={14} />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div className="stat-info">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
    <div className="stat-footer" style={{ borderBottomColor: color }}></div>
  </div>
)

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Dashboard</h1>
          <p className="view-subtitle">Bienvenido de vuelta, Juan</p>
        </div>
        <div className="date-filter">
          <button className="active">Mes</button>
          <button>Año</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Ingresos del Mes"
          value="€12,450"
          trend="+23%"
          color="var(--accent-green)"
        />
        <StatCard
          icon={<Folder size={18} />}
          label="Proyectos Activos"
          value="24"
          trend="+5"
          color="var(--accent-blue)"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Clientes Nuevos"
          value="18"
          trend="+12%"
          color="var(--accent-purple)"
        />
        <StatCard
          icon={<FileText size={18} />}
          label="Presupuestos Pendientes"
          value="7"
          trend="-2"
          color="var(--accent-orange)"
        />
      </div>

      <div className="dashboard-grid-main">
        <div className="glass chart-container">
          <div className="card-header">
            <h3>Ingresos Mensuales</h3>
            <p className="text-secondary">Evolución de facturación 2026</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ingresos"
                  stroke="var(--accent-blue)"
                  fillOpacity={1}
                  fill="url(#colorIngresos)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-side">
          <div className="glass task-card">
            <div className="card-header flex-between">
              <h3>Tareas de Hoy</h3>
              <span className="badge">4 PENDIENTES</span>
            </div>
            <div className="task-list">
              {[
                { time: '09:00', task: 'Revisión cuadro eléctrico', client: 'Hotel Marina' },
                { time: '11:30', task: 'Firma contrato instalación', client: 'Fábrica Norte' },
                { time: '14:00', task: 'Entrega presupuesto', client: 'Restaurante El Sol' },
              ].map((item, i) => (
                <div key={i} className="task-item">
                  <div className="task-time">{item.time}</div>
                  <div className="task-info">
                    <p className="task-name">{item.task}</p>
                    <p className="task-client">{item.client}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-btn">Ver Agenda Completa</button>
          </div>

          <div className="glass activity-card">
            <h3>Actividad Reciente</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon green"><FileText size={14} /></div>
                <div className="activity-info">
                  <p>Factura #2024-047 cobrada</p>
                  <span className="activity-time">€1,200 • Hace 2 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass projects-table-container">
        <div className="card-header flex-between">
          <h3>Proyectos Recientes</h3>
          <button className="text-btn">Ver todos <ChevronRight size={16} /></button>
        </div>
        <table className="projects-table">
          <thead>
            <tr>
              <th>PROYECTO</th>
              <th>CLIENTE</th>
              <th>ESTADO</th>
              <th>PROGRESO</th>
              <th>PRESUPUESTO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p className="table-main">Instalación Nave Industrial</p>
                <span className="table-sub">Vence: 15 Feb</span>
              </td>
              <td className="table-main">Industrias García S.L.</td>
              <td><span className="status-tag in-progress">EN PROGRESO</span></td>
              <td>
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: '65%', backgroundColor: 'var(--accent-blue)' }}></div>
                  <span className="progress-text">65%</span>
                </div>
              </td>
              <td className="table-main">€8,500</td>
            </tr>
          </tbody>
        </table>
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .view-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .view-subtitle {
          color: var(--text-secondary);
        }

        .date-filter {
          display: flex;
          background: var(--bg-secondary);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .date-filter button {
          padding: 6px 16px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
        }

        .date-filter button.active {
          background: var(--accent-blue);
          color: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 13px;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
        }

        .stat-footer {
          position: absolute;
          bottom: 0;
          left: 20px;
          right: 20px;
          border-bottom: 3px solid transparent;
          border-radius: 3px;
        }

        .dashboard-grid-main {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .chart-container {
          padding: 24px;
        }

        .card-header {
          margin-bottom: 24px;
        }

        .flex-between {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .badge {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
        }

        .task-card {
          padding: 24px;
          margin-bottom: 24px;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }

        .task-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .task-time {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 600;
          min-width: 45px;
        }

        .task-name {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .task-client {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .view-all-btn {
          width: 100%;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
        }

        .activity-card {
          padding: 24px;
        }

        .projects-table-container {
          padding: 24px;
        }

        .projects-table {
          width: 100%;
          border-collapse: collapse;
        }

        .projects-table th {
          text-align: left;
          color: var(--text-secondary);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding-bottom: 16px;
        }

        .projects-table td {
          padding: 16px 0;
          border-top: 1px solid var(--border-color);
        }

        .table-main {
          font-weight: 600;
          font-size: 14px;
        }

        .table-sub {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .status-tag {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .status-tag.in-progress {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
        }

        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          flex: 1;
        }

        .progress-text {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .text-btn {
          background: transparent;
          border: none;
          color: var(--accent-blue);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
