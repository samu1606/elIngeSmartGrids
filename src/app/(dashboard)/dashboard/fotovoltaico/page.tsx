"use client";

import { useState, useRef, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { 
  Sun, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  DollarSign, 
  TrendingUp, 
  Loader2, 
  Home, 
  HelpCircle,
  CheckCircle,
  UploadCloud,
  X
} from "lucide-react";

// List of Colombian Departments
const DEPARTAMENTOS = [
  { value: "amazonas", label: "Amazonas" },
  { value: "antioquia", label: "Antioquia" },
  { value: "arauca", label: "Arauca" },
  { value: "atlantico", label: "Atlántico" },
  { value: "bogota", label: "Bogotá D.C." },
  { value: "bolivar", label: "Bolívar" },
  { value: "boyaca", label: "Boyacá" },
  { value: "caldas", label: "Caldas" },
  { value: "caqueta", label: "Caquetá" },
  { value: "casanare", label: "Casanare" },
  { value: "cauca", label: "Cauca" },
  { value: "cesar", label: "Cesar" },
  { value: "choco", label: "Chocó" },
  { value: "cordoba", label: "Córdoba" },
  { value: "cundinamarca", label: "Cundinamarca" },
  { value: "guainia", label: "Guainía" },
  { value: "guaviare", label: "Guaviare" },
  { value: "huila", label: "Huila" },
  { value: "guajira", label: "La Guajira" },
  { value: "magdalena", label: "Magdalena" },
  { value: "meta", label: "Meta" },
  { value: "narino", label: "Nariño" },
  { value: "norte de santander", label: "Norte de Santander" },
  { value: "putumayo", label: "Putumayo" },
  { value: "quindio", label: "Quindío" },
  { value: "risaralda", label: "Risaralda" },
  { value: "san andres", label: "San Andrés y Providencia" },
  { value: "santander", label: "Santander" },
  { value: "sucre", label: "Sucre" },
  { value: "tolima", label: "Tolima" },
  { value: "valle", label: "Valle del Cauca" },
  { value: "vaupes", label: "Vaupés" },
  { value: "vichada", label: "Vichada" }
];

interface FotovoltaicoResult {
  hsp: number;
  consumo_diario: number;
  potencia_pico_kw: number;
  num_paneles: number;
  area_m2: number;
  potencia_inversor_sugerida: number;
  tipo_inversor: string;
  costo_panel_total: number;
  costo_inversor: number;
  costo_estructura: number;
  costo_mano_obra: number;
  costo_tramites: number;
  total_cop: number;
  total_usd: number;
  tarifa_aplicada: number;
  generacion_estimada_kwh: number;
  ahorro_mensual: number;
  retorno_meses: number;
  ahorro_25anios: number;
  alerta_consumo: string | null;
  alerta_retorno: string | null;
  alerta_espacio: string | null;
  alerta_presupuesto: string | null;
}

// Helper function to compress image using HTML5 Canvas (lowers transmission size and standardizes resolution)
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D del Canvas."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Helper function to rotate image 90 degrees clockwise
const rotateImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Swap width and height for 90 degrees rotation
      canvas.width = img.height;
      canvas.height = img.width;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo obtener el contexto 2D del Canvas."));
        return;
      }

      // Rotate around the center of the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      resolve(dataUrl);
    };
    img.onerror = (err) => reject(err);
  });
};

