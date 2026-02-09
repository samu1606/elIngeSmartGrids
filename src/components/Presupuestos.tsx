import React, { useState } from 'react'
import { Plus, Search, Filter, MoreVertical, FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const budgets = [
    { id: 'PRES-2024-001', client: 'Industrias García S.L.', project: 'Instalación Nave Industrial', items: 12, total: 8500, status: 'ACEPTADO', date: '05 Feb 2024' },
    { id: 'PRES-2024-002', client: 'María López', project: 'Reforma Cocina', items: 5, total: 1200, status: 'ENVIADO', date: '08 Feb 2024' },
    { id: 'PRES-2024-003', client: 'Hotel Marina', project: 'Mantenimiento preventivo', items: 8, total: 3500, status: 'PENDIENTE', date: '10 Feb 2024' },
    { id: 'PRES-2024-004', client: 'TechCorp S.A.', project: 'Red de datos', items: 15, total: 2800, status: 'ACEPTADO', date: '12 Feb 2024' },
    { id: 'PRES-2024-005', client: 'Comunidad Sol', project: 'Iluminación LED', items: 6, total: 4500, status: 'RECHAZADO', date: '14 Feb 2024' },
]

const Presupuestos = () => {
    return (
        <div className="presupuestos-container">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Presupuestos</h1>
                    <p className="view-subtitle">Cotizaciones y ofertas comerciales</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    <span>Nuevo Presupuesto</span>
                </button>
            </div>

            <div className="stats-grid">
                <div className="glass summary-card">
                    <div className="flex-between">
                        <span className="label">Total Pendientes</span>
                        <div className="icon-box orange"><Clock size={16} /></div>
                    </div>
                    <h3>€5,900</h3>
                    <p className="c-sub">3 presupuestos pendientes</p>
                </div>
                <div className="glass summary-card">
                    <div className="flex-between">
                        <span className="label">Aceptados (Mes)</span>
                        <div className="icon-box green"><CheckCircle size={16} /></div>
                    </div>
                    <h3>€24,500</h3>
                    <p className="c-sub">+15% vs mes anterior</p>
                </div>
                <div className="glass summary-card">
                    <div className="flex-between">
                        <span className="label">Ratio de Conversión</span>
                        <div className="icon-box blue"><FileText size={16} /></div>
                    </div>
                    <h3>78%</h3>
                    <p className="c-sub">Alto desempeño</p>
                </div>
            </div>

            <div className="glass table-container">
                <div className="filters-bar">
                    <div className="search-box">
                        <Search size={16} color="#94A3B8" />
                        <input type="text" placeholder="Buscar por cliente o proyecto..." />
                    </div>
                    <div className="filter-actions">
                        <button className="icon-btn-border"><Download size={18} /></button>
                        <button className="icon-btn-border"><Filter size={18} /></button>
                    </div>
                </div>

                <table className="budgets-table">
                    <thead>
                        <tr>
                            <th>Nº PRESUPUESTO</th>
                            <th>CLIENTE / PROYECTO</th>
                            <th>UNIDADES</th>
                            <th>TOTAL</th>
                            <th>ESTADO</th>
                            <th>FECHA</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgets.map((b) => (
                            <tr key={b.id}>
                                <td>
                                    <div className="id-badge">{b.id}</div>
                                </td>
                                <td>
                                    <p className="table-main">{b.client}</p>
                                    <p className="table-sub">{b.project}</p>
                                </td>
                                <td>{b.items}</td>
                                <td className="table-main">€{b.total.toLocaleString()}</td>
                                <td>
                                    <span className={`status-tag ${b.status.toLowerCase()}`}>
                                        {b.status === 'ACEPTADO' && <CheckCircle size={12} />}
                                        {b.status === 'PENDIENTE' && <Clock size={12} />}
                                        {b.status === 'RECHAZADO' && <AlertCircle size={12} />}
                                        {b.status === 'ENVIADO' && <FileText size={12} />}
                                        <span>{b.status}</span>
                                    </span>
                                </td>
                                <td className="date-cell">{b.date}</td>
                                <td>
                                    <button className="icon-btn-sm"><MoreVertical size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .presupuestos-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .summary-card {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .summary-card h3 {
                    font-size: 28px;
                    font-weight: 800;
                }

                .c-sub {
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .icon-box {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-box.orange { background: rgba(245, 158, 11, 0.1); color: var(--accent-orange); }
                .icon-box.green { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); }
                .icon-box.blue { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }

                .table-container {
                    padding: 24px;
                }

                .budgets-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 24px;
                }

                .budgets-table th {
                    text-align: left;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding-bottom: 20px;
                }

                .budgets-table td {
                    padding: 16px 0;
                    border-top: 1px solid var(--border-color);
                    font-size: 14px;
                }

                .id-badge {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 12px;
                    color: var(--accent-blue);
                    width: fit-content;
                }

                .status-tag {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    width: fit-content;
                }

                .status-tag.aceptado { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); }
                .status-tag.enviado { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
                .status-tag.pendiente { background: rgba(245, 158, 11, 0.1); color: var(--accent-orange); }
                .status-tag.rechazado { background: rgba(239, 68, 68, 0.1); color: var(--accent-red); }

                .date-cell {
                    color: var(--text-secondary);
                }

                .filters-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            `}</style>
        </div>
    )
}

export default Presupuestos
