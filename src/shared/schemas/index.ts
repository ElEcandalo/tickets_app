// ============================================================================
// SCHEMAS DE VALIDACIÓN ZOD
// ============================================================================

import { z } from 'zod';

// ============================================================================
// SCHEMAS BASE
// ============================================================================

export const baseEntitySchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const baseUserEntitySchema = baseEntitySchema.extend({
  created_by: z.string().uuid(),
});

// ============================================================================
// SCHEMAS DE FUNCIONES
// ============================================================================

export const funcionSchema = z.object({
  obra_id: z.string().uuid({ message: 'Debes seleccionar una obra válida.' }),
  nombre: z.string().min(2, 'El nombre es obligatorio').max(100, 'El nombre es demasiado largo'),
  descripcion: z.string().optional(),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  ubicacion: z.string().min(1, 'La ubicación es obligatoria'),
  capacidad_total: z.number().int().min(1, 'La capacidad debe ser al menos 1').max(1000, 'La capacidad no puede exceder 1000'),
  precio_entrada: z.number().min(0, 'El precio no puede ser negativo').max(10000, 'El precio no puede exceder $10,000'),
  estado: z.enum(['ACTIVA', 'CANCELADA', 'FINALIZADA']),
  created_by: z.string().uuid(),
});

export const funcionFormSchema = funcionSchema.extend({
  id: z.string().optional(),
});

// ============================================================================
// SCHEMAS DE OBRAS
// ============================================================================

export const obraSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio').max(100, 'El nombre es demasiado largo'),
  descripcion: z.string().optional().nullable(),
  created_by: z.string().uuid(),
});

export const obraFormSchema = obraSchema.extend({
  id: z.string().optional(),
});

// ============================================================================
// SCHEMAS DE INVITADOS
// ============================================================================

export const invitadoSchema = z.object({
  funcion_id: z.string().uuid({ message: 'Debes seleccionar una función válida.' }),
  nombre: z.string().min(2, 'El nombre es obligatorio').max(100, 'El nombre es demasiado largo'),
  email: z.string().email('Email inválido').min(1, 'El email es obligatorio'),
  telefono: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Solo números, espacios, guiones y paréntesis').optional().or(z.literal('')),
  cantidad_tickets: z.number().int().min(1, 'Debe ser al menos 1').max(100, 'Máximo 100 tickets'),
  colaborador_id: z.string().uuid().optional().or(z.literal('')).or(z.null()),
  created_at: z.string().optional().or(z.literal('')),
  updated_at: z.string().optional().or(z.literal('')),
});

export const invitadoFormSchema = invitadoSchema.extend({
  id: z.string().optional(),
});

// ============================================================================
// SCHEMAS DE TICKETS
// ============================================================================

export const ticketSchema = z.object({
  qr_code: z.string().min(1, 'QR code es obligatorio'),
  funcion_id: z.string().uuid(),
  invitado_id: z.string().uuid(),
  usado: z.boolean(),
  validated_at: z.string().optional(),
  validated_by: z.string().optional(),
});

export const ticketValidationSchema = z.object({
  ticketId: z.string().uuid(),
  qrCode: z.string(),
  invitadoNombre: z.string(),
  invitadoEmail: z.string().email(),
  funcionNombre: z.string(),
  funcionFecha: z.string(),
  funcionUbicacion: z.string(),
  usado: z.boolean(),
  version: z.string(),
  type: z.literal('theater-ticket'),
});

// ============================================================================
// SCHEMAS DE COLABORADORES
// ============================================================================

export const colaboradorSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio').max(100, 'El nombre es demasiado largo'),
  email: z.string().email('Email inválido').min(1, 'El email es obligatorio'),
});

export const colaboradorFormSchema = colaboradorSchema.extend({
  id: z.string().optional(),
});

// ============================================================================
// SCHEMAS DE FILTROS Y BÚSQUEDA
// ============================================================================

export const funcionFilterSchema = z.object({
  estado: z.enum(['ACTIVA', 'CANCELADA', 'FINALIZADA']).optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  obra_id: z.string().uuid().optional(),
});

export const invitadoFilterSchema = z.object({
  funcion_id: z.string().uuid().optional(),
  colaborador_id: z.string().uuid().optional(),
  email: z.string().optional(),
});

export const ticketFilterSchema = z.object({
  funcion_id: z.string().uuid().optional(),
  invitado_id: z.string().uuid().optional(),
  usado: z.boolean().optional(),
});

// ============================================================================
// SCHEMAS DE PAGINACIÓN
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// SCHEMAS DE RESPUESTA
// ============================================================================

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });

// ============================================================================
// TIPOS INFERIDOS DE LOS SCHEMAS
// ============================================================================

export type FuncionInput = z.infer<typeof funcionSchema>;
export type FuncionFormInput = z.infer<typeof funcionFormSchema>;
export type ObraInput = z.infer<typeof obraSchema>;
export type ObraFormInput = z.infer<typeof obraFormSchema>;
export type InvitadoInput = z.infer<typeof invitadoSchema>;
export type InvitadoFormInput = z.infer<typeof invitadoFormSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type TicketValidationInput = z.infer<typeof ticketValidationSchema>;
export type ColaboradorInput = z.infer<typeof colaboradorSchema>;
export type ColaboradorFormInput = z.infer<typeof colaboradorFormSchema>;
export type FuncionFilter = z.infer<typeof funcionFilterSchema>;
export type InvitadoFilter = z.infer<typeof invitadoFilterSchema>;
export type TicketFilter = z.infer<typeof ticketFilterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>; 