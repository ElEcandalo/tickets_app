// ============================================================================
// TIPOS DEL DOMINIO DE INVITADOS
// ============================================================================

import { BaseEntity } from '@/shared/types';

export interface Invitado extends BaseEntity {
  funcion_id: string | undefined | null;
  colaborador_id?: string | undefined | null;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  cantidad_tickets: number;
}

export interface InvitadoWithRelations extends Invitado {
  funciones?: {
    id: string;
    nombre: string;
    fecha: string;
    capacidad_total: number;
    precio_entrada: number;
  }[];
  colaborador?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface InvitadoStats {
  total_invitados: number;
  total_tickets: number;
  capacidad_disponible: number | null;
  porcentaje_ocupacion: number | null;
}

export interface InvitadoFormData {
  id: string;
  funcion_id: string;
  colaborador_id: string | null;
  nombre: string;
  email: string;
  telefono: string;
  cantidad_tickets: number;
  created_at: string;
  updated_at: string;
}

export interface InvitadoFilter {
  funcion_id?: string;
  colaborador_id?: string;
  email?: string;
  nombre?: string;
} 