import React, { useState } from 'react'
import { Plus, Search, Grid, List, MoreVertical, Building2, User, Phone, Mail, MapPin, Users, DollarSign } from 'lucide-react'

const clients = [
    { id: 1, name: 'Industrias García S.L.', type: 'EMPRESA', contact: 'Pedro García', phone: '+34 912 345 678', email: 'pedro@industriasgarcia.com', address: 'Polígono Industrial Norte, Nave 24, Madrid', projects: 3, billed: 25500, initial: 'I' },
    { id: 2, name: 'María López', type: 'PARTICULAR', contact: 'María López', phone: '+34 666 123 456', email: 'maria.lopez@email.com', address: 'C/ Principal 45, Madrid', projects: 1, billed: 3200, initial: 'M' },
    { id: 3, name: 'TechCorp S.A.', type: 'EMPRESA', contact: 'Ana Martínez', phone: '+34 915 678 901', email: 'ana.martinez@techcorp.es', address: 'Av. Tecnología 100, Planta 5, Barcelona', projects: 2, billed: 8400, initial: 'T' },
    { id: 4, name: 'Hotel Marina 5*', type: 'EMPRESA', contact: 'Carlos Ruiz', phone: '+34 962 111 222', email: 'cruiz@hotelmarina.com', address: 'Av. del Puerto 1, Valencia', projects: 1, billed: 12000, initial: 'H' },
    { id: 5, name: 'Restaurante El Mar', type: 'EMPRESA', contact: 'Juan Postigo', phone: '+34 963 222 333', email: 'info@restauranteelmar.es', address: 'Paseo Marítimo 23, Valencia', projects: 1, billed: 4500, initial: 'R' },
    { id: 6, name: 'Comunidad Residencial Sol', type: 'COMUNIDAD', contact: 'Admin Sol', phone: '+34 914 555 666', email: 'administracion@residencialsol.es', address: 'Urbanización Sol, Bloque 3, Madrid', projects: 1, billed: 15000, initial: 'C' },
]

const ClientCard = ({ client }: any) => (
    <div className="glass card-hover client-card">
        <div className="client-card-header">
            <div className="client-avatar" style={{ backgroundColor: `hsla(${client.id * 60}, 70%, 50%, 0.1)`, border: `1px solid hsla(${client.id * 60}, 70%, 50%, 0.5)`, color: `hsl(${client.id * 60}, 70%, 70%)` }}>
                {client.initial}
            </div>
            <div className="client-main-info">
                <h3 className="client-name">{client.name}</h3>
                <div className="client-badges">
                    <span className={`type-badge ${client.type.toLowerCase()}`}>{client.type}</span>
                    <span className="since-tag">Cliente desde 2024</span>
                </div>
            </div>
        </div>

        <div className="client-contact-info">
            <div className="info-row"><Phone size={14} /> <span>{client.phone}</span></div>
            <div className="info-row"><Mail size={14} /> <span>{client.email}</span></div>
            <div className="info-row"><MapPin size={14} /> <span>{client.address}</span></div>
        </div>

        <div className="client-stats-grid">
            <div className="c-stat">
                <span className="c-val">{client.projects}</span>
                <span className="c-lab">Proyectos</span>
            </div>
            <div className="c-stat border-left">
                <span className="c-val success">€{client.billed.toLocaleString()}</span>
                <span className="c-lab">Facturado</span>
            </div>
        </div>

        <div className="client-card-footer">
            <button className="text-btn-sm underline">Ver Detalle</button>
            <button className="btn-secondary-sm">Nuevo Proyecto</button>
        </div>
    </div>
)

