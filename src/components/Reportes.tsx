import React from 'react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { TrendingUp, Download, Calendar, Filter, FileText } from 'lucide-react'

const serviceData = [
    { name: 'Industrial', value: 45 },
    { name: 'Residencial', value: 25 },
    { name: 'Renovables', value: 20 },
    { name: 'Mantenimiento', value: 10 },
]

const COLORS = ['var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--accent-orange)']

const monthlyPerf = [
    { month: 'Ene', facturado: 45000, gastos: 32000 },
    { month: 'Feb', facturado: 52000, gastos: 34000 },
    { month: 'Mar', facturado: 48000, gastos: 31000 },
    { month: 'Abr', facturado: 61000, gastos: 42000 },
    { month: 'May', facturado: 55000, gastos: 38000 },
    { month: 'Jun', facturado: 67000, gastos: 45000 },
]

const Reportes = () => {
    return (
        <div className="reportes-container">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Reportes y Analíticas</h1>
                    <p className="view-subtitle">Análisis profundo del rendimiento de tu negocio</p>
                </div>
                <div className="header-actions">
                    <button className="icon-btn-border"><Calendar size={18} /> <span>Últimos 6 meses</span></button>
                    <button className="btn-primary"><Download size={18} /> <span>Exportar PDF</span></button>
                </div>
            </div>

            <div className="reports-grid">
                <div className="glass report-card large">
                    <div className="card-header flex-between">
                        <div>
                            <h3>Rendimiento Financiero</h3>
                            <p className="text-secondary">Facturación vs Gastos Operativos</p>
                        </div>
                        <div className="stat-pill highlight">
                            <TrendingUp size={14} />
                            <span>+12.5%</span>
                        </div>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={monthlyPerf}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Bar dataKey="facturado" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} name="Facturación" />
                                <Bar dataKey="gastos" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} name="Gastos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass report-card">
                    <div className="card-header">
                        <h3>Distribución por Sector</h3>
                        <p className="text-secondary">Tipos de proyectos ejecutados</p>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={serviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {serviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pie-legend">
                            {serviceData.map((s, i) => (
                                <div key={s.name} className="legend-item">
                                    <div className="dot" style={{ background: COLORS[i] }}></div>
                                    <span>{s.name}</span>
                                    <span className="val">{s.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass report-card">
                    <div className="card-header">
                        <h3>Métricas Clave</h3>
                    </div>
                    <div className="metrics-list">
                        <div className="metric-item">
                            <span className="label">Ticket Medio</span>
                            <div className="flex-between">
                                <span className="value">€4,250</span>
                                <span className="trend positive">+5%</span>
                            </div>
                        </div>
                        <div className="metric-item">
                            <span className="label">Tiempo Medio Cierre</span>
                            <div className="flex-between">
                                <span className="value">14 días</span>
                                <span className="trend negative">-2d</span>
                            </div>
                        </div>
                        <div className="metric-item">
                            <span className="label">Coste Adquisición</span>
                            <div className="flex-between">
                                <span className="value">€120</span>
                                <span className="trend positive">+12%</span>
                            </div>
                        </div>
                        <div className="metric-item">
                            <span className="label">Margen de Beneficio</span>
                            <div className="flex-between">
                                <span className="value">32%</span>
                                <span className="trend positive">+2%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass report-card large">
                    <div className="card-header flex-between">
                        <h3>Proyección de Crecimiento</h3>
                        <button className="icon-btn-border"><Filter size={16} /></button>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={monthlyPerf}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip />
                                <Line type="monotone" dataKey="facturado" stroke="var(--accent-green)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-green)' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`
                .reportes-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .reports-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }

                .report-card { padding: 24px; }
                .report-card.large { grid-column: span 2; }

                .card-header h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
                .card-header p { font-size: 13px; color: var(--text-secondary); }

                .stat-pill {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                }

                .stat-pill.highlight { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); }

                .chart-wrapper { margin-top: 24px; }

                .pie-legend {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-top: 20px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                }

                .legend-item .dot { width: 8px; height: 8px; border-radius: 50%; }
                .legend-item .val { margin-left: auto; font-weight: 700; color: var(--text-secondary); }

                .metrics-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-top: 24px;
                }

                .metric-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .metric-item .label { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
                .metric-item .value { font-size: 18px; font-weight: 700; }
                .metric-item .trend { font-size: 11px; font-weight: 700; }
                .metric-item .trend.positive { color: var(--accent-green); }
                .metric-item .trend.negative { color: var(--accent-red); }

                .header-actions { display: flex; gap: 12px; }
                .header-actions span { font-size: 13px; font-weight: 600; }
            `}</style>
        </div>
    )
}

export default Reportes
