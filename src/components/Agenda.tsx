import React, { useState } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'

const events = [
    { id: 1, title: 'Revisión Cuadro Eléctrico', type: 'MANTENIMIENTO', client: 'Hotel Marina', time: '09:00 - 11:00', location: 'Av. del Puerto 1', color: 'var(--accent-blue)' },
    { id: 2, title: 'Instalación Puntos de Carga', type: 'INSTALACIÓN', client: 'Residencial Sol', time: '11:30 - 14:00', location: 'C/ Principal 45', color: 'var(--accent-purple)' },
    { id: 3, title: 'Certificación Obras', type: 'ADMINISTRATIVO', client: 'TechCorp S.A.', time: '16:00 - 17:30', location: 'Oficinas Centrales', color: 'var(--accent-orange)' },
]

const Agenda = () => {
    return (
        <div className="agenda-container">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Agenda</h1>
                    <p className="view-subtitle">Planificación de trabajos y visitas</p>
                </div>
                <button className="btn-primary">
                    <Plus size={18} />
                    <span>Nueva Tarea</span>
                </button>
            </div>

            <div className="agenda-grid">
                <div className="glass calendar-sidebar">
                    <div className="calendar-header">
                        <h3>Febrero 2024</h3>
                        <div className="cal-nav">
                            <button><ChevronLeft size={18} /></button>
                            <button><ChevronRight size={18} /></button>
                        </div>
                    </div>

                    <div className="calendar-mini">
                        <div className="cal-days-labels">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <span key={d}>{d}</span>)}
                        </div>
                        <div className="cal-days-grid">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <button key={i} className={`cal-day ${i + 1 === 15 ? 'active' : ''}`}>
                                    {i + 1}
                                    {[5, 12, 15, 20].includes(i + 1) && <div className="dot"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="next-events">
                        <h4>PRÓXIMOS EVENTOS</h4>
                        <div className="mini-event-list">
                            <div className="m-event">
                                <div className="m-date">16<br /><span>FEB</span></div>
                                <div className="m-info">
                                    <p>Visita técnica</p>
                                    <span>Comunidad Norte</span>
                                </div>
                            </div>
                            <div className="m-event">
                                <div className="m-date">18<br /><span>FEB</span></div>
                                <div className="m-info">
                                    <p>Suministro material</p>
                                    <span>Almacén Central</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="agenda-day-view">
                    <div className="day-view-header">
                        <h2>Jueves, 15 de Febrero</h2>
                        <div className="view-options">
                            <button className="active">Día</button>
                            <button>Semana</button>
                            <button>Mes</button>
                        </div>
                    </div>

                    <div className="time-line-view">
                        <div className="time-slots">
                            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(t => (
                                <div key={t} className="time-slot">
                                    <span>{t}</span>
                                    <div className="slot-line"></div>
                                </div>
                            ))}
                        </div>

                        <div className="events-overlay">
                            {events.map(event => (
                                <div
                                    key={event.id}
                                    className="event-block glass"
                                    style={{
                                        top: `${(parseInt(event.time.split(':')[0]) - 8) * 80 + 20}px`,
                                        height: '140px',
                                        borderLeft: `4px solid ${event.color}`
                                    }}
                                >
                                    <div className="event-tag" style={{ color: event.color, background: `${event.color}15` }}>{event.type}</div>
                                    <h3>{event.title}</h3>
                                    <div className="event-meta">
                                        <div className="meta-item"><Clock size={14} /> {event.time}</div>
                                        <div className="meta-item"><User size={14} /> {event.client}</div>
                                        <div className="meta-item"><MapPin size={14} /> {event.location}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .agenda-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    height: calc(100vh - 160px);
                }

                .agenda-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 24px;
                    flex: 1;
                    overflow: hidden;
                }

                .calendar-sidebar {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .calendar-header h3 { font-size: 16px; font-weight: 700; }
                .cal-nav { display: flex; gap: 8px; }
                .cal-nav button { background: transparent; border: none; color: var(--text-secondary); cursor: pointer; }

                .calendar-mini {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .cal-days-labels {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    text-align: center;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-secondary);
                }

                .cal-days-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }

                .cal-day {
                    aspect-ratio: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 13px;
                    border-radius: 8px;
                    cursor: pointer;
                    position: relative;
                }

                .cal-day.active {
                    background: var(--accent-blue);
                    color: white;
                    font-weight: 700;
                }

                .cal-day .dot {
                    width: 4px;
                    height: 4px;
                    background: var(--accent-blue);
                    border-radius: 50%;
                    position: absolute;
                    bottom: 4px;
                }

                .cal-day.active .dot { background: white; }

                .next-events h4 {
                    font-size: 11px;
                    color: var(--text-secondary);
                    letter-spacing: 0.5px;
                    margin-bottom: 16px;
                }

                .mini-event-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .m-event {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .m-date {
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    text-align: center;
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 1.1;
                }

                .m-date span { font-size: 9px; color: var(--text-secondary); }

                .m-info p { font-size: 13px; font-weight: 600; }
                .m-info span { font-size: 11px; color: var(--text-secondary); }

                .agenda-day-view {
                    flex: 1;
                    overflow-y: auto;
                    padding-right: 8px;
                }

                .day-view-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    position: sticky;
                    top: 0;
                    background: var(--bg-primary);
                    z-index: 10;
                    padding: 10px 0;
                }

                .view-options {
                    display: flex;
                    background: var(--bg-secondary);
                    padding: 4px;
                    border-radius: 8px;
                }

                .view-options button {
                    padding: 6px 16px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .view-options button.active { background: rgba(255, 255, 255, 0.05); color: white; }

                .time-line-view {
                    position: relative;
                    padding-left: 60px;
                }

                .time-slot {
                    height: 80px;
                    display: flex;
                    align-items: flex-start;
                    position: relative;
                }

                .time-slot span {
                    position: absolute;
                    left: -60px;
                    top: -10px;
                    font-size: 12px;
                    color: var(--text-secondary);
                    font-family: monospace;
                }

                .slot-line {
                    flex: 1;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.05);
                }

                .events-overlay {
                    position: absolute;
                    top: 0;
                    left: 60px;
                    right: 0;
                    bottom: 0;
                }

                .event-block {
                    position: absolute;
                    left: 10px;
                    right: 10px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    z-index: 5;
                }

                .event-tag {
                    font-size: 10px;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: 4px;
                    width: fit-content;
                }

                .event-block h3 { font-size: 15px; font-weight: 700; }

                .event-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    )
}

export default Agenda
