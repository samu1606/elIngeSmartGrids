"use client";

import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import SeccionTab from "@/components/calculadora/SeccionTab";
import ProteccionTab from "@/components/calculadora/ProteccionTab";
import MotorTab from "@/components/calculadora/MotorTab";
import IluminacionTab from "@/components/calculadora/IluminacionTab";
import ReactivaTab from "@/components/calculadora/ReactivaTab";
import PuestaTierraTab from "@/components/calculadora/PuestaTierraTab";
import { 
  Zap, 
  Shield, 
  Cpu, 
  Lightbulb, 
  TrendingDown, 
  Globe, 
  HelpCircle 
} from "lucide-react";

export default function CalculadoraPage() {
  const [activeTab, setActiveTab] = useState<string>("seccion");
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/health`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "healthy") {
            setBackendStatus("connected");
            return;
          }
        }
        setBackendStatus("disconnected");
      } catch (err) {
        setBackendStatus("disconnected");
      }
    };

    checkHealth();
  }, []);

  const tabs = [
    { id: "seccion", label: "Sección Conductor", icon: Zap },
    { id: "proteccion", label: "Protecciones", icon: Shield },
    { id: "motor", label: "Motores & Ramas", icon: Cpu },
    { id: "iluminacion", label: "Iluminación", icon: Lightbulb },
    { id: "reactiva", label: "Factor de Potencia", icon: TrendingDown },
    { id: "puesta_tierra", label: "Puesta a Tierra", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title & Connection Status Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display">
            Calculadora Técnica
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Diseño asistido de redes de baja tensión bajo NTC 2050 y el reglamento RETIE.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          {backendStatus === "checking" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
              <span>Verificando motor...</span>
            </span>
          )}
          {backendStatus === "connected" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Motor de Cálculos Activo</span>
            </span>
          )}
          {backendStatus === "disconnected" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 shadow-sm animate-pulse">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Modo Local (Offline)</span>
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation (Scrollable on mobile) */}
      <div className="bg-slate-900/5 p-1 rounded-2xl flex items-center overflow-x-auto whitespace-nowrap gap-1 no-scrollbar border border-slate-200/50 shadow-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? "bg-[#0F172A] text-white shadow-md" 
                  : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-800"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "text-primary-green" : ""}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-8 transition-opacity duration-300">
        {activeTab === "seccion" && <SeccionTab />}
        {activeTab === "proteccion" && <ProteccionTab />}
        {activeTab === "motor" && <MotorTab />}
        {activeTab === "iluminacion" && <IluminacionTab />}
        {activeTab === "reactiva" && <ReactivaTab />}
        {activeTab === "puesta_tierra" && <PuestaTierraTab />}
      </div>

      {/* Technical Footer Help */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-400 border-t border-slate-200 pt-6 text-3xs font-extrabold uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 stroke-[2.5] text-slate-400" />
          <span>¿Necesitas ayuda? Consulta la documentación en el menú lateral</span>
        </div>
        <div>
          <span>Colombia · NTC 2050 / RETIE 2026</span>
        </div>
      </div>

    </div>
  );
}
