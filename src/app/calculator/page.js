'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

// Data tables
const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300]
const materials = { copper: { resistivity: 0.0172, name: 'Cobre' }, aluminium: { resistivity: 0.0282, name: 'Aluminio' } }
const ampacityTable = {
    pvc: { copper: { 1.5: 15, 2.5: 21, 4: 27, 6: 36, 10: 50, 16: 66, 25: 84, 35: 104, 50: 125, 70: 160, 95: 194, 120: 225, 150: 260, 185: 297, 240: 350, 300: 400 } },
    xlpe: { copper: { 1.5: 19, 2.5: 26, 4: 35, 6: 46, 10: 65, 16: 87, 25: 114, 35: 141, 50: 167, 70: 214, 95: 259, 120: 301, 150: 343, 185: 391, 240: 468, 300: 538 } }
}
const breakerSizes = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400, 630]
const cableColors = {
    phase: { L1: { color: '#8B4513', name: 'Marrón' }, L2: { color: '#1C1C1C', name: 'Negro' }, L3: { color: '#808080', name: 'Gris' } },
    neutral: { color: '#0066CC', name: 'Azul' },
    ground: { color: '#228B22', name: 'Verde-Amarillo', secondary: '#FFD700' }
}
const conduitSizes = [16, 20, 25, 32, 40, 50, 63]

