"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PAYMENT_METHODS } from "@/lib/wompi";
import {
  Zap,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Shield,
  ArrowRight,
  Sparkles,
  Clock,
  CreditCard,
  Receipt,
  BadgeCheck,
  X,
} from "lucide-react";

// Constantes de planes
const PLANS = {
  basic: {
    name: "Básico",
    price: 0,
    period: "Gratis para siempre",
    features: [
      "Cálculos básicos de Sección (Monofásico)",
      "Hasta 3 clientes registrados",
      "Hasta 2 proyectos activos",
      "Tablas de ampacidad de referencia",
      "Soporte por correo electrónico",
    ],
    color: "bg-slate-100 border-slate-300",
    badge: "",
  },
  pro: {
    name: "Profesional",
    price: 50000,
    period: "mes",
    features: [
      "Todos los cálculos (Trifásicos, Motores, Reactiva, Tierra)",
      "Clientes y proyectos ilimitados",
      "Justificación de cálculos con IA local",
      "Exportación de memorias de diseño a PDF",
      "Agenda de visitas técnicas y tareas de obra",
      "Presupuestos y cotizaciones en COP",
    ],
    color: "bg-primary/5 border-primary ring-1 ring-primary/20",
    badge: "🔥 Recomendado",
  },
  empresarial: {
    name: "Empresarial",
    price: 150000,
    period: "mes",
    features: [
      "Todo lo incluido en Profesional",
      "Hasta 5 cuentas de usuario (colaboradores)",
      "Formatos oficiales UPME y Operadores de Red",
      "Integración con Google Calendar",
      "Soporte prioritario 24/7 y capacitaciones",
    ],
    color: "bg-slate-50 border-slate-300",
    badge: "🏢 Empresas",
  },
};

const formatCOP = (val: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);

