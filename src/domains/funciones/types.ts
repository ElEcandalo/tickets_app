// ============================================================================
// TIPOS DEL DOMINIO DE FUNCIONES
// ============================================================================

import { BaseUserEntity } from '@/shared/types';

export interface Funcion extends BaseUserEntity {
  obra_id: string;
  nombre: string;
  descripcion: string | null;
  fecha: string;
  ubicacion: string;
  capacidad_total: number;
  precio_entrada: number;
  estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA';
}

export interface FuncionWithObra extends Funcion {
  obra?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  };
}

export interface FuncionFormData {
  id: string;
  obra_id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  capacidad_total: number;
  precio_entrada: number;
  estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA';
  created_by: string;
}

export interface FuncionOption {
  id: string;
  nombre: string;
  fecha: string;
}

export interface FuncionStats {
  total: number;
  activas: number;
  canceladas: number;
  finalizadas: number;
  ingresos_totales: number;
}

 