export default function CalculatorPage() {
    const [activeTab, setActiveTab] = useState('section')

    // All calculator states
    const [sectionInputs, setSectionInputs] = useState({ power: 10000, voltage: 400, powerFactor: 0.9, phases: '3', material: 'copper', insulation: 'xlpe', length: 50, maxVoltageDrop: 3 })
    const [sectionResult, setSectionResult] = useState(null)
    const [protInputs, setProtInputs] = useState({ current: 25, cableSection: 6, insulation: 'xlpe' })
    const [protResult, setProtResult] = useState(null)
    const [lightInputs, setLightInputs] = useState({ area: 50, luxRequired: 500, lumensPerLuminaire: 3000, utilizationFactor: 0.7, maintenanceFactor: 0.8 })
    const [lightResult, setLightResult] = useState(null)
    const [pfInputs, setPfInputs] = useState({ activePower: 100, currentPF: 0.75, targetPF: 0.95, voltage: 400 })
    const [pfResult, setPfResult] = useState(null)
    const [ohmInputs, setOhmInputs] = useState({ voltage: '', current: '', resistance: '', power: '' })
    const [ohmResult, setOhmResult] = useState(null)
    const [motorInputs, setMotorInputs] = useState({ power: 7.5, voltage: 400, efficiency: 0.9, powerFactor: 0.85, startType: 'direct' })
    const [motorResult, setMotorResult] = useState(null)
    const [converterInputs, setConverterInputs] = useState({ value: 1, fromUnit: 'kW', toUnit: 'HP' })
    const [converterResult, setConverterResult] = useState(null)
    const [conduitInputs, setConduitInputs] = useState({ cables: [{ section: 2.5, count: 3 }] })
    const [conduitResult, setConduitResult] = useState(null)

    // Cable Section Calculator
    const calculateSection = () => {
        const { power, voltage, powerFactor, phases, material, insulation, length, maxVoltageDrop } = sectionInputs
        const isThreePhase = phases === '3'
        const current = isThreePhase ? power / (Math.sqrt(3) * voltage * powerFactor) : power / (voltage * powerFactor)
        const ampTable = ampacityTable[insulation]?.copper || ampacityTable.xlpe.copper
        let sectionByAmpacity = standardSections.find(s => ampTable[s] >= current) || 300
        const resistivity = materials[material].resistivity
        const allowedDrop = (maxVoltageDrop / 100) * voltage
        const sectionByDrop = isThreePhase ? (Math.sqrt(3) * resistivity * length * current) / allowedDrop : (2 * resistivity * length * current) / allowedDrop
        const sectionByDropStd = standardSections.find(s => s >= sectionByDrop) || 300
        const finalSection = Math.max(sectionByAmpacity, sectionByDropStd)
        const actualDrop = isThreePhase ? (Math.sqrt(3) * resistivity * length * current) / finalSection : (2 * resistivity * length * current) / finalSection
        setSectionResult({ current: current.toFixed(2), sectionByAmpacity, sectionByDropStd, recommendedSection: finalSection, actualVoltageDrop: actualDrop.toFixed(2), actualVoltageDropPercent: ((actualDrop / voltage) * 100).toFixed(2), maxAmpacity: ampTable[finalSection] })
    }

    // Protection Calculator
    const calculateProtection = () => {
        const { current, cableSection, insulation } = protInputs
        const ampTable = ampacityTable[insulation]?.copper || ampacityTable.xlpe.copper
        const Iz = ampTable[cableSection] || 50
        const suitableBreaker = breakerSizes.find(b => b >= current && b <= Iz)
        const recommendedBreaker = suitableBreaker || breakerSizes.find(b => b >= current)
        setProtResult({ designCurrent: current, cableCapacity: Iz, recommendedBreaker, compliant: suitableBreaker ? 'Cumple ITC-BT-22' : 'Revisar sección cable', differentialSensitivity: current <= 32 ? '30mA' : current <= 63 ? '30mA o 300mA' : '300mA' })
    }

    // Lighting Calculator
    const calculateLighting = () => {
        const { area, luxRequired, lumensPerLuminaire, utilizationFactor, maintenanceFactor } = lightInputs
        const totalLumens = (luxRequired * area) / (utilizationFactor * maintenanceFactor)
        const numLuminaires = Math.ceil(totalLumens / lumensPerLuminaire)
        const actualLux = (numLuminaires * lumensPerLuminaire * utilizationFactor * maintenanceFactor) / area
        setLightResult({ totalLumens: totalLumens.toFixed(0), numLuminaires, actualLux: actualLux.toFixed(0) })
    }

    // Power Factor Calculator
    const calculatePowerFactor = () => {
        const { activePower, currentPF, targetPF } = pfInputs
        const P = activePower * 1000
        const Q1 = P * Math.tan(Math.acos(currentPF))
        const Q2 = P * Math.tan(Math.acos(targetPF))
        const Qc = Q1 - Q2
        setPfResult({ reactiveNeeded: (Qc / 1000).toFixed(2), capacitorKvar: (Qc / 1000).toFixed(1), currentReactive: (Q1 / 1000).toFixed(2), targetReactive: (Q2 / 1000).toFixed(2), savings: ((1 / currentPF - 1 / targetPF) * 100).toFixed(1) })
    }

    // Ohm's Law Calculator
    const calculateOhm = () => {
        let { voltage, current, resistance, power } = ohmInputs
        const v = parseFloat(voltage), i = parseFloat(current), r = parseFloat(resistance), p = parseFloat(power)
        let result = null
        if (v && i) result = { voltage: v, current: i, resistance: (v / i).toFixed(3), power: (v * i).toFixed(2) }
        else if (v && r) result = { voltage: v, current: (v / r).toFixed(3), resistance: r, power: (v * v / r).toFixed(2) }
        else if (i && r) result = { voltage: (i * r).toFixed(2), current: i, resistance: r, power: (i * i * r).toFixed(2) }
        else if (v && p) result = { voltage: v, current: (p / v).toFixed(3), resistance: (v * v / p).toFixed(3), power: p }
        else if (i && p) result = { voltage: (p / i).toFixed(2), current: i, resistance: (p / (i * i)).toFixed(3), power: p }
        else if (r && p) result = { voltage: Math.sqrt(p * r).toFixed(2), current: Math.sqrt(p / r).toFixed(3), resistance: r, power: p }
        setOhmResult(result)
    }

    // Motor Calculator
    const calculateMotor = () => {
        const { power, voltage, efficiency, powerFactor, startType } = motorInputs
        const powerWatts = power * 1000
        const nominalCurrent = powerWatts / (Math.sqrt(3) * voltage * efficiency * powerFactor)
        const startMultipliers = { direct: 7, star_delta: 2.5, soft_starter: 3, vfd: 1.5 }
        const startCurrent = nominalCurrent * startMultipliers[startType]
        const recommendedBreaker = breakerSizes.find(b => b >= nominalCurrent * 1.25) || breakerSizes[breakerSizes.length - 1]
        const recommendedContactor = breakerSizes.find(b => b >= nominalCurrent * 1.1) || breakerSizes[breakerSizes.length - 1]
        const thermalMin = nominalCurrent * 0.95, thermalMax = nominalCurrent * 1.05
        const cableSection = standardSections.find(s => ampacityTable.xlpe.copper[s] >= nominalCurrent * 1.25) || 300
        setMotorResult({ nominalCurrent: nominalCurrent.toFixed(2), startCurrent: startCurrent.toFixed(2), startMultiplier: startMultipliers[startType], recommendedBreaker, recommendedContactor, thermalRange: `${thermalMin.toFixed(1)} - ${thermalMax.toFixed(1)} A`, cableSection, powerHP: (power * 1.341).toFixed(2) })
    }

    // Unit Converter
    const conversions = { kW: 1, HP: 0.7457, CV: 0.7355, BTU_h: 0.000293, W: 0.001, MW: 1000, kcal_h: 0.001163 }
    const calculateConverter = () => {
        const { value, fromUnit, toUnit } = converterInputs
        const inKW = value * conversions[fromUnit]
        const result = inKW / conversions[toUnit]
        setConverterResult({ input: value, fromUnit, toUnit, result: result.toFixed(4), inKW: inKW.toFixed(4) })
    }

    // Conduit Calculator
    const calculateConduit = () => {
        const cableDiameters = { 1.5: 3.5, 2.5: 4.0, 4: 4.5, 6: 5.2, 10: 6.5, 16: 7.8, 25: 9.5, 35: 11, 50: 13, 70: 15, 95: 17.5 }
        let totalArea = 0
        conduitInputs.cables.forEach(c => {
            const diam = cableDiameters[c.section] || 5
            totalArea += Math.PI * Math.pow(diam / 2, 2) * c.count
        })
        const maxFillRatio = 0.4
        const requiredArea = totalArea / maxFillRatio
        const requiredDiameter = 2 * Math.sqrt(requiredArea / Math.PI)
        const recommendedConduit = conduitSizes.find(s => s >= requiredDiameter) || conduitSizes[conduitSizes.length - 1]
        const conduitArea = Math.PI * Math.pow(recommendedConduit / 2, 2)
        const fillPercentage = (totalArea / conduitArea) * 100
        setConduitResult({ totalCableArea: totalArea.toFixed(1), requiredDiameter: requiredDiameter.toFixed(1), recommendedConduit, fillPercentage: fillPercentage.toFixed(1), compliant: fillPercentage <= 40 })
    }

    const addCable = () => setConduitInputs({ cables: [...conduitInputs.cables, { section: 2.5, count: 1 }] })
    const removeCable = (index) => setConduitInputs({ cables: conduitInputs.cables.filter((_, i) => i !== index) })
    const updateCable = (index, field, value) => {
        const newCables = [...conduitInputs.cables]
        newCables[index][field] = field === 'count' ? parseInt(value) : parseFloat(value)
        setConduitInputs({ cables: newCables })
    }

    const tabs = [
        { id: 'section', name: 'Sección', icon: '📏' },
        { id: 'protection', name: 'Protecciones', icon: '🛡️' },
        { id: 'motor', name: 'Motores', icon: '⚙️' },
        { id: 'lighting', name: 'Iluminación', icon: '💡' },
        { id: 'powerFactor', name: 'Reactiva', icon: '⚡' },
        { id: 'ohm', name: 'Ley Ohm', icon: '🔌' },
        { id: 'converter', name: 'Conversor', icon: '🔄' },
        { id: 'conduit', name: 'Tubería', icon: '🔧' },
        { id: 'colors', name: 'Colores', icon: '🎨' }
    ]

    const InputField = ({ label, value, onChange, type = 'number', step, min, max }) => (
        <div><label className="label">{label}</label><input type={type} step={step} min={min} max={max} value={value} onChange={onChange} className="input-field" /></div>
    )
    const SelectField = ({ label, value, onChange, options }) => (
        <div><label className="label">{label}</label><select value={value} onChange={onChange} className="select-field">{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
    )
    const ResultCard = ({ label, value, unit }) => (
        <div className="p-4 rounded-xl bg-slate-800/50"><p className="text-gray-400 text-xs uppercase">{label}</p><p className="text-xl font-semibold text-white">{value} {unit}</p></div>
    )
    const BigResult = ({ label, value, unit, gradient = 'from-blue-500 to-cyan-500' }) => (
        <div className={`p-6 rounded-2xl bg-gradient-to-br ${gradient}/20 border border-${gradient.split(' ')[0].replace('from-', '')}/30`}>
            <p className="text-gray-400 text-sm mb-2">{label}</p><p className="text-5xl font-bold text-white">{value} <span className="text-2xl">{unit}</span></p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
            <Sidebar />
            <main className="main-content">
                <Header title="Calculadora Eléctrica" subtitle="Herramientas profesionales según REBT e IEC" />

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>
                            <span>{tab.icon}</span><span className="hidden md:inline">{tab.name}</span>
                        </button>
                    ))}
                </div>

                {/* Section Calculator */}
                {activeTab === 'section' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">📏</span>Cálculo de Sección
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InputField label="Potencia (W)" value={sectionInputs.power} onChange={e => setSectionInputs({ ...sectionInputs, power: +e.target.value })} />
                                <InputField label="Tensión (V)" value={sectionInputs.voltage} onChange={e => setSectionInputs({ ...sectionInputs, voltage: +e.target.value })} />
                                <InputField label="Factor de Potencia" value={sectionInputs.powerFactor} onChange={e => setSectionInputs({ ...sectionInputs, powerFactor: +e.target.value })} step="0.01" />
                                <SelectField label="Sistema" value={sectionInputs.phases} onChange={e => setSectionInputs({ ...sectionInputs, phases: e.target.value })} options={[{ value: '1', label: 'Monofásico' }, { value: '3', label: 'Trifásico' }]} />
                                <SelectField label="Material" value={sectionInputs.material} onChange={e => setSectionInputs({ ...sectionInputs, material: e.target.value })} options={[{ value: 'copper', label: 'Cobre' }, { value: 'aluminium', label: 'Aluminio' }]} />
                                <SelectField label="Aislamiento" value={sectionInputs.insulation} onChange={e => setSectionInputs({ ...sectionInputs, insulation: e.target.value })} options={[{ value: 'pvc', label: 'PVC (70°C)' }, { value: 'xlpe', label: 'XLPE (90°C)' }]} />
                                <InputField label="Longitud (m)" value={sectionInputs.length} onChange={e => setSectionInputs({ ...sectionInputs, length: +e.target.value })} />
                                <InputField label="Caída Tensión Máx (%)" value={sectionInputs.maxVoltageDrop} onChange={e => setSectionInputs({ ...sectionInputs, maxVoltageDrop: +e.target.value })} step="0.5" />
                            </div>
                            <button onClick={calculateSection} className="btn-primary w-full mt-6">⚡ Calcular Sección</button>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Resultados</h2>
                            {sectionResult ? (
                                <div className="space-y-4">
                                    <BigResult label="Sección Recomendada" value={sectionResult.recommendedSection} unit="mm²" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <ResultCard label="Corriente" value={sectionResult.current} unit="A" />
                                        <ResultCard label="Capacidad Cable" value={sectionResult.maxAmpacity} unit="A" />
                                        <ResultCard label="Caída Tensión" value={sectionResult.actualVoltageDrop} unit="V" />
                                        <ResultCard label="Caída %" value={sectionResult.actualVoltageDropPercent} unit="%" />
                                    </div>
                                    <div className={`p-4 rounded-xl ${parseFloat(sectionResult.actualVoltageDropPercent) <= sectionInputs.maxVoltageDrop ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                                        <p className={parseFloat(sectionResult.actualVoltageDropPercent) <= sectionInputs.maxVoltageDrop ? 'text-green-400' : 'text-red-400'}>
                                            {parseFloat(sectionResult.actualVoltageDropPercent) <= sectionInputs.maxVoltageDrop ? '✅ Cumple REBT' : '⚠️ Excede caída máxima'}
                                        </p>
                                    </div>
                                </div>
                            ) : <div className="flex flex-col items-center justify-center h-64 text-center"><div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">📏</div><p className="text-gray-400">Ingresa los datos y presiona calcular</p></div>}
                        </div>
                    </div>
                )}

                {/* Protection Calculator */}
                {activeTab === 'protection' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">🛡️</span>Cálculo de Protecciones
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InputField label="Corriente de Diseño (A)" value={protInputs.current} onChange={e => setProtInputs({ ...protInputs, current: +e.target.value })} />
                                <SelectField label="Sección Cable (mm²)" value={protInputs.cableSection} onChange={e => setProtInputs({ ...protInputs, cableSection: +e.target.value })} options={standardSections.map(s => ({ value: s, label: `${s} mm²` }))} />
                                <SelectField label="Aislamiento" value={protInputs.insulation} onChange={e => setProtInputs({ ...protInputs, insulation: e.target.value })} options={[{ value: 'pvc', label: 'PVC' }, { value: 'xlpe', label: 'XLPE' }]} />
                            </div>
                            <button onClick={calculateProtection} className="btn-warning w-full mt-6">🛡️ Calcular Protección</button>
                            <div className="mt-6 p-4 rounded-xl bg-slate-800/50">
                                <p className="text-blue-400 font-medium mb-2">📚 Criterio ITC-BT-22</p>
                                <p className="text-gray-400 text-sm">Ib ≤ In ≤ Iz</p>
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Resultados</h2>
                            {protResult ? (
                                <div className="space-y-4">
                                    <BigResult label="Magnetotérmico" value={protResult.recommendedBreaker} unit="A" gradient="from-amber-500 to-orange-500" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <ResultCard label="Corriente Diseño (Ib)" value={protResult.designCurrent} unit="A" />
                                        <ResultCard label="Capacidad Cable (Iz)" value={protResult.cableCapacity} unit="A" />
                                    </div>
                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                        <p className="text-green-400 font-medium">Diferencial: {protResult.differentialSensitivity}</p>
                                    </div>
                                    <span className={`badge ${protResult.compliant.includes('Cumple') ? 'badge-success' : 'badge-warning'}`}>{protResult.compliant}</span>
                                </div>
                            ) : <div className="flex flex-col items-center justify-center h-64 text-center"><div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">🛡️</div><p className="text-gray-400">Ingresa los datos y presiona calcular</p></div>}
                        </div>
                    </div>
                )}

                {/* Motor Calculator */}
                {activeTab === 'motor' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">⚙️</span>Cálculo de Motores
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InputField label="Potencia (kW)" value={motorInputs.power} onChange={e => setMotorInputs({ ...motorInputs, power: +e.target.value })} step="0.5" />
                                <InputField label="Tensión (V)" value={motorInputs.voltage} onChange={e => setMotorInputs({ ...motorInputs, voltage: +e.target.value })} />
                                <InputField label="Rendimiento (η)" value={motorInputs.efficiency} onChange={e => setMotorInputs({ ...motorInputs, efficiency: +e.target.value })} step="0.01" />
                                <InputField label="Factor Potencia" value={motorInputs.powerFactor} onChange={e => setMotorInputs({ ...motorInputs, powerFactor: +e.target.value })} step="0.01" />
                                <div className="sm:col-span-2">
                                    <SelectField label="Tipo de Arranque" value={motorInputs.startType} onChange={e => setMotorInputs({ ...motorInputs, startType: e.target.value })}
                                        options={[{ value: 'direct', label: 'Directo (DOL) - 7x In' }, { value: 'star_delta', label: 'Estrella-Triángulo (Y-Δ) - 2.5x In' }, { value: 'soft_starter', label: 'Arrancador Suave - 3x In' }, { value: 'vfd', label: 'Variador (VFD) - 1.5x In' }]} />
                                </div>
                            </div>
                            <button onClick={calculateMotor} className="w-full mt-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">⚙️ Calcular Motor</button>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Resultados</h2>
                            {motorResult ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-center">
                                            <p className="text-3xl font-bold text-indigo-400">{motorResult.nominalCurrent}</p><p className="text-gray-400 text-sm">Intensidad Nominal (A)</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-center">
                                            <p className="text-3xl font-bold text-red-400">{motorResult.startCurrent}</p><p className="text-gray-400 text-sm">Intensidad Arranque (A)</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-800/50">
                                        <p className="text-gray-400 text-xs mb-1">Potencia equivalente</p>
                                        <p className="text-white text-lg font-semibold">{motorResult.powerHP} HP</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <ResultCard label="Magnetotérmico" value={motorResult.recommendedBreaker} unit="A" />
                                        <ResultCard label="Contactor" value={motorResult.recommendedContactor} unit="A" />
                                        <ResultCard label="Relé Térmico" value={motorResult.thermalRange} unit="" />
                                        <ResultCard label="Sección Cable" value={motorResult.cableSection} unit="mm²" />
                                    </div>
                                </div>
                            ) : <div className="flex flex-col items-center justify-center h-64 text-center"><div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">⚙️</div><p className="text-gray-400">Ingresa los datos del motor</p></div>}
                        </div>
                    </div>
                )}

                {/* Lighting Calculator */}
                {activeTab === 'lighting' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">💡</span>Cálculo de Iluminación
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InputField label="Área (m²)" value={lightInputs.area} onChange={e => setLightInputs({ ...lightInputs, area: +e.target.value })} />
                                <InputField label="Lux Requeridos" value={lightInputs.luxRequired} onChange={e => setLightInputs({ ...lightInputs, luxRequired: +e.target.value })} />
                                <InputField label="Lúmenes/Luminaria" value={lightInputs.lumensPerLuminaire} onChange={e => setLightInputs({ ...lightInputs, lumensPerLuminaire: +e.target.value })} />
                                <InputField label="Factor Utilización" value={lightInputs.utilizationFactor} onChange={e => setLightInputs({ ...lightInputs, utilizationFactor: +e.target.value })} step="0.1" />
                                <InputField label="Factor Mantenimiento" value={lightInputs.maintenanceFactor} onChange={e => setLightInputs({ ...lightInputs, maintenanceFactor: +e.target.value })} step="0.1" />
                            </div>
                            <button onClick={calculateLighting} className="w-full mt-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg">💡 Calcular</button>
                            <div className="mt-6 p-4 rounded-xl bg-slate-800/50">
                                <p className="text-yellow-400 font-medium mb-2">📚 Niveles Referencia (UNE-EN 12464-1)</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                                    <span>• Oficinas: 500 lux</span><span>• Industria: 300 lux</span>
                                    <span>• Almacén: 150 lux</span><span>• Pasillos: 100 lux</span>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Resultados</h2>
                            {lightResult ? (
                                <div className="space-y-4">
                                    <BigResult label="Luminarias Necesarias" value={lightResult.numLuminaires} unit="uds" gradient="from-yellow-500 to-amber-500" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <ResultCard label="Lúmenes Totales" value={lightResult.totalLumens} unit="lm" />
                                        <ResultCard label="Lux Finales" value={lightResult.actualLux} unit="lux" />
                                    </div>
                                </div>
                            ) : <div className="flex flex-col items-center justify-center h-64 text-center"><div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">💡</div><p className="text-gray-400">Ingresa los datos</p></div>}
                        </div>
                    </div>
                )}

                {/* Power Factor Calculator */}
                {activeTab === 'powerFactor' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">⚡</span>Compensación Reactiva
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InputField label="Potencia Activa (kW)" value={pfInputs.activePower} onChange={e => setPfInputs({ ...pfInputs, activePower: +e.target.value })} />
                                <InputField label="Factor Potencia Actual" value={pfInputs.currentPF} onChange={e => setPfInputs({ ...pfInputs, currentPF: +e.target.value })} step="0.01" />
                                <InputField label="Factor Potencia Objetivo" value={pfInputs.targetPF} onChange={e => setPfInputs({ ...pfInputs, targetPF: +e.target.value })} step="0.01" />
                                <InputField label="Tensión (V)" value={pfInputs.voltage} onChange={e => setPfInputs({ ...pfInputs, voltage: +e.target.value })} />
                            </div>
                            <button onClick={calculatePowerFactor} className="w-full mt-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">⚡ Calcular Condensador</button>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Resultados</h2>
                            {pfResult ? (
                                <div className="space-y-4">
                                    <BigResult label="Capacitor Necesario" value={pfResult.capacitorKvar} unit="kVAr" gradient="from-purple-500 to-pink-500" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <ResultCard label="Reactiva Actual" value={pfResult.currentReactive} unit="kVAr" />
                                        <ResultCard label="Reactiva Final" value={pfResult.targetReactive} unit="kVAr" />
                                    </div>
                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                        <p className="text-green-400">💰 Ahorro estimado: ~{pfResult.savings}%</p>
                                    </div>
                                </div>
                            ) : <div className="flex flex-col items-center justify-center h-64 text-center"><div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">⚡</div><p className="text-gray-400">Ingresa los datos</p></div>}
                        </div>
                    </div>
                )}

                {/* Ohm's Law */}
                {activeTab === 'ohm' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">🔌</span>Ley de Ohm
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">Ingresa 2 valores para calcular los demás</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <InputField label="Tensión (V)" value={ohmInputs.voltage} onChange={e => setOhmInputs({ ...ohmInputs, voltage: e.target.value })} />
                                <InputField label="Corriente (A)" value={ohmInputs.current} onChange={e => setOhmInputs({ ...ohmInputs, current: e.target.value })} />
                                <InputField label="Resistencia (Ω)" value={ohmInputs.resistance} onChange={e => setOhmInputs({ ...ohmInputs, resistance: e.target.value })} />
                                <InputField label="Potencia (W)" value={ohmInputs.power} onChange={e => setOhmInputs({ ...ohmInputs, power: e.target.value })} />
                            </div>
                            <button onClick={calculateOhm} className="btn-success w-full mt-6">🔌 Calcular</button>
                            <button onClick={() => { setOhmInputs({ voltage: '', current: '', resistance: '', power: '' }); setOhmResult(null) }} className="w-full mt-2 py-3 rounded-xl font-semibold text-gray-400 bg-slate-700 hover:bg-slate-600">Limpiar</button>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Resultados</h2>
                            {ohmResult ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-center"><p className="text-4xl font-bold text-blue-400">{ohmResult.voltage}</p><p className="text-gray-400 mt-2">Voltios (V)</p></div>
                                    <div className="p-6 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-center"><p className="text-4xl font-bold text-amber-400">{ohmResult.current}</p><p className="text-gray-400 mt-2">Amperios (A)</p></div>
                                    <div className="p-6 rounded-2xl bg-green-500/20 border border-green-500/30 text-center"><p className="text-4xl font-bold text-green-400">{ohmResult.resistance}</p><p className="text-gray-400 mt-2">Ohmios (Ω)</p></div>
                                    <div className="p-6 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-center"><p className="text-4xl font-bold text-purple-400">{ohmResult.power}</p><p className="text-gray-400 mt-2">Vatios (W)</p></div>
                                </div>
                            ) : <div className="flex flex-col items-center justify-center h-64 text-center"><div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">🔌</div><p className="text-gray-400">Ingresa 2 valores</p></div>}
                        </div>
                    </div>
                )}

                {/* Unit Converter */}
                {activeTab === 'converter' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">🔄</span>Conversor de Potencia
                            </h2>
                            <div className="space-y-4">
                                <InputField label="Valor" value={converterInputs.value} onChange={e => setConverterInputs({ ...converterInputs, value: +e.target.value })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <SelectField label="De" value={converterInputs.fromUnit} onChange={e => setConverterInputs({ ...converterInputs, fromUnit: e.target.value })}
                                        options={[{ value: 'kW', label: 'kW' }, { value: 'HP', label: 'HP (caballo)' }, { value: 'CV', label: 'CV' }, { value: 'W', label: 'W' }, { value: 'MW', label: 'MW' }, { value: 'BTU_h', label: 'BTU/h' }, { value: 'kcal_h', label: 'kcal/h' }]} />
                                    <SelectField label="A" value={converterInputs.toUnit} onChange={e => setConverterInputs({ ...converterInputs, toUnit: e.target.value })}
                                        options={[{ value: 'kW', label: 'kW' }, { value: 'HP', label: 'HP (caballo)' }, { value: 'CV', label: 'CV' }, { value: 'W', label: 'W' }, { value: 'MW', label: 'MW' }, { value: 'BTU_h', label: 'BTU/h' }, { value: 'kcal_h', label: 'kcal/h' }]} />
                                </div>
                            </div>
                            <button onClick={calculateConverter} className="w-full mt-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg">🔄 Convertir</button>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Resultado</h2>
                            {converterResult ? (
                                <div className="space-y-4">
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-center">
                                        <p className="text-gray-400 text-sm mb-2">{converterResult.input} {converterResult.fromUnit} =</p>
                                        <p className="text-5xl font-bold text-white">{converterResult.result}</p>
                                        <p className="text-2xl text-teal-400 mt-2">{converterResult.toUnit}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-800/50">
                                        <p className="text-gray-400 text-sm">Equivalente en kW: <span className="text-white font-semibold">{converterResult.inKW}</span></p>
                                    </div>
                                </div>
                            ) : <div className="flex flex-col items-center justify-center h-64 text-center"><div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">🔄</div><p className="text-gray-400">Ingresa el valor a convertir</p></div>}
                        </div>
                    </div>
                )}

                {/* Conduit Calculator */}
                {activeTab === 'conduit' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">🔧</span>Cálculo de Tubería
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">Añade los cables que pasarán por el tubo</p>
                            <div className="space-y-3">
                                {conduitInputs.cables.map((cable, index) => (
                                    <div key={index} className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <SelectField label={index === 0 ? "Sección (mm²)" : ""} value={cable.section} onChange={e => updateCable(index, 'section', e.target.value)}
                                                options={standardSections.slice(0, 11).map(s => ({ value: s, label: `${s} mm²` }))} />
                                        </div>
                                        <div className="w-24">
                                            <InputField label={index === 0 ? "Cantidad" : ""} value={cable.count} onChange={e => updateCable(index, 'count', e.target.value)} min="1" />
                                        </div>
                                        {conduitInputs.cables.length > 1 && (
                                            <button onClick={() => removeCable(index)} className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30">✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button onClick={addCable} className="w-full mt-4 py-2 rounded-xl text-blue-400 bg-blue-500/10 hover:bg-blue-500/20">+ Añadir cable</button>
                            <button onClick={calculateConduit} className="w-full mt-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-slate-500 to-gray-600 shadow-lg">🔧 Calcular Tubo</button>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Resultados</h2>
                            {conduitResult ? (
                                <div className="space-y-4">
                                    <BigResult label="Tubo Recomendado" value={conduitResult.recommendedConduit} unit="mm" gradient="from-slate-500 to-gray-600" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <ResultCard label="Área Cables" value={conduitResult.totalCableArea} unit="mm²" />
                                        <ResultCard label="Llenado" value={conduitResult.fillPercentage} unit="%" />
                                    </div>
                                    <div className={`p-4 rounded-xl ${conduitResult.compliant ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                                        <p className={conduitResult.compliant ? 'text-green-400' : 'text-red-400'}>
                                            {conduitResult.compliant ? '✅ Cumple (≤40% llenado)' : '⚠️ Excede 40% llenado'}
                                        </p>
                                    </div>
                                </div>
                            ) : <div className="flex flex-col items-center justify-center h-64 text-center"><div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">🔧</div><p className="text-gray-400">Añade cables y calcula</p></div>}
                        </div>
                    </div>
                )}

                {/* Cable Colors Reference */}
                {activeTab === 'colors' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">🎨</span>Código de Colores - Cables
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">Según IEC 60446 / UNE 21089</p>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-800/50">
                                    <p className="text-white font-semibold mb-3">Fases (Conductores Activos)</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#8B4513' }}></div><div><p className="text-white text-sm">L1</p><p className="text-gray-400 text-xs">Marrón</p></div></div>
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#1C1C1C', border: '1px solid #444' }}></div><div><p className="text-white text-sm">L2</p><p className="text-gray-400 text-xs">Negro</p></div></div>
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#808080' }}></div><div><p className="text-white text-sm">L3</p><p className="text-gray-400 text-xs">Gris</p></div></div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-800/50">
                                    <p className="text-white font-semibold mb-3">Neutro</p>
                                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full" style={{ backgroundColor: '#0066CC' }}></div><div><p className="text-white text-sm">N</p><p className="text-gray-400 text-xs">Azul</p></div></div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-800/50">
                                    <p className="text-white font-semibold mb-3">Protección (Tierra)</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #228B22 50%, #FFD700 50%)' }}></div>
                                        <div><p className="text-white text-sm">PE / T</p><p className="text-gray-400 text-xs">Verde-Amarillo</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Referencia Rápida</h2>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                                    <p className="text-blue-400 font-medium mb-2">🔌 Monofásico</p>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#8B4513' }}>Fase</span>
                                        <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#0066CC' }}>Neutro</span>
                                        <span className="px-3 py-1 rounded-full text-xs text-black" style={{ background: 'linear-gradient(90deg, #228B22 50%, #FFD700 50%)' }}>Tierra</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                                    <p className="text-purple-400 font-medium mb-2">⚡ Trifásico</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#8B4513' }}>L1</span>
                                        <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#1C1C1C', border: '1px solid #444' }}>L2</span>
                                        <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#808080' }}>L3</span>
                                        <span className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#0066CC' }}>N</span>
                                        <span className="px-3 py-1 rounded-full text-xs text-black" style={{ background: 'linear-gradient(90deg, #228B22 50%, #FFD700 50%)' }}>PE</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-amber-400 font-medium mb-2">⚠️ Importante</p>
                                    <ul className="text-gray-400 text-sm space-y-1">
                                        <li>• El verde-amarillo es EXCLUSIVO para tierra</li>
                                        <li>• El azul solo se usa para neutro</li>
                                        <li>• En DC: Rojo (+), Negro (-)</li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                                    <p className="text-green-400 font-medium mb-2">📚 Normativa</p>
                                    <ul className="text-gray-400 text-sm space-y-1">
                                        <li>• IEC 60446 (Internacional)</li>
                                        <li>• UNE 21089 (España)</li>
                                        <li>• REBT ITC-BT-19</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