// Reusable Count-Up Animation Component
function AnimatedNumber({ 
  value, 
  duration = 800, 
  formatter = (val: number) => String(Math.round(val)) 
}: { 
  value: number; 
  duration?: number; 
  formatter?: (val: number) => string; 
 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const start = prevValueRef.current;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const startTime = performance.now();

    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Quadratic ease out
      const easeProgress = progress * (2 - progress);
      const current = start + (end - start) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
        prevValueRef.current = end;
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return <span>{formatter(displayValue)}</span>;
}

export default function FotovoltaicoPage() {
  // Input states
  const [consumoKwhMes, setConsumoKwhMes] = useState<string>("");
  const [departamento, setDepartamento] = useState<string>("bogota");
  const [tipoTecho, setTipoTecho] = useState<"inclinado" | "plano">("inclinado");
  const [estrato, setEstrato] = useState<string>("3");
  const [presupuestoMax, setPresupuestoMax] = useState<string>("");
  const [incluirBateria, setIncluirBateria] = useState<boolean>(false);

  // UI / Calculation states
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FotovoltaicoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File Upload states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisSuccess, setAnalysisSuccess] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Reusable calculation logic (returns true if successful, false otherwise)
  const runCalculation = async (
    targetConsumo: string,
    targetDepto: string,
    targetTecho: string,
    targetEstrato: string,
    targetPresupuesto: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const parsedConsumo = parseFloat(targetConsumo);
    if (isNaN(parsedConsumo) || parsedConsumo <= 0) {
      setError("El consumo mensual ingresado debe ser un número válido mayor a 0.");
      setLoading(false);
      return false;
    }

    const payload = {
      consumo_kwh_mes: parsedConsumo,
      departamento: targetDepto,
      tipo_techo: targetTecho,
      estrato: targetEstrato,
      presupuesto_max: targetPresupuesto ? parseFloat(targetPresupuesto) : null
    };

    try {
      const response = await fetch(`${getApiUrl()}/api/calculos/fotovoltaico`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setError("Error en el servidor de cálculos. Por favor verifica que los parámetros sean correctos.");
        return false;
      }

      const data = await response.json();
      setResult(data);
      return true;
    } catch (err: any) {
      console.error(err);
      setError("No se pudo conectar con el motor de cálculo. Verifica que el servidor backend esté corriendo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumoKwhMes) return;
    await runCalculation(consumoKwhMes, departamento, tipoTecho, estrato, presupuestoMax);
  };

  const cleanForm = () => {
    setConsumoKwhMes("");
    setDepartamento("bogota");
    setTipoTecho("inclinado");
    setEstrato("3");
    setPresupuestoMax("");
    setIncluirBateria(false);
    setResult(null);
    setError(null);
    clearUpload();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setAnalysisError(null);
    setAnalysisSuccess(false);

    if (!file.type.startsWith("image/")) {
      setAnalysisError("Por favor selecciona un archivo de imagen válido (JPG, PNG).");
      return;
    }

    setAnalyzing(true);
    try {
      const compressedBase64 = await compressImage(file);
      setPreviewUrl(compressedBase64);
    } catch (err: any) {
      console.error(err);
      setAnalysisError("No se pudo procesar la imagen seleccionada.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRotate = async () => {
    if (!previewUrl) return;
    setAnalyzing(true);
    try {
      const rotatedBase64 = await rotateImage(previewUrl);
      setPreviewUrl(rotatedBase64);
    } catch (err: any) {
      console.error(err);
      setAnalysisError("No se pudo girar la imagen.");
    } finally {
      setAnalyzing(false);
    }
  };

  const clearUpload = () => {
    setPreviewUrl(null);
    setAnalysisSuccess(false);
    setAnalysisError(null);
    setAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyzeInvoice = async () => {
    if (!previewUrl) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisSuccess(false);

    try {
      // Extract base64 content
      const base64Data = previewUrl.split(",")[1] || previewUrl;
      const url = `${getApiUrl()}/api/calculos/fotovoltaico/analizar-factura`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image_base64: base64Data })
      });

      if (!response.ok) {
        setAnalysisError("No se pudo conectar con el servidor para analizar la factura.");
        return;
      }

      const data = await response.json();
      console.log("Vision API response:", data);

      if (data.ok === false || data.error) {
        setAnalysisError(data.error || "No se pudo extraer información legible de la factura.");
        return;
      }

      // Safe parsing of fields
      const extractedConsumo = data.consumo_kwh_mes || data.consumo_kwh || data.consumo || data.kwh || (data.datos && (data.datos.consumo_kwh_mes || data.datos.consumo_kwh || data.datos.consumo));
      const extractedDepto = data.departamento || data.depto || data.dept || data.ciudad || (data.datos && (data.datos.departamento || data.datos.depto));
      const extractedEstrato = data.estrato || (data.datos && data.datos.estrato);

      let finalConsumo = consumoKwhMes;
      if (extractedConsumo) {
        // Strip text and leave only numbers/decimals
        const cleanedConsumo = String(extractedConsumo).replace(/[^0-9.]/g, "");
        if (cleanedConsumo && !isNaN(parseFloat(cleanedConsumo))) {
          finalConsumo = cleanedConsumo;
          setConsumoKwhMes(finalConsumo);
        }
      }

      let finalDepto = departamento;
      if (extractedDepto) {
        const deptoClean = String(extractedDepto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const matchedDepto = DEPARTAMENTOS.find(d => 
          deptoClean.includes(d.value) || d.value.includes(deptoClean)
        );
        if (matchedDepto) {
          finalDepto = matchedDepto.value;
          setDepartamento(finalDepto);
        }
      }

      let finalEstrato = estrato;
      if (extractedEstrato) {
        const estratoStr = String(extractedEstrato).toLowerCase();
        if (estratoStr.includes("comercial") || estratoStr.includes("industrial")) {
          finalEstrato = "comercial";
          setEstrato(finalEstrato);
        } else {
          const match = estratoStr.match(/[1-6]/);
          if (match) {
            finalEstrato = match[0];
            setEstrato(finalEstrato);
          }
        }
      }

      const parsedNum = parseFloat(finalConsumo);
      if (isNaN(parsedNum) || parsedNum <= 0) {
        setAnalysisError("No se detectó un consumo mensual de energía válido en la factura.");
        return;
      }

      setAnalysisSuccess(true);

      // Auto-trigger system calculation
      await runCalculation(finalConsumo, finalDepto, tipoTecho, finalEstrato, presupuestoMax);

    } catch (err: any) {
      console.error(err);
      setAnalysisError("No se pudo leer la factura. Intenta con otra foto más clara.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Check if there are any alerts
  const hasAlerts = result && (
    result.alerta_consumo || 
    result.alerta_retorno || 
    result.alerta_espacio || 
    result.alerta_presupuesto
  );

  // Litio Battery Calculations
  const batteryCost = 8000000;
  
  const totalCopAdjusted = result 
    ? result.total_cop + (incluirBateria ? batteryCost : 0) 
    : 0;

  const totalUsdAdjusted = result 
    ? totalCopAdjusted / 4200.0 
    : 0;

  const retornoMesesAdjusted = result 
    ? (result.ahorro_mensual > 0 ? (totalCopAdjusted / result.ahorro_mensual) : 999) 
    : 999;

  const ahorro25AniosAdjusted = result 
    ? (result.ahorro_mensual * 12.0 * 25.0) - totalCopAdjusted 
    : 0;

  // Viability classification helper
  const getViabilityBadge = (meses: number) => {
    if (meses < 36) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Altamente Viable
        </span>
      );
    } else if (meses >= 36 && meses <= 72) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          Viable
        </span>
      );
    } else if (meses > 72 && meses <= 120) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          Evaluar
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          No Recomendado
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
            ☀️ Diseño Fotovoltaico
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Dimensionamiento preliminar de sistemas solares fotovoltaicos residenciales y comerciales en Colombia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-5 self-start">
          
          {/* 📸 Zona de Upload Factura */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display">Asistente de Factura</h3>
                <p className="text-3xs text-slate-400 mt-0.5">Analiza tu factura de energía mediante Inteligencia Artificial.</p>
              </div>
              {analysisSuccess && (
                <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wide">
                  ✅ Factura analizada
                </span>
              )}
            </div>

            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                  isDragging 
                    ? "border-amber-500 bg-amber-50/50" 
                    : "border-slate-200 bg-slate-50/50 hover:border-amber-400 hover:bg-amber-50/10"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <UploadCloud className={`h-8 w-8 mb-2 ${isDragging ? "text-amber-500" : "text-slate-400"}`} />
                <span className="text-xs font-bold text-slate-700 block">
                  📸 Subí tu factura de energía y autocompletamos los datos
                </span>
                <span className="text-3xs text-slate-400 block mt-1">
                  JPG o PNG (máx 10MB)
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center p-3 h-48">
                  <img
                    src={previewUrl}
                    alt="Vista previa de factura"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={clearUpload}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white cursor-pointer transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={clearUpload}
                    className="flex-1 py-2 text-3xs font-extrabold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer text-center uppercase tracking-wide"
                  >
                    Quitar
                  </button>
                  <button
                    type="button"
                    onClick={handleRotate}
                    disabled={analyzing}
                    className="flex-1 py-2 text-3xs font-extrabold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer text-center uppercase tracking-wide flex items-center justify-center gap-1"
                  >
                    🔄 Girar 90°
                  </button>
                  <button
                    type="button"
                    onClick={handleAnalyzeInvoice}
                    disabled={analyzing}
                    className="flex-[2] flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-2 text-xs transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "🔍 Analizar Factura"
                    )}
                  </button>
                </div>
                
                <p className="text-3xs text-slate-400 text-center leading-relaxed">
                  💡 <strong>¿Imagen girada?</strong> Usa el botón <strong>Girar 90°</strong> para orientarla verticalmente antes de analizarla para mejorar la precisión del lector de IA.
                </p>
              </div>
            )}

            {analysisError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-3xs text-red-700 font-bold leading-normal flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <span>No se pudo leer la factura. Intentá con otra foto más clara. {analysisError}</span>
              </div>
            )}
          </div>

          {/* Formulario Principal */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 font-display">Parámetros de Diseño</h3>
              <p className="text-xs text-slate-400 mt-1">
                Introduce la información técnica y de consumo para calcular tu sistema.
              </p>
            </div>

            <form onSubmit={handleCalculate} className="space-y-5">
              {/* Consumo Mensual */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Consumo Mensual (kWh)
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={consumoKwhMes}
                  onChange={(e) => setConsumoKwhMes(e.target.value)}
                  placeholder="Ej: 166"
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  required
                />
              </div>

              {/* Departamento */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Departamento
                </label>
                <select
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
                >
                  {DEPARTAMENTOS.map((dep) => (
                    <option key={dep.value} value={dep.value}>
                      {dep.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Techo */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Tipo de Techo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoTecho("inclinado")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                      tipoTecho === "inclinado"
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    Inclinado
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoTecho("plano")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                      tipoTecho === "plano"
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                    Plano
                  </button>
                </div>
              </div>

              {/* Estrato */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Estrato / Tipo Cliente
                </label>
                <select
                  value={estrato}
                  onChange={(e) => setEstrato(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="comercial">Comercial</option>
                </select>
              </div>

              {/* Presupuesto Máximo */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Presupuesto Máximo COP (Opcional)
                </label>
                <input
                  type="number"
                  min="100000"
                  step="any"
                  value={presupuestoMax}
                  onChange={(e) => setPresupuestoMax(e.target.value)}
                  placeholder="Ej: 15000000"
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 font-semibold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>

              {/* Checkbox Batería */}
              <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 border border-slate-200/65 rounded-xl">
                <input
                  type="checkbox"
                  id="incluirBateria"
                  checked={incluirBateria}
                  onChange={(e) => setIncluirBateria(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="incluirBateria" className="cursor-pointer select-none">
                  <span className="block text-xs font-bold text-slate-700">🔋 Incluir batería de litio (10 kWh)</span>
                  <span className="block text-3xs text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                    +$8,000,000 COP al costo total
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={cleanForm}
                  className="flex-1 py-3 text-xs font-bold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer text-center"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-3 text-sm transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    "Calcular Sistema"
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[350px] bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              <Sun className="h-16 w-16 text-slate-300 stroke-[1.5] mb-4 animate-pulse" />
              <h4 className="font-bold text-slate-600 text-sm">Esperando Parámetros</h4>
              <p className="text-xs max-w-sm mt-1">
                Llena los datos del formulario a la izquierda o cargá una factura para autocompletar y calcular tu diseño solar.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[350px] bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              <Loader2 className="h-16 w-16 text-amber-500 stroke-[1.5] mb-4 animate-spin" />
              <h4 className="font-bold text-slate-700 text-sm">Procesando Diseño</h4>
              <p className="text-xs max-w-sm mt-1">
                Consultando datos climatológicos históricos (HSP) y dimensionando inversores y paneles...
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-fade-in">
              {/* Warnings Box */}
              {hasAlerts && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Advertencias de Viabilidad
                  </div>
                  <div className="space-y-1.5 pl-6 text-xs text-amber-700">
                    {result.alerta_consumo && <p>• {result.alerta_consumo}</p>}
                    {result.alerta_retorno && <p>• {result.alerta_retorno}</p>}
                    {result.alerta_espacio && <p>• {result.alerta_espacio}</p>}
                    {result.alerta_presupuesto && <p>• {result.alerta_presupuesto}</p>}
                  </div>
                </div>
              )}

              {/* Grid cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CARD SISTEMA */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-amber-400 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg p-2.5">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Sistema Generador</h4>
                      <p className="text-base font-bold text-slate-800">Paneles Solares</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                    <div>
                      <span className="block text-2xs font-bold text-slate-400 uppercase">Cantidad</span>
                      <span className="text-lg font-extrabold text-slate-800">
                        <AnimatedNumber value={result.num_paneles} formatter={(v) => String(Math.round(v))} />
                      </span>
                      <span className="text-3xs text-slate-400 block -mt-1">módulos</span>
                    </div>
                    <div>
                      <span className="block text-2xs font-bold text-slate-400 uppercase">Potencia</span>
                      <span className="text-lg font-extrabold text-slate-800">
                        <AnimatedNumber value={result.potencia_pico_kw} formatter={(v) => v.toFixed(2)} />
                      </span>
                      <span className="text-3xs text-slate-400 block -mt-1">kWp (pico)</span>
                    </div>
                    <div>
                      <span className="block text-2xs font-bold text-slate-400 uppercase">Área</span>
                      <span className="text-lg font-extrabold text-slate-800">
                        <AnimatedNumber value={result.area_m2} formatter={(v) => v.toFixed(1)} />
                      </span>
                      <span className="text-3xs text-slate-400 block -mt-1">m² req.</span>
                    </div>
                  </div>
                  
                  <div className="text-3xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2 leading-relaxed">
                    Estimado con una radiación local de <strong>{result.hsp.toFixed(1)} HSP</strong> en el departamento. Paneles estándar monocristalinos de 450W (2.2 m² c/u).
                  </div>
                </div>

                {/* CARD INVERSOR */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-amber-400 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg p-2.5">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Conversión Potencia</h4>
                      <p className="text-base font-bold text-slate-800">Inversor Recomendado</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                    <div>
                      <span className="block text-2xs font-bold text-slate-400 uppercase">Capacidad</span>
                      <span className="text-lg font-extrabold text-slate-800">
                        {result.potencia_inversor_sugerida > 0 ? (
                          <>
                            <AnimatedNumber value={result.potencia_inversor_sugerida} formatter={(v) => v.toFixed(1)} /> kW
                          </>
                        ) : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-2xs font-bold text-slate-400 uppercase">Tipo Red</span>
                      <span className="text-lg font-extrabold text-slate-800 capitalize">
                        {result.tipo_inversor === "ninguno" ? "N/A" : result.tipo_inversor}
                      </span>
                    </div>
                  </div>

                  <div className="text-3xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2 leading-relaxed">
                    {result.tipo_inversor === "microinversor" 
                      ? "Se sugieren microinversores por ser un sistema pequeño (≤8 paneles), optimizando la eficiencia individual de cada panel."
                      : result.tipo_inversor === "string" 
                      ? "Se sugiere un inversor central tipo String adecuado para arreglos más grandes, reduciendo el costo por kW de conversión."
                      : "No se requiere inversor al no contar con paneles dimensionados en el sistema."}
                  </div>
                </div>

                {/* CARD INVERSIÓN */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-amber-400 p-5 space-y-4 sm:col-span-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg p-2.5">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Costo Estimado (llave en mano)</h4>
                        <p className="text-base font-bold text-slate-800">Inversión Inicial</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-black text-amber-500">
                        <AnimatedNumber value={totalCopAdjusted} formatter={formatCOP} />
                      </span>
                      <span className="text-3xs text-slate-400 font-bold uppercase">
                        <AnimatedNumber value={totalUsdAdjusted} formatter={formatUSD} /> USD
                      </span>
                    </div>
                  </div>

                  {/* Breakdown details */}
                  <div className="space-y-2">
                    <span className="block text-2xs font-bold text-slate-400 uppercase tracking-wider">Desglose de Costos (COP)</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between border-b border-slate-50 py-1">
                        <span>Módulos Fotovoltaicos:</span>
                        <span className="font-semibold text-slate-800">{formatCOP(result.costo_panel_total)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 py-1">
                        <span>Inversor de Corriente:</span>
                        <span className="font-semibold text-slate-800">{formatCOP(result.costo_inversor)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 py-1">
                        <span>Estructura de Anclaje:</span>
                        <span className="font-semibold text-slate-800">{formatCOP(result.costo_estructura)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 py-1">
                        <span>Mano de Obra & Cableado:</span>
                        <span className="font-semibold text-slate-800">{formatCOP(result.costo_mano_obra)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 py-1">
                        <span>Trámites ante Operador de Red (OR):</span>
                        <span className="font-semibold text-slate-800">{formatCOP(result.costo_tramites)}</span>
                      </div>
                      {incluirBateria && (
                        <div className="flex justify-between border-b border-amber-100 bg-amber-50/40 px-2 py-1 rounded">
                          <span className="font-semibold text-amber-700">🔋 Batería de Litio (10 kWh):</span>
                          <span className="font-bold text-amber-800">{formatCOP(batteryCost)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD RETORNO Y AHORRO */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-amber-400 p-5 space-y-4 sm:col-span-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-lg p-2.5">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-2xs font-extrabold text-slate-400 uppercase tracking-wider">Proyecciones Financieras</h4>
                        <p className="text-base font-bold text-slate-800">Retorno de Inversión</p>
                      </div>
                    </div>
                    <div>
                      {getViabilityBadge(retornoMesesAdjusted)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="block text-3xs font-extrabold text-slate-400 uppercase">Ahorro Mensual</span>
                      <span className="text-lg font-extrabold text-emerald-600 block">
                        <AnimatedNumber value={result.ahorro_mensual} formatter={formatCOP} />
                      </span>
                      <span className="text-3xs text-slate-400 block">Factura reducida</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="block text-3xs font-extrabold text-slate-400 uppercase">Payback (ROI)</span>
                      <span className="text-lg font-extrabold text-slate-800 block">
                        {retornoMesesAdjusted < 900 ? (
                          <>
                            <AnimatedNumber value={retornoMesesAdjusted} formatter={(v) => v.toFixed(1)} /> meses
                          </>
                        ) : "N/A"}
                      </span>
                      <span className="text-3xs text-slate-400 block">
                        {retornoMesesAdjusted < 900 ? (
                          <>
                            ~ <AnimatedNumber value={retornoMesesAdjusted / 12} formatter={(v) => v.toFixed(1)} /> años
                          </>
                        ) : "Sin retorno"}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="block text-3xs font-extrabold text-slate-400 uppercase">Ahorro Neto 25 Años</span>
                      <span className="text-lg font-extrabold text-amber-500 block">
                        <AnimatedNumber value={ahorro25AniosAdjusted} formatter={formatCOP} />
                      </span>
                      <span className="text-3xs text-slate-400 block">Vida útil estimada</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-3xs text-slate-400 pt-2 leading-relaxed">
                    <div>
                      • Tarifa de red aplicada según estrato: <strong>{formatCOP(result.tarifa_aplicada)}/kWh</strong>.
                    </div>
                    <div>
                      • Generación solar estimada: <strong>{result.generacion_estimada_kwh.toFixed(1)} kWh/mes</strong>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Justification Footer */}
              <div className="text-slate-400 border-t border-slate-200 pt-6 text-3xs font-extrabold uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>NTC 2050 Sección 690 · Sistemas Solares Fotovoltaicos</span>
                </div>
                <div>
                  <span>UPME / Resoluciones CREG Autogeneración</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