const Clientes = () => {
    return (
        <div className="clientes-container">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Clientes</h1>
                    <p className="view-subtitle">Gestiona tu cartera de clientes</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    <span>Nuevo Cliente</span>
                </button>
            </div>

            <div className="dashboard-summary-row stats-grid">
                <div className="glass summary-stat">
                    <Users size={20} color="var(--accent-purple)" />
                    <div>
                        <p className="label">Total Clientes</p>
                        <h3>6</h3>
                    </div>
                </div>
                <div className="glass summary-stat">
                    <Building2 size={20} color="var(--accent-blue)" />
                    <div>
                        <p className="label">Empresas</p>
                        <h3>4</h3>
                    </div>
                </div>
                <div className="glass summary-stat">
                    <User size={20} color="var(--accent-purple)" />
                    <div>
                        <p className="label">Particulares</p>
                        <h3>1</h3>
                    </div>
                </div>
                <div className="glass summary-stat">
                    <div className="icon-bg-orange"><DollarSign size={20} color="var(--accent-orange)" /></div>
                    <div>
                        <p className="label">Facturado Total</p>
                        <h3>€68,600</h3>
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={16} color="#94A3B8" />
                    <input type="text" placeholder="Buscar clientes..." />
                </div>
                <div className="view-switch">
                    <button className="active"><Grid size={18} /></button>
                    <button><List size={18} /></button>
                </div>
            </div>

            <div className="clients-grid">
                {clients.map(c => <ClientCard key={c.id} client={c} />)}
            </div>

            <style>{`
        .clientes-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .summary-stat {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .summary-stat .label { font-size: 12px; color: var(--text-secondary); margin-bottom: 2px; }
        .summary-stat h3 { font-size: 20px; font-weight: 700; }

        .clients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }

        .client-card {
           padding: 24px;
           display: flex;
           flex-direction: column;
           gap: 20px;
        }

        .client-card-header {
           display: flex;
           gap: 16px;
           align-items: flex-start;
        }

        .client-avatar {
           width: 48px;
           height: 48px;
           border-radius: 12px;
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 20px;
           font-weight: 800;
        }

        .client-name {
           font-size: 18px;
           font-weight: 700;
           margin-bottom: 4px;
        }

        .client-badges {
           display: flex;
           align-items: center;
           gap: 8px;
        }

        .type-badge {
           font-size: 10px;
           font-weight: 700;
           padding: 2px 8px;
           border-radius: 4px;
        }

        .type-badge.empresa { background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); }
        .type-badge.particular { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); }
        .type-badge.comunidad { background: rgba(245, 158, 11, 0.1); color: var(--accent-orange); }

        .since-tag {
           font-size: 11px;
           color: var(--text-secondary);
        }

        .client-contact-info {
           display: flex;
           flex-direction: column;
           gap: 8px;
        }

        .info-row {
           display: flex;
           align-items: center;
           gap: 10px;
           font-size: 13px;
           color: var(--text-secondary);
        }

        .client-stats-grid {
           display: grid;
           grid-template-columns: 1fr 1fr;
           padding: 16px 0;
           border-top: 1px solid var(--border-color);
           border-bottom: 1px solid var(--border-color);
        }

        .c-stat {
           display: flex;
           flex-direction: column;
           align-items: center;
        }

        .c-val { font-size: 20px; font-weight: 800; margin-bottom: 2px; }
        .c-val.success { color: var(--accent-green); }
        .c-lab { font-size: 12px; color: var(--text-secondary); font-weight: 600; }

        .border-left { border-left: 1px solid var(--border-color); }

        .client-card-footer {
           display: flex;
           justify-content: space-between;
           align-items: center;
        }

        .btn-secondary-sm {
           background: rgba(59, 130, 246, 0.1);
           border: 1px solid var(--accent-blue);
           color: var(--accent-blue);
           padding: 6px 12px;
           border-radius: 8px;
           font-size: 12px;
           font-weight: 600;
           cursor: pointer;
        }

        .underline { text-decoration: underline; }
        .text-btn-sm { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 13px; }

        .view-switch {
           display: flex;
           background: var(--bg-secondary);
           padding: 4px;
           border-radius: 8px;
        }

        .view-switch button {
           padding: 6px;
           border-radius: 6px;
           border: none;
           background: transparent;
           color: var(--text-secondary);
           cursor: pointer;
        }

        .view-switch button.active {
           background: var(--accent-blue);
           color: white;
        }
      `}</style>
        </div>
    )
}

export default Clientes
