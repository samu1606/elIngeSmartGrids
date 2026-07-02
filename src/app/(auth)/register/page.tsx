"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "../actions";
import { Zap, AlertCircle, ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0F172A] px-4 sm:px-6 lg:px-8">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 h-[350px] w-[350px] rounded-full bg-primary-green/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-green/10 text-primary-green mb-4">
            <Zap className="h-7 w-7 fill-primary-green/20" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">
            Crea tu cuenta gratis
          </h2>
          <p className="text-sm text-slate-450 mt-2">
            Únete a la plataforma de ingeniería inteligente en Colombia
          </p>
        </div>

        {/* Content Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md glass-panel">
          {state?.success ? (
            /* Success State: Check Email */
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">
                ¡Revisa tu bandeja de entrada!
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Hemos enviado un correo de confirmación. Por favor, haz clic en el enlace para activar tu cuenta e ingresar al sistema.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-800 border border-slate-700 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Ir al Login
                </Link>
              </div>
            </div>
          ) : (
            /* Register Form State */
            <form action={formAction} className="space-y-5">
              
              {/* Error Alert */}
              {state?.error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-200">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400" />
                  <span>{state.error}</span>
                </div>
              )}

              {/* Full Name Input */}
              <div>
                <label htmlFor="fullName" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Nombre Completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-slate-850 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-primary-green/50 transition-colors"
                  placeholder="Ing. Carlos Restrepo"
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-xl border border-slate-850 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-primary-green/50 transition-colors"
                  placeholder="carlos@ingenieria.com"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-xl border border-slate-850 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-primary-green/50 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center rounded-xl bg-primary-green py-3.5 text-sm font-bold text-slate-950 hover:bg-primary-green-dark active:scale-[0.98] disabled:scale-100 disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin mr-2" />
                    Registrando cuenta...
                  </>
                ) : (
                  "Registrarme"
                )}
              </button>
            </form>
          )}

          {/* Redirect to Login Link */}
          {!state?.success && (
            <div className="text-center mt-6 pt-6 border-t border-slate-850 text-xs">
              <p className="text-slate-450">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="font-semibold text-primary-green hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
