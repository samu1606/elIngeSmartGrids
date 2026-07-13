import { Metadata } from 'next';
import ConstructorAPUPage from '@/components/presupuestos/ConstructorAPU';

export const metadata: Metadata = {
  title: 'Constructor de APU | ElectriPro',
  description: 'Crea Análisis de Precios Unitarios combinando insumos de equipos, materiales, transportes y mano de obra',
};

export default function Page() {
  return <ConstructorAPUPage />;
}