export default function SuscripcionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("basic");
  const [subscription, setSubscription] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("NEQUI");
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Obtener perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCurrentPlan(profile.plan || "basic");
      }

      // Obtener suscripción activa o último intento
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (subs && subs.length > 0) {
        const active = subs.find((s) => s.status === "active");
        setSubscription(active || subs[0]);
        setPaymentHistory(subs.filter((s) => s.status !== "pending"));
      }

      // Verificar si viene de un pago exitoso
      const pagoParam = searchParams.get("pago");
      if (pagoParam === "exitoso") {
        setSuccessMsg("🎉 ¡Pago recibido! Estamos verificando tu transacción. Tu plan se activará en unos segundos.");
        // Polling para ver si ya se activó
        setTimeout(() => {
          window.location.href = "/dashboard/suscripcion";
        }, 5000);
      }
    } catch (err) {
      console.error("Error cargando suscripción:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, router, searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const iniciarPago = async () => {
    if (!selectedPlan || selectedPlan === "basic") return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/pagos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          payment_method: selectedPayment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error creando pago");
      }

      // Redirigir al checkout de Wompi
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error("No se recibió URL de pago");
      }
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const cancelarPlan = async () => {
    if (!confirm("¿Estás seguro de cancelar tu suscripción? Perderás acceso a funciones PRO al final del período.")) {
      return;
    }

    try {
      const { error: err } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled", cancel_requested_at: new Date().toISOString() })
        .eq("id", subscription?.id);

      if (err) throw err;

      await supabase
        .from("profiles")
        .update({ plan: "basic" })
        .eq("id", subscription?.user_id);

      setCurrentPlan("basic");
      setSubscription(null);
      setSuccessMsg("Suscripción cancelada. Puedes volver a activarla cuando quieras.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const paymentMethodLabels: Record<string, string> = {
    NEQUI: "Nequi",
    BANCOLOMBIA_TRANSFER: "Transferencia Bancolombia",
    CARD: "Tarjeta Crédito/Débito",
    PSE: "PSE",
    BANCOLOMBIA_COLLECT: "Efectivo Corresponsal",
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display flex items-center gap-2">
          <Zap className="h-7 w-7 text-primary" />
          Suscripción y Pagos
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Activa tu plan profesional y acepta pagos por Nequi, Bancolombia, tarjetas y PSE.
        </p>
      </div>

      {/* Mensajes */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-start gap-3 animate-fade-in">
          <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-bold">{successMsg}</p>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-xs text-emerald-600 underline mt-1 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="font-bold">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-600 underline mt-1 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Estado actual del plan */}
      {subscription && subscription.status === "active" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-800 font-display">
                  Plan {PLANS[currentPlan as keyof typeof PLANS]?.name || currentPlan} Activo
                </h3>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Vence el {new Date(subscription.expires_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="text-2xs text-emerald-500 mt-0.5">
                  Método de pago: {paymentMethodLabels[subscription.payment_method_type] || subscription.payment_method_type}
                </p>
              </div>
            </div>
            <button
              onClick={cancelarPlan}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Cancelar Plan
            </button>
          </div>
        </div>
      )}

      {/* Estado pendiente */}
      {subscription && subscription.status === "pending" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-10 w-10 text-amber-600 animate-pulse" />
            <div>
              <h3 className="text-lg font-bold text-amber-800 font-display">Pago Pendiente</h3>
              <p className="text-xs text-amber-600 mt-0.5">
                Tu pago de {formatCOP(PLANS[subscription.plan as keyof typeof PLANS]?.price || 0)} está siendo procesado por{" "}
                {paymentMethodLabels[subscription.payment_method_type] || "Wompi"}.
                Te notificaremos cuando se confirme.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Planes */}
      {!subscription || subscription.status !== "active" ? (
        <>
          <h2 className="text-xl font-bold text-slate-800 font-display">Elige tu plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrent = currentPlan === key && (!subscription || subscription.status !== "active");
              const isSelected = selectedPlan === key;

              return (
                <div
                  key={key}
                  onClick={() => key !== "basic" && setSelectedPlan(isSelected ? null : key)}
                  className={`relative rounded-2xl border p-6 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                      : key === "basic"
                      ? "border-slate-200 bg-white hover:border-slate-300"
                      : plan.color + " hover:shadow-md"
                  } ${key === "basic" ? "cursor-default" : ""}`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-slate-950 whitespace-nowrap">
                      {plan.badge}
                    </span>
                  )}

                  <div className="mt-2 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 font-display">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-extrabold text-slate-900 font-display">
                        {plan.price === 0 ? "Gratis" : formatCOP(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xs text-slate-400 font-medium">/ {plan.period}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {key !== "basic" && (
                    <div className={`w-full py-2.5 rounded-xl text-center text-sm font-bold transition-all ${
                      isSelected
                        ? "bg-primary text-slate-950"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {isSelected ? "✓ Seleccionado" : "Seleccionar"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Método de pago (visible si hay plan seleccionado) */}
          {selectedPlan && selectedPlan !== "basic" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">¿Cómo quieres pagar?</h3>
              <p className="text-xs text-slate-500">
                Todos los pagos son procesados de forma segura por <strong>Wompi</strong> (Bancolombia).
                Tus datos nunca tocan nuestros servidores.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`rounded-xl border p-4 text-center transition-all duration-200 cursor-pointer ${
                      selectedPayment === method.id
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{method.icon}</span>
                    <span className="text-xs font-bold text-slate-700 block">{method.label}</span>
                    <span className="text-3xs text-slate-400 block mt-0.5">{method.description}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-700">
                    Total: {formatCOP(PLANS[selectedPlan as keyof typeof PLANS]?.price || 0)}/mes
                  </span>
                  <span className="block text-3xs text-slate-400 mt-0.5">
                    IVA incluido · Pago recurrente mensual · Cancela cuando quieras
                  </span>
                </div>

                <button
                  onClick={iniciarPago}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-slate-950 hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-primary/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Pagar con {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.label || "Wompi"}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Badges de confianza */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-2xs text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Pagos seguros con Wompi
            </span>
            <span className="flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5" /> Facturación electrónica
            </span>
            <span className="flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5" /> Cancela cuando quieras
            </span>
          </div>
        </>
      ) : null}

      {/* Historial de pagos */}
      {paymentHistory.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-slate-400" />
            Historial de Transacciones
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-2xs text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paymentHistory.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {PLANS[p.plan as keyof typeof PLANS]?.name || p.plan}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {formatCOP((p.amount_cents || 0) / 100)}
                    </td>
                    <td className="px-4 py-3">
                      {paymentMethodLabels[p.payment_method_type] || p.payment_method_type || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-4xs font-bold ${
                          p.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "failed"
                            ? "bg-red-50 text-red-700"
                            : p.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-50 text-slate-500"
                        }`}
                      >
                        {p.status === "active" ? "Activo" : p.status === "failed" ? "Fallido" : p.status === "pending" ? "Pendiente" : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seguridad */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-center">
        <p className="text-2xs text-slate-400 leading-relaxed">
          🔒 Tus pagos son procesados por <strong>Wompi (Bancolombia)</strong>, certificado PCI DSS.
          No almacenamos ni vemos los datos de tus tarjetas o cuentas.
          Puedes cancelar tu suscripción en cualquier momento desde esta página.
        </p>
      </div>
    </div>
  );
}
