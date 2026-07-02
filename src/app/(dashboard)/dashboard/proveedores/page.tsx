"use client";

import { useState } from "react";
import { Package, Plus, Search, TrendingUp, DollarSign, Store } from "lucide-react";

export default function ProveedoresPage() {
  const [showForm, setShowForm] = useState(false);

  const products = [
    { id: "1", name: "Cable THW #8 AWG (x metro)", category: "Cables", price: 4200, stock: 500, supplier: "ElectroColombia" },
    { id: "2", name: "Breaker Siemens 32A 1P", category: "Protección", price: 28000, stock: 120, supplier: "Distrieléctrica" },
    { id: "3", name: "Panel solar 450W Monocristalino", category: "Solar", price: 450000, stock: 45, supplier: "SolarTech CO" },
    { id: "4", name: "Inversor híbrido 5kW 48V", category: "Solar", price: 2100000, stock: 12, supplier: "SolarTech CO" },
    { id: "5", name: "Tubería PVC 2\" (x metro)", category: "Canalización", price: 15000, stock: 200, supplier: "PVC Andina" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proveedores y Materiales</h1>
          <p className="text-sm text-slate-500 mt-1">
            Publica tus productos y llega a proyectos eléctricos activos
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Publicar producto"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              <p className="text-xs text-slate-500">Productos publicados</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">12</p>
              <p className="text-xs text-slate-500">Cotizaciones enviadas</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">$8.2M</p>
              <p className="text-xs text-slate-500">Ventas del mes</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Product Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Nuevo producto</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del producto</label>
              <input type="text" placeholder="Ej: Cable THW #8 AWG" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                <option>Cables</option>
                <option>Protección</option>
                <option>Solar</option>
                <option>Canalización</option>
                <option>Iluminación</option>
                <option>Motores</option>
                <option>Herramientas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Precio (COP)</label>
              <input type="number" placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Stock disponible</label>
              <input type="number" placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none" />
            </div>
          </div>
          <button className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90">
            Publicar producto
          </button>
        </div>
      )}

      {/* Products table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Producto</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Categoría</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600">Precio</th>
                <th className="px-5 py-3 text-right font-semibold text-slate-600">Stock</th>
                <th className="px-5 py-3 text-left font-semibold text-slate-600">Proveedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">
                    ${p.price.toLocaleString("es-CO")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-semibold ${p.stock < 20 ? "text-orange-600" : "text-slate-700"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5" />
                      {p.supplier}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">¿Eres distribuidor o tienda elécttrica?</h3>
            <p className="text-sm text-slate-600 mt-1">
              Publica tu catálogo de productos y recibe solicitudes de cotización automáticas
              de los proyectos que se crean en la plataforma. Conecta con ingenieros y técnicos
              que ya están comprando materiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}