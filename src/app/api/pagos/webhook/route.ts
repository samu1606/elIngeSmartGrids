/**
 * POST /api/pagos/webhook
 * 
 * Recibe notificaciones de Wompi cuando un pago es aprobado/rechazado.
 * Wompi envía este webhook automáticamente.
 * 
 * Eventos: transaction.updated (cuando cambia el estado de la transacción)
 * 
 * IMPORTANTE: Esta URL debe configurarse en el dashboard de Wompi:
 *   https://tudominio.com/api/pagos/webhook
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyWompiSignature } from "@/lib/wompi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data, signature, timestamp } = body;

    console.log(`📨 Webhook Wompi recibido: ${event}`, {
      txId: data?.transaction?.id,
      status: data?.transaction?.status,
    });

    // Verificar firma (en producción; en sandbox es opcional)
    if (signature?.checksum) {
      const isValid = await verifyWompiSignature(signature.checksum, {
        data,
        timestamp,
        event,
      });
      if (!isValid) {
        console.warn("⚠️ Firma de webhook inválida");
        return NextResponse.json({ error: "Firma inválida" }, { status: 403 });
      }
    }

    // Solo procesar eventos de transacción
    if (event !== "transaction.updated") {
      return NextResponse.json({ received: true, event });
    }

    const transaction = data.transaction;
    const { id: wompiTxId, reference, status, amount_in_cents, payment_method_type, payment_method } = transaction;

    if (!reference) {
      console.error("❌ Webhook sin referencia");
      return NextResponse.json({ error: "Sin referencia" }, { status: 400 });
    }

    const supabase = await createClient();

    // Buscar suscripción por referencia
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan, status, reference")
      .eq("reference", reference)
      .single();

    if (fetchError || !subscription) {
      console.error(`❌ Suscripción no encontrada para referencia: ${reference}`);
      return NextResponse.json({ error: "Suscripción no encontrada" }, { status: 404 });
    }

    // Mapear estado de Wompi a nuestro estado
    const statusMap: Record<string, string> = {
      APPROVED: "active",
      DECLINED: "failed",
      VOIDED: "cancelled",
      ERROR: "failed",
      PENDING: "pending",
    };

    const newStatus = statusMap[status] || "pending";

    // Actualizar suscripción
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: newStatus,
        wompi_transaction_id: wompiTxId,
        payment_method_type: payment_method_type,
        payment_method_name: payment_method?.type || payment_method_type,
        updated_at: new Date().toISOString(),
        metadata: {
          wompi_status: status,
          payment_method_details: payment_method?.extra || {},
        },
        ...(newStatus === "active"
          ? {
              activated_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
            }
          : {}),
      })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("❌ Error actualizando suscripción:", updateError);
      return NextResponse.json({ error: "Error actualizando" }, { status: 500 });
    }

    // Si el pago fue aprobado, actualizar el plan del usuario en profiles
    if (newStatus === "active") {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ plan: subscription.plan, updated_at: new Date().toISOString() })
        .eq("id", subscription.user_id);

      if (profileError) {
        console.error("❌ Error actualizando perfil:", profileError);
      } else {
        console.log(`✅ Plan "${subscription.plan}" activado para usuario ${subscription.user_id}`);
      }
    }

    return NextResponse.json({
      received: true,
      subscription_id: subscription.id,
      new_status: newStatus,
    });
  } catch (err: any) {
    console.error("❌ Error en webhook Wompi:", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
