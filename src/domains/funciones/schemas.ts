// ============================================================================
// SCHEMAS DEL DOMINIO DE FUNCIONES
// ============================================================================

import { z } from 'zod';

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

export const funcionFilterSchema = z.object({
  estado: z.enum(['ACTIVA', 'CANCELADA', 'FINALIZADA']).optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  obra_id: z.string().uuid().optional(),
  ubicacion: z.string().optional(),
});

export type FuncionInput = z.infer<typeof funcionSchema>;
export type FuncionFormInput = z.infer<typeof funcionFormSchema>;
export type FuncionFilter = z.infer<typeof funcionFilterSchema>; 