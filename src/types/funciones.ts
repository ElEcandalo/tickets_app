export interface Funcion {
  id: string; // uuid
  obra_id: string; // uuid (obras.id)
  nombre: string;
  descripcion: string | null;
  fecha: string; // timestamp
  ubicacion: string;
  capacidad_total: number;
  precio_entrada: number;
  estado: 'ACTIVA' | 'CANCELADA' | 'FINALIZADA';
  created_at?: string;
  created_by: string; // uuid (user_profiles.id)
  updated_at?: string;
}

export interface Obra {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_at?: string;
  created_by?: string;
} 