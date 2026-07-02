/**
 * POST /api/pagos/crear
 * 
 * Crea una transacción en Wompi para que el usuario pague su suscripción.
 * Body: { plan: "pro" | "empresarial", payment_method?: "NEQUI" | "CARD" | "PSE" | ... }
 * 
 * Retorna la URL de checkout de Wompi para redirigir al usuario.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createWompiTransaction, PLAN_PRICES } from "@/lib/wompi";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar sesión
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, payment_method = "NEQUI" } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json(
        { error: "Plan inválido. Usa 'pro' o 'empresarial'." },
        { status: 400 }
      );
    }

    const planInfo = PLAN_PRICES[plan];
    const reference = `sub_${user.id.slice(0, 8)}_${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const redirectUrl = `${baseUrl}/dashboard/suscripcion?pago=exitoso&ref=${reference}`;

    // Crear registro de suscripción pendiente en Supabase
    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan: plan,
      status: "pending",
      reference: reference,
      amount_cents: planInfo.amount_cents,
      currency: "COP",
      payment_method_type: payment_method,
    });

    if (subError) {
      console.error("Error creando registro de suscripción:", subError);
      // No bloqueamos — el webhook lo creará si falla aquí
    }

    // Crear transacción en Wompi
    const transaction = await createWompiTransaction({
      amount_cents: planInfo.amount_cents,
      reference,
      customer_email: user.email,
      payment_method_type: payment_method,
      redirect_url: redirectUrl,
      plan,
    });

    // Guardar el ID de transacción de Wompi en el registro de suscripción
    await supabase
      .from("subscriptions")
      .update({ wompi_transaction_id: transaction.data.id })
      .eq("reference", reference);

    return NextResponse.json({
      success: true,
      transaction_id: transaction.data.id,
      reference,
      redirect_url: transaction.data.redirect_url,
      checkout_url: `https://checkout.wompi.co/p/${transaction.data.id}`,
    });
  } catch (err: any) {
    console.error("Error en /api/pagos/crear:", err);
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
