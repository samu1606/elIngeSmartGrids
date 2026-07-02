/**
 * Wompi API Client — Pasarela de pagos colombiana
 * 
 * Métodos soportados: Nequi, Bancolombia, Tarjetas Crédito/Débito, PSE, Efectivo
 * Docs: https://docs.wompi.co/docs/colombia/
 * 
 * Sandbox: https://sandbox.wompi.co/v1/
 * Producción: https://production.wompi.co/v1/
 */

const WOMPI_API = process.env.WOMPI_API_URL || "https://sandbox.wompi.co/v1";
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || "";
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY || "";
const WOMPI_WEBHOOK_SECRET = process.env.WOMPI_WEBHOOK_SECRET || "";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** Planes y precios en centavos COP */
export const PLAN_PRICES: Record<string, { name: string; amount_cents: number; label: string }> = {
  pro: {
    name: "Profesional",
    amount_cents: 5000000, // $50,000 COP en centavos
    label: "Plan Profesional Mensual",
  },
  empresarial: {
    name: "Empresarial",
    amount_cents: 15000000, // $150,000 COP en centavos
    label: "Plan Empresarial Mensual",
  },
};

/** Tipos de método de pago disponibles */
export const PAYMENT_METHODS = [
  { id: "NEQUI", label: "Nequi", icon: "🟣", description: "Paga desde tu app Nequi" },
  { id: "BANCOLOMBIA_TRANSFER", label: "Bancolombia", icon: "🟡", description: "Transferencia desde tu cuenta Bancolombia" },
  { id: "CARD", label: "Tarjeta Crédito/Débito", icon: "💳", description: "Visa, Mastercard, American Express" },
  { id: "PSE", label: "PSE", icon: "🏦", description: "Débito desde cualquier banco colombiano" },
  { id: "BANCOLOMBIA_COLLECT", label: "Efectivo", icon: "💵", description: "Paga en corresponsales Bancolombia" },
] as const;

interface CreateTransactionParams {
  amount_cents: number;
  reference: string;
  customer_email: string;
  payment_method_type: "NEQUI" | "CARD" | "PSE" | "BANCOLOMBIA_TRANSFER" | "BANCOLOMBIA_COLLECT";
  redirect_url: string;
  plan: string;
}

interface WompiTransactionResponse {
  data: {
    id: string;
    created_at: string;
    amount_in_cents: number;
    reference: string;
    currency: string;
    status: string;
    status_message: string | null;
    redirect_url: string | null;
    payment_method_type: string;
    payment_link_id: string | null;
  };
}

interface WompiWebhookEvent {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      status: string;
      amount_in_cents: number;
      payment_method_type: string;
      payment_method: {
        type: string;
        extra: Record<string, any>;
      };
    };
  };
  signature: {
    checksum: string;
  };
  timestamp: number;
}

/**
 * Crea una transacción en Wompi.
 * El usuario será redirigido a la URL de checkout para completar el pago.
 */
export async function createWompiTransaction(
  params: CreateTransactionParams
): Promise<WompiTransactionResponse> {
  if (!WOMPI_PRIVATE_KEY) {
    throw new Error("WOMPI_PRIVATE_KEY no configurada. Agrega las llaves en .env.local");
  }

  // Obtener token de aceptación (requerido por Wompi para cumplimiento legal)
  const acceptanceToken = await getAcceptanceToken();

  const body: Record<string, any> = {
    amount_in_cents: params.amount_cents,
    currency: "COP",
    customer_email: params.customer_email,
    reference: params.reference,
    redirect_url: params.redirect_url,
    payment_method_type: params.payment_method_type,
    acceptance_token: acceptanceToken,
    customer_data: {
      email: params.customer_email,
    },
    shipping_address: {
      address_line_1: "Colombia",
      country: "CO",
    },
  };

  const res = await fetch(`${WOMPI_API}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    console.error("Wompi transaction error:", err);
    throw new Error(err.error?.message || err.reason || "Error creando transacción en Wompi");
  }

  return res.json();
}

/**
 * Obtiene el token de aceptación requerido por Wompi.
 * Este token representa la aceptación de términos y condiciones por parte del comercio.
 */
async function getAcceptanceToken(): Promise<string> {
  if (!WOMPI_PUBLIC_KEY) return "";

  try {
    const res = await fetch(`${WOMPI_API}/merchants/${WOMPI_PUBLIC_KEY}`);
    if (!res.ok) return "";
    const data = await res.json();
    return data.data?.presigned_acceptance?.acceptance_token || "";
  } catch {
    return "";
  }
}

/**
 * Consulta el estado de una transacción en Wompi.
 */
export async function getWompiTransaction(transactionId: string): Promise<WompiTransactionResponse> {
  const res = await fetch(`${WOMPI_API}/transactions/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error consultando transacción en Wompi");
  }

  return res.json();
}

/**
 * Verifica la firma de un webhook de Wompi.
 * Usa HMAC-SHA256 con el secreto de webhook.
 */
export async function verifyWompiSignature(
  checksum: string,
  eventData: Pick<WompiWebhookEvent, "data" | "timestamp" | "event">
): Promise<boolean> {
  if (!WOMPI_WEBHOOK_SECRET) {
    // En sandbox/desarrollo, permitir sin verificación
    console.warn("⚠️ WOMPI_WEBHOOK_SECRET no configurada — saltando verificación de firma");
    return true;
  }

  try {
    const properties = ["transaction.id", "transaction.status", "transaction.amount_in_cents"];
    const concatenated = properties
      .map((prop) => {
        const value = prop.split(".").reduce((obj: any, key) => obj?.[key], eventData.data);
        return value !== undefined ? String(value) : "";
      })
      .join("") + eventData.timestamp + WOMPI_WEBHOOK_SECRET;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(WOMPI_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(concatenated)
    );

    const computedChecksum = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return computedChecksum === checksum;
  } catch (err) {
    console.error("Error verificando firma Wompi:", err);
    return false;
  }
}

/**
 * Wompi usa centavos. Convierte pesos a centavos.
 */
export function copToCents(cop: number): number {
  return Math.round(cop * 100);
}

/**
 * Convierte centavos a pesos COP.
 */
export function centsToCop(cents: number): number {
  return cents / 100;
}
