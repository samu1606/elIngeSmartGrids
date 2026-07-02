"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "../actions";
import { Zap, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInAction, null);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0F172A] px-4 sm:px-6 lg:px-8">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full bg-primary-green/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-emerald-500/5 blur-3xl" />

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
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-slate-450 mt-2">
            Ingresa tus credenciales para acceder a tus diseños
          </p>
        </div>

        {/* Login Form Container */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md glass-panel">
          <form action={formAction} className="space-y-6">
            
            {/* Error Message */}
            {state?.error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-200">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400" />
                <span>{state.error}</span>
              </div>
            )}

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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-2xs font-semibold uppercase tracking-wider text-slate-400">
                  Contraseña
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-xl border border-slate-850 bg-slate-950 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-primary-green/50 transition-colors"
                placeholder="••••••••"
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
                  Iniciando sesión...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          {/* Redirect to Register Link */}
          <div className="text-center mt-6 pt-6 border-t border-slate-850 text-xs">
            <p className="text-slate-450">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="font-semibold text-primary-green hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
