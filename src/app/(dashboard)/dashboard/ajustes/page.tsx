"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Settings, 
  User, 
  CheckCircle, 
  Shield,
  Loader2, 
  AlertCircle,
  Building,
  Save,
  Phone,
  Briefcase,
  Award,
  Calendar,
  Sparkles,
  Zap,
  Check
} from "lucide-react";

export default function AjustesPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states - Profile
  const [fullName, setFullName] = useState("");
  const [matricula, setMatricula] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargo, setCargo] = useState("");
  const [plan, setPlan] = useState("Gratuito");
  const [fechaCreacion, setFechaCreacion] = useState("");

  // Form states - Calculation Defaults
  const [defTension, setDefTension] = useState("208");
  const [defFp, setDefFp] = useState("0.9");
  const [defCaidaMax, setDefCaidaMax] = useState("3");
  const [defMaterial, setDefMaterial] = useState("cu");
  const [defAislamiento, setDefAislamiento] = useState("xlpe");
  const [defSistema, setDefSistema] = useState("trifasico");
  const [enableIA, setEnableIA] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // 1. Fetch Profile Info
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error: pError } = await supabase
            .from("profiles")
            .select("full_name, professional_license, company_name, phone, role, plan, created_at")
            .eq("id", user.id)
            .single();

          if (profile && !pError) {
            setFullName(profile.full_name || "");
            setMatricula(profile.professional_license || "");
            setEmpresa(profile.company_name || "");
            setTelefono(profile.phone || "");
            setCargo(profile.role || "");
            setPlan(profile.plan || "Gratuito");
            if (profile.created_at) {
              setFechaCreacion(new Date(profile.created_at).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric"
              }));
            }
          }
        }
      } catch (err: any) {
        console.warn("No se pudo cargar el perfil remoto:", err.message);
      }

      // 2. Fetch Calculation Defaults
      if (typeof window !== "undefined") {
        const savedDefaults = localStorage.getItem("elinge_calc_defaults");
        if (savedDefaults) {
          try {
            const defaults = JSON.parse(savedDefaults);
            if (defaults.tension) setDefTension(String(defaults.tension));
            if (defaults.fp) setDefFp(String(defaults.fp));
            if (defaults.caidaMax) setDefCaidaMax(String(defaults.caidaMax));
            if (defaults.material) setDefMaterial(defaults.material);
            if (defaults.aislamiento) setDefAislamiento(defaults.aislamiento);
            if (defaults.sistema) setDefSistema(defaults.sistema);
            if (defaults.enableIA !== undefined) setEnableIA(defaults.enableIA);
          } catch (e) {
            console.error("Error parsing defaults", e);
          }
        }
      }
      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Save Profile to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName,
            professional_license: matricula,
            company_name: empresa,
            phone: telefono,
            role: cargo,
          })
          .eq("id", user.id);

        if (updateError) throw updateError;
      }

      // 2. Save Calculation Defaults to Local Storage
      if (typeof window !== "undefined") {
        const defaults = {
          tension: defTension,
          fp: defFp,
          caidaMax: defCaidaMax,
          material: defMaterial,
          aislamiento: defAislamiento,
          sistema: defSistema,
          enableIA: enableIA,
        };
        localStorage.setItem("elinge_calc_defaults", JSON.stringify(defaults));
      }

      // 3. Dispatch global event to notify components
      window.dispatchEvent(new Event("elinge_defaults_updated"));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la configuración.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-green mb-4" />
        <p className="text-xs text-slate-400">Cargando panel de ajustes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
          <Settings className="h-7 w-7 text-slate-650" />
          <span>Configuración del Sistema</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Ajusta los parámetros por defecto de tus cálculos, tu información profesional y empresa.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8 max-w-5xl">
        
        {/* Success/Error Alerts */}
        {success && (
          <div className="rounded-xl border border-emerald-150 bg-emerald-50 px-4 py-3 flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-sm">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            <span>Configuración guardada correctamente. Los cambios se aplicarán de inmediato.</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-650 shadow-sm">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Columna Izquierda: Perfil & Cuenta */}
          <div className="space-y-8">
            
            {/* Perfil Profesional Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3.5">
                <User className="h-4.5 w-4.5 text-slate-450" />
                <span>Perfil Profesional</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200"
                      placeholder="Ing. Edwin Restrepo"
                    />
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Cargo / Especialidad
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200"
                        placeholder="Ingeniero de Proyectos"
                      />
                      <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Matrícula Profesional
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-xs font-mono text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200"
                        placeholder="AT205-123456"
                      />
                      <Award className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Empresa / Consultora
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200"
                        placeholder="Smart Grids Colombia"
                      />
                      <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Teléfono de Contacto
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200"
                        placeholder="+57 300 123 4567"
                      />
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Información de la Cuenta */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3.5">
                <Shield className="h-4.5 w-4.5 text-slate-450" />
                <span>Información de la Cuenta</span>
              </h3>

              <div className="space-y-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Plan de Suscripción</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-green/10 border border-primary-green/20 px-3 py-0.5 text-3xs font-extrabold text-primary-green-dark uppercase tracking-wider">
                    {plan}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Fecha de Registro</span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {fechaCreacion || "Fecha no disponible"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Parámetros Eléctricos */}
          <div className="space-y-8">
            
            {/* Parámetros de Cálculo Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3.5">
                <Zap className="h-4.5 w-4.5 text-slate-450" />
                <span>Parámetros de Cálculo (NTC 2050 / RETIE)</span>
              </h3>

              <div className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Sistema por Defecto
                    </label>
                    <select
                      value={defSistema}
                      onChange={(e) => setDefSistema(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200 cursor-pointer"
                    >
                      <option value="trifasico">Trifásico</option>
                      <option value="monofasico">Monofásico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Tensión Nominal
                    </label>
                    <select
                      value={defTension}
                      onChange={(e) => setDefTension(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200 cursor-pointer"
                    >
                      <option value="120">120 V</option>
                      <option value="208">208 V</option>
                      <option value="220">220 V</option>
                      <option value="240">240 V</option>
                      <option value="440">440 V</option>
                      <option value="480">480 V</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      FP por Defecto
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="1.0"
                      value={defFp}
                      onChange={(e) => setDefFp(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Caída Tensión Máx (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="10.0"
                      value={defCaidaMax}
                      onChange={(e) => setDefCaidaMax(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Material Conductor
                    </label>
                    <select
                      value={defMaterial}
                      onChange={(e) => setDefMaterial(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200 cursor-pointer"
                    >
                      <option value="cu">Cobre (Cu)</option>
                      <option value="al">Aluminio (Al)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">
                      Aislamiento Común
                    </label>
                    <select
                      value={defAislamiento}
                      onChange={(e) => setDefAislamiento(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-750 font-medium outline-none focus:border-primary-green focus:bg-white transition-all duration-200 cursor-pointer"
                    >
                      <option value="xlpe">XLPE / THHN (90°C)</option>
                      <option value="thw">THW / THWN (75°C)</option>
                      <option value="tw">TW / UF (60°C)</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Preferencias de Inteligencia Artificial */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 font-display flex items-center gap-2 border-b border-slate-100 pb-3.5">
                <Sparkles className="h-4.5 w-4.5 text-slate-450" />
                <span>Asistente de Inteligencia Artificial (IA)</span>
              </h3>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-750">Justificaciones Técnicas Automatizadas</h4>
                  <p className="text-4xs text-slate-400 font-semibold leading-relaxed">
                    Usa modelos LLM locales (Ollama/Gemma) para redactar memorias de cálculo basadas en la NTC 2050.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setEnableIA(!enableIA)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    enableIA ? "bg-primary-green" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      enableIA ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-green px-6 py-3 text-xs font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-sm shadow-primary-green/20"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Guardando Cambios...</span>
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>

      </form>
      
    </div>
  );
}
