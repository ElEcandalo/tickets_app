export interface Obra {
  id: string; // uuid
  nombre: string;
  descripcion: string | null;
  created_at?: string; // timestamp
  created_by: string; // uuid (user_profiles.id)
  updated_at?: string; // timestamp
} 