"use client";

import { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "@/lib/api";
import SeccionTab from "@/components/calculadora/SeccionTab";
import ProteccionTab from "@/components/calculadora/ProteccionTab";
import MotorTab from "@/components/calculadora/MotorTab";
import IluminacionTab from "@/components/calculadora/IluminacionTab";
import ReactivaTab from "@/components/calculadora/ReactivaTab";
import PuestaTierraTab from "@/components/calculadora/PuestaTierraTab";
import CuadroCargasTab from "@/components/calculadora/CuadroCargasTab";
import CaidaTensionTab from "@/components/calculadora/CaidaTensionTab";
import CortocircuitoTab from "@/components/calculadora/CortocircuitoTab";
import TuberiasTab from "@/components/calculadora/TuberiasTab";
import TransformadoresTab from "@/components/calculadora/TransformadoresTab";
import PararrayosTab from "@/components/calculadora/PararrayosTab";
import { Zap, Shield, Cpu, Lightbulb, TrendingDown, Globe, HelpCircle, Gauge, TrendingDown as Drop, ShieldAlert, Ruler, Battery, CloudLightning } from "lucide-react";

const TABS = [
  { id: "seccion", label: "Sección Conductor", icon: Zap, component: SeccionTab },
  { id: "proteccion", label: "Protecciones", icon: Shield, component: ProteccionTab },
  { id: "motor", label: "Motores & Ramas", icon: Cpu, component: MotorTab },
  { id: "iluminacion", label: "Iluminación", icon: Lightbulb, component: IluminacionTab },
  { id: "reactiva", label: "Factor de Potencia", icon: TrendingDown, component: ReactivaTab },
  { id: "puesta_tierra", label: "Puesta a Tierra", icon: Globe, component: PuestaTierraTab },
  { id: "cuadro_cargas", label: "Cuadro de Cargas", icon: Gauge, component: CuadroCargasTab },
  { id: "caida_tension", label: "Caída de Tensión", icon: Drop, component: CaidaTensionTab },
  { id: "cortocircuito", label: "Cortocircuito", icon: ShieldAlert, component: CortocircuitoTab },
  { id: "tuberias", label: "Tuberías", icon: Ruler, component: TuberiasTab },
  { id: "transformadores", label: "Transformadores", icon: Battery, component: TransformadoresTab },
  { id: "pararrayos", label: "Pararrayos", icon: CloudLightning, component: PararrayosTab },
] as const;

export default function CalculadoraPage() {
  const [activeTab, setActiveTab] = useState("seccion");
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  // Health check solo en cliente
  useEffect(() => {
    const apiUrl = getApiUrl();
    console.log("[Calculadora] API URL:", apiUrl);

    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiUrl}/health`);
        if (response.ok) {
          const data = await response.json();
          console.log("[Calculadora] Backend health:", data);
          if (data.status === "healthy") {
            setBackendStatus("connected");
            return;
          }
        }
        console.warn("[Calculadora] Backend health check failed, status:", response.status);
        setBackendStatus("disconnected");
      } catch (err) {
        console.error("[Calculadora] Backend health check error:", err);
        setBackendStatus("disconnected");
      }
    };

    checkHealth();
  }, []);

  const handleTabClick = useCallback((tabId: string) => {
    console.log("[Calculadora] Tab clicked:", tabId);
    setActiveTab(tabId);
  }, []);

  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Title & Connection Status Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1e293b", margin: 0 }}>
            Calculadora Técnica
          </h1>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", marginTop: "4px" }}>
            Diseño asistido de redes de baja tensión bajo NTC 2050 y el reglamento RETIE.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {backendStatus === "checking" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "4px 12px", fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
              <span style={{ height: "8px", width: "8px", borderRadius: "50%", background: "#94a3b8", animation: "pulse 1.5s infinite" }} />
              Verificando motor...
            </span>
          )}
          {backendStatus === "connected" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "4px 12px", fontSize: "11px", fontWeight: 700, color: "#059669" }}>
              <span style={{ height: "8px", width: "8px", borderRadius: "50%", background: "#10b981" }} />
              Motor de Cálculos Activo
            </span>
          )}
          {backendStatus === "disconnected" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "#fffbeb", border: "1px solid #fde68a", padding: "4px 12px", fontSize: "11px", fontWeight: 700, color: "#d97706" }}>
              <span style={{ height: "8px", width: "8px", borderRadius: "50%", background: "#f59e0b" }} />
              Modo Local (Offline)
            </span>
          )}
        </div>
      </div>

      {/* Tabs Navigation - con inline styles para garantizar que funcione */}
      <div style={{
        background: "rgba(15, 23, 42, 0.05)",
        padding: "4px",
        borderRadius: "16px",
        display: "flex",
        overflowX: "auto",
        whiteSpace: "nowrap",
        gap: "4px",
        border: "1px solid rgba(226, 232, 240, 0.5)",
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              type="button"
              data-tab-id={tab.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "12px",
                transition: "all 0.2s",
                cursor: "pointer",
                border: "none",
                color: isActive ? "#fff" : "#64748b",
                background: isActive ? "#0F172A" : "transparent",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              }}
            >
              <Icon style={{ height: "16px", width: "16px", color: isActive ? "#10b981" : "currentColor" }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div style={{ marginTop: "32px" }}>
        {ActiveComponent ? <ActiveComponent /> : (
          <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
            Selecciona una pestaña para comenzar
          </div>
        )}
      </div>

      {/* Technical Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#94a3b8", borderTop: "1px solid #e2e8f0", paddingTop: "24px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <HelpCircle style={{ height: "14px", width: "14px" }} />
          <span>¿Necesitas ayuda? Consulta la documentación</span>
        </div>
        <div>
          <span>Colombia · NTC 2050 / RETIE 2026</span>
        </div>
      </div>
    </div>
  );
}
