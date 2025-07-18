// ============================================================================
// TIPOS COMPARTIDOS DEL SISTEMA
// ============================================================================

// ============================================================================
// TIPOS BASE
// ============================================================================

export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface BaseUserEntity extends BaseEntity {
  created_by: string;
}

// ============================================================================
// TIPOS DE FUNCIONES
// ============================================================================

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

// ============================================================================
// TIPOS DE OBRAS
// ============================================================================

export interface Obra extends BaseUserEntity {
  nombre: string;
  descripcion: string | null;
}

// ============================================================================
// TIPOS DE INVITADOS
// ============================================================================

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

// ============================================================================
// TIPOS DE TICKETS
// ============================================================================

export interface Ticket extends BaseEntity {
  qr_code: string;
  funcion_id: string;
  invitado_id: string;
  usado: boolean;
  validated_at?: string;
  validated_by?: string;
}

export interface TicketWithDetails extends Ticket {
  invitado?: {
    nombre: string;
    email: string;
  };
  funcion?: {
    nombre: string;
    fecha: string;
    ubicacion: string;
  };
}

export interface TicketStats {
  total: number;
  usados: number;
  disponibles: number;
  porcentajeUsados: number;
}

export interface TicketValidationResult {
  valid: boolean;
  ticket?: {
    id: string;
    qr_code: string;
    funcion_id: string;
    invitado_id: string;
    usado: boolean;
    created_at: string;
    funcion?: { nombre: string; fecha: string; ubicacion: string };
    invitado?: { nombre: string; email: string };
  };
  message: string;
  qrInfo?: {
    ticketId: string;
    qrCode: string;
    invitadoNombre: string;
    invitadoEmail: string;
    funcionNombre: string;
    funcionFecha: string;
    funcionUbicacion: string;
    usado: boolean;
    version: string;
  };
}

// ============================================================================
// TIPOS DE COLABORADORES
// ============================================================================

export interface Colaborador extends BaseEntity {
  nombre: string;
  email: string;
}

// ============================================================================
// TIPOS DE UI
// ============================================================================

export interface FuncionOption {
  id: string;
  nombre: string;
  fecha: string;
}

export interface ColaboradorOption {
  id: string;
  nombre: string;
  email: string;
}

// ============================================================================
// TIPOS DE FORMULARIOS
// ============================================================================

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

export interface ObraFormData {
  id: string;
  nombre: string;
  descripcion: string | null;
  created_by: string;
}

// ============================================================================
// TIPOS DE ESTADO
// ============================================================================

export interface LoadingState {
  loading: boolean;
  error: string;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface ModalState {
  isOpen: boolean;
  data?: unknown;
} 