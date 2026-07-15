"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, FolderOpen, Plus, Loader2, Check } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client_name: string;
}

interface SaveToProjectButtonProps {
  /** Tipo de cálculo: 'seccion', 'proteccion', 'motor', etc. */
  calculationType: string;
  /** Título descriptivo del cálculo (ej: "Sección de Conductor - 8 AWG") */
  title: string;
  /** Datos de entrada del cálculo */
  inputData: object;
  /** Resultados del cálculo */
  resultData: object;
  /** Texto del botón (opcional) */
  buttonLabel?: string;
}

export default function SaveToProjectButton({
  calculationType,
  title,
  inputData,
  resultData,
  buttonLabel = "Guardar en Proyecto",
}: SaveToProjectButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectClient, setNewProjectClient] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Cargar proyectos del usuario
  useEffect(() => {
    if (!showModal) return;
    loadProjects();
  }, [showModal]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, client_name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setProjects(data || []);
    } catch (e) {
      console.error("Error loading projects:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (projectId: string) => {
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error } = await supabase.from("saved_calculations").insert({
        project_id: projectId,
        user_id: user.id,
        type: calculationType,
        title,
        input_data: inputData,
        result_data: resultData,
      });

      if (error) throw error;

      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setSaved(false);
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAndSave = async () => {
    if (!newProjectName.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Crear proyecto
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: newProjectName.trim(),
          client_name: newProjectClient.trim() || "Sin cliente",
          status: "en_proceso",
          progress: 0,
        })
        .select("id")
        .single();

      if (projectError) throw projectError;

      // Guardar cálculo
      const { error: calcError } = await supabase.from("saved_calculations").insert({
        project_id: project.id,
        user_id: user.id,
        type: calculationType,
        title,
        input_data: inputData,
        result_data: resultData,
      });

      if (calcError) throw calcError;

      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setSaved(false);
        setNewProjectName("");
        setNewProjectClient("");
        setShowNewForm(false);
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Botón principal */}
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all"
      >
        <Save className="h-3.5 w-3.5" />
        {buttonLabel}
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display">Guardar Cálculo</h3>
                <p className="text-xs text-slate-400 mt-0.5">{title}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 max-h-[400px] overflow-y-auto space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {saved ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700">
                  <Check className="h-5 w-5" />
                  <span className="text-sm font-semibold">¡Guardado exitosamente!</span>
                </div>
              ) : (
                <>
                  {/* Buscar proyecto existente */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Seleccionar Proyecto
                    </label>
                    {loading ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando proyectos...
                      </div>
                    ) : projects.length === 0 && !showNewForm ? (
                      <div className="text-center py-4">
                        <FolderOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 mb-3">No tienes proyectos aún</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {projects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => handleSave(project.id)}
                            disabled={saving}
                            className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all disabled:opacity-50"
                          >
                            <FolderOpen className="h-4 w-4 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-700 truncate">{project.name}</p>
                              <p className="text-xs text-slate-400 truncate">{project.client_name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Formulario nuevo proyecto */}
                  {showNewForm ? (
                    <div className="border-t border-slate-100 pt-3 space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Nuevo Proyecto
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre del proyecto"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                      <input
                        type="text"
                        placeholder="Cliente (opcional)"
                        value={newProjectClient}
                        onChange={(e) => setNewProjectClient(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateAndSave}
                          disabled={saving || !newProjectName.trim()}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-slate-950 font-bold py-2.5 text-sm hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          Crear y Guardar
                        </button>
                        <button
                          onClick={() => setShowNewForm(false)}
                          className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewForm(true)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-3 text-xs font-bold text-slate-400 hover:border-primary/40 hover:text-primary transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Crear Nuevo Proyecto
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
