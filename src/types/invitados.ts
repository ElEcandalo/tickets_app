export interface Invitado {
  id: string; // uuid
  funcion_id: string | undefined | null; // uuid (funciones.id)
  colaborador_id?: string | undefined | null; // uuid (colaboradores.id)
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  cantidad_tickets: number;
  created_at?: string;
  updated_at?: string;
}

// Type para invitados con relaciones anidadas (usado en queries con join)
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

// Type para estadísticas de invitados
export interface InvitadoStats {
  total_invitados: number;
  total_tickets: number;
  capacidad_disponible: number | null;
  porcentaje_ocupacion: number | null;
} 