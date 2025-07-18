// ============================================================================
// UTILIDADES DEL DOMINIO DE FUNCIONES
// ============================================================================

import { Funcion, FuncionStats } from './types';
import { FuncionFilter } from './schemas';
import { formatDate, formatCurrency } from '@/shared/utils';

/**
 * Obtiene el color del badge según el estado de la función
 */
export const getEstadoColor = (estado: string): string => {
  switch (estado) {
    case 'ACTIVA':
      return 'badge-success';
    case 'CANCELADA':
      return 'badge-danger';
    case 'FINALIZADA':
      return 'badge-gray';
    default:
      return 'badge-gray';
  }
};

/**
 * Formatea la información de una función para mostrar
 */
export const formatFuncionInfo = (funcion: Funcion) => {
  return {
    ...funcion,
    fecha_formateada: formatDate(funcion.fecha),
    precio_formateado: formatCurrency(funcion.precio_entrada),
    capacidad_formateada: funcion.capacidad_total.toLocaleString(),
  };
};

/**
 * Calcula estadísticas de funciones
 */
export const calculateFuncionStats = (funciones: Funcion[]): FuncionStats => {
  const total = funciones.length;
  const activas = funciones.filter(f => f.estado === 'ACTIVA').length;
  const canceladas = funciones.filter(f => f.estado === 'CANCELADA').length;
  const finalizadas = funciones.filter(f => f.estado === 'FINALIZADA').length;
  
  const ingresos_totales = funciones.reduce((sum, funcion) => {
    return sum + (funcion.precio_entrada * funcion.capacidad_total);
  }, 0);

  return {
    total,
    activas,
    canceladas,
    finalizadas,
    ingresos_totales,
  };
};

/**
 * Filtra funciones según criterios
 */
export const filterFunciones = (funciones: Funcion[], filter: FuncionFilter): Funcion[] => {
  return funciones.filter(funcion => {
    if (filter.estado && funcion.estado !== filter.estado) return false;
    if (filter.obra_id && funcion.obra_id !== filter.obra_id) return false;
    if (filter.ubicacion && !funcion.ubicacion.toLowerCase().includes(filter.ubicacion.toLowerCase())) return false;
    
    if (filter.fecha_desde) {
      const fechaFuncion = new Date(funcion.fecha);
      const fechaDesde = new Date(filter.fecha_desde);
      if (fechaFuncion < fechaDesde) return false;
    }
    
    if (filter.fecha_hasta) {
      const fechaFuncion = new Date(funcion.fecha);
      const fechaHasta = new Date(filter.fecha_hasta);
      if (fechaFuncion > fechaHasta) return false;
    }
    
    return true;
  });
};

/**
 * Ordena funciones por fecha
 */
export const sortFuncionesByDate = (funciones: Funcion[], ascending = true): Funcion[] => {
  return [...funciones].sort((a, b) => {
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });
};

/**
 * Verifica si una función está en el pasado
 */
export const isFuncionInPast = (funcion: Funcion): boolean => {
  const fechaFuncion = new Date(funcion.fecha);
  const ahora = new Date();
  return fechaFuncion < ahora;
};

/**
 * Verifica si una función está en el futuro
 */
export const isFuncionInFuture = (funcion: Funcion): boolean => {
  const fechaFuncion = new Date(funcion.fecha);
  const ahora = new Date();
  return fechaFuncion > ahora;
};

/**
 * Obtiene funciones próximas (en las próximas 7 días)
 */
export const getProximasFunciones = (funciones: Funcion[], dias = 7): Funcion[] => {
  const ahora = new Date();
  const limite = new Date();
  limite.setDate(limite.getDate() + dias);
  
  return funciones.filter(funcion => {
    const fechaFuncion = new Date(funcion.fecha);
    return fechaFuncion >= ahora && fechaFuncion <= limite && funcion.estado === 'ACTIVA';
  });
};

/**
 * Obtiene funciones activas
 */
export const getFuncionesActivas = (funciones: Funcion[]): Funcion[] => {
  return funciones.filter(funcion => funcion.estado === 'ACTIVA');
};

/**
 * Obtiene funciones por obra
 */
export const getFuncionesByObra = (funciones: Funcion[], obraId: string): Funcion[] => {
  return funciones.filter(funcion => funcion.obra_id === obraId);
};

/**
 * Valida si una función puede ser editada
 */
export const canEditFuncion = (funcion: Funcion): boolean => {
  return funcion.estado === 'ACTIVA' && !isFuncionInPast(funcion);
};

/**
 * Valida si una función puede ser cancelada
 */
export const canCancelFuncion = (funcion: Funcion): boolean => {
  return funcion.estado === 'ACTIVA' && !isFuncionInPast(funcion);
};

/**
 * Obtiene el estado de disponibilidad de una función
 */
export const getFuncionAvailabilityStatus = (funcion: Funcion, ticketsVendidos: number) => {
  const capacidadDisponible = funcion.capacidad_total - ticketsVendidos;
  const porcentajeOcupacion = (ticketsVendidos / funcion.capacidad_total) * 100;
  
  if (capacidadDisponible <= 0) {
    return { status: 'AGOTADA', color: 'badge-danger' };
  } else if (porcentajeOcupacion >= 90) {
    return { status: 'CASI AGOTADA', color: 'badge-warning' };
  } else if (porcentajeOcupacion >= 50) {
    return { status: 'LIMITADA', color: 'badge-info' };
  } else {
    return { status: 'DISPONIBLE', color: 'badge-success' };
  }
}; 