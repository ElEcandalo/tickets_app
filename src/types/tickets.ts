export interface Ticket {
  id: string; // uuid
  funcion_id: string; // uuid (funciones.id)
  invitado_id: string; // uuid (invitados.id)
  qr_code: string;
  usado: boolean;
  created_at?: string;
  updated_at?: string;
} 