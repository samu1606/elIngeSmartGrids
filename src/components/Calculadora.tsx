import React, { useState } from 'react'
import {
    Zap,
    Shield,
    Settings,
    Lightbulb,
    Activity,
    Hash,
    RefreshCw,
    Pipette,
    Palette
} from 'lucide-react'

const Calculadora = () => {
    const [activeCalc, setActiveCalc] = useState('seccion')

    // Section Calculation State
    const [potencia, setPotencia] = useState(10000)
    const [tension, setTension] = useState(400)
    const [factorPotencia, setFactorPotencia] = useState(0.9)
    const [sistema, setSistema] = useState('Trifásico')
    const [result, setResult] = useState<number | null>(null)

    const calcTabs = [
        { id: 'seccion', label: 'Sección', icon: <Pipette size={16} /> },
        { id: 'protecciones', label: 'Protecciones', icon: <Shield size={16} /> },
        { id: 'motores', label: 'Motores', icon: <Settings size={16} /> },
        { id: 'iluminacion', label: 'Iluminación', icon: <Lightbulb size={16} /> },
        { id: 'reactiva', label: 'Reactiva', icon: <Activity size={16} /> },
        { id: 'ley-ohm', label: 'Ley Ohm', icon: <Hash size={16} /> },
        { id: 'conversor', label: 'Conversor', icon: <RefreshCw size={16} /> },
        { id: 'tuberia', label: 'Tubería', icon: <Zap size={16} /> },
        { id: 'colores', label: 'Colores', icon: <Palette size={16} /> },
    ]

    const handleCalculate = () => {
        // Basic simplified formula for demonstration
        // I = P / (V * cos φ * √3) for 3-phase
        const denominator = sistema === 'Trifásico' ? (tension * factorPotencia * Math.sqrt(3)) : (tension * factorPotencia)
        const current = potencia / denominator
        // Simplified section based on current (typical rule of thumb/table lookup placeholder)
        setResult(current / 5) // Placeholder logic
    }

    return (
        <div className="calculadora-container">
            <div className="view-header">
                <div>
                    <h1 className="view-title">Calculadora Eléctrica</h1>
                    <p className="view-subtitle">Herramientas profesionales según REBT e IEC</p>
                </div>
            </div>

            <div className="calc-tabs-wrapper">
                <div className="calc-tabs">
                    {calcTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`calc-tab-btn ${activeCalc === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveCalc(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="calc-content-grid">
                <div className="glass calc-inputs">
                    <div className="card-header-with-icon">
                        <div className="icon-box" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                            <Pipette size={20} color="var(--accent-blue)" />
                        </div>
                        <h3>Cálculo de Sección</h3>
                    </div>

                    <div className="inputs-grid">
                        <div className="input-field">
                            <label>Potencia (W)</label>
                            <input type="number" value={potencia} onChange={(e) => setPotencia(Number(e.target.value))} />
                        </div>
                        <div className="input-field">
                            <label>Tensión (V)</label>
                            <input type="number" value={tension} onChange={(e) => setTension(Number(e.target.value))} />
                        </div>
                        <div className="input-field">
                            <label>Factor de Potencia</label>
                            <input type="number" step="0.01" value={factorPotencia} onChange={(e) => setFactorPotencia(Number(e.target.value))} />
                        </div>
                        <div className="input-field">
                            <label>Sistema</label>
                            <select value={sistema} onChange={(e) => setSistema(e.target.value)}>
                                <option>Trifásico</option>
                                <option>Monofásico</option>
                            </select>
                        </div>
                    </div>

                    <button className="calculate-btn" onClick={handleCalculate}>
                        <Zap size={18} />
                        <span>Calcular Sección</span>
                    </button>
                </div>

                <div className="glass calc-results">
                    <h3>Resultados</h3>
                    <div className="results-placeholder">
                        {!result ? (
                            <div className="empty-results">
                                <Pipette size={48} color="rgba(255,255,255,0.1)" />
                                <p>Ingresa los datos y presiona calcular</p>
                            </div>
                        ) : (
                            <div className="result-display">
                                <div className="result-main">
                                    <span className="result-value">{result.toFixed(2)}</span>
                                    <span className="result-unit">mm²</span>
                                </div>
                                <p className="result-label">Sección Teórica Calculada</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .calculadora-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .calc-tabs-wrapper {
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .calc-tabs {
          display: flex;
          gap: 12px;
          min-width: max-content;
        }

        .calc-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 100px;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calc-tab-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .calc-tab-btn.active {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .calc-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .calc-inputs {
          padding: 32px;
        }

        .card-header-with-icon {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }

        .input-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-field label {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .input-field input, .input-field select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: white;
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
        }

        .calculate-btn {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          background: linear-gradient(to right, var(--accent-blue), #60A5FA);
          color: white;
          border: none;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calculate-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
        }

        .calc-results {
          padding: 32px;
          background: rgba(0, 0, 0, 0.2);
        }

        .results-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
        }

        .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          color: var(--text-secondary);
        }

        .result-display {
          text-align: center;
        }

        .result-main {
           display: flex;
           align-items: baseline;
           justify-content: center;
           gap: 8px;
           margin-bottom: 8px;
        }

        .result-value {
           font-size: 64px;
           font-weight: 800;
           background: linear-gradient(to bottom, #fff, #94A3B8);
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
        }

        .result-unit {
           font-size: 24px;
           font-weight: 600;
           color: var(--text-secondary);
        }

        .result-label {
           color: var(--text-secondary);
           font-size: 14px;
           font-weight: 600;
        }
      `}</style>
        </div>
    )
}

export default Calculadora
