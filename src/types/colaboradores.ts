export interface Colaborador {
  id: string; // uuid
  nombre: string;
  email: string;
  telefono?: string | null;
  rol?: string | null;
  created_at?: string;
  updated_at?: string;
} 