"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Zap, Menu, X } from "lucide-react";

const LanguageNormSelector = dynamic(() => import("./LanguageNormSelector"), { ssr: false });

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-all duration-300">
                <Zap className="h-6 w-6 fill-primary/20" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                El Inge <span className="text-primary font-light text-sm tracking-widest uppercase block -mt-1">Smart Grids</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:block">
            <div className="flex items-center gap-8">
              <a href="#caracteristicas" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Características
              </a>
              <a href="#precios" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Precios
              </a>
              <a href="#testimonios" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Testimonios
              </a>
            </div>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageNormSelector />
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-primary-dark active:scale-[0.98] transition-all duration-200"
            >
              Pruébalo Gratis
            </Link>
          </div>

          {/* Mobile: Language selector + Menu button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageNormSelector />
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-white hover:text-slate-900 focus:outline-none transition-colors"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-2 pt-2 pb-4 space-y-1 sm:px-3 animate-fade-in" id="mobile-menu">
          <a
            href="#caracteristicas"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
          >
            Características
          </a>
          <a
            href="#precios"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
          >
            Precios
          </a>
          <a
            href="#testimonios"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
          >
            Testimonios
          </a>
          <div className="border-t border-slate-200 my-2 pt-2"></div>
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <div className="px-3 pt-2">
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center rounded-lg bg-primary py-2.5 text-base font-semibold text-slate-950 hover:bg-primary-dark transition-colors"
            >
              Pruébalo Gratis
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
