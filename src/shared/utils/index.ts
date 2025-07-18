// ============================================================================
// UTILIDADES COMPARTIDAS
// ============================================================================

// ============================================================================
// UTILIDADES DE FECHAS
// ============================================================================

/**
 * Formatea una fecha en formato DD-MM-YYYY HH:MM
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

/**
 * Formatea una fecha en formato "DD de MMMM YYYY HH:MM hs"
 */
export const formatFechaHora = (fechaString: string): string => {
  const date = new Date(fechaString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('es-ES', { month: 'long' });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} de ${month} ${year} ${hours}:${minutes} hs`;
};

/**
 * Verifica si una fecha es anterior al día actual
 */
export const isDateInPast = (dateString: string): boolean => {
  const fechaSeleccionada = new Date(dateString);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fechaSeleccionada < hoy;
};

/**
 * Convierte una fecha a ISO string
 */
export const toISOString = (dateString: string): string => {
  return new Date(dateString).toISOString();
};

// ============================================================================
// UTILIDADES DE VALIDACIÓN
// ============================================================================

/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un teléfono
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
};

/**
 * Valida un UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// ============================================================================
// UTILIDADES DE FORMATEO
// ============================================================================

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Formatea un número con separadores de miles
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-AR').format(num);
};

/**
 * Trunca un texto a una longitud específica
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de cada palabra
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// ============================================================================
// UTILIDADES DE ARRAYS Y OBJETOS
// ============================================================================

/**
 * Agrupa elementos de un array por una clave
 */
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Ordena un array por múltiples criterios
 */
export const sortBy = <T>(array: T[], ...criteria: Array<keyof T | { key: keyof T; order: 'asc' | 'desc' }>): T[] => {
  return [...array].sort((a, b) => {
    for (const criterion of criteria) {
      let key: keyof T;
      let order: 'asc' | 'desc' = 'asc';
      
      if (typeof criterion === 'object') {
        key = criterion.key;
        order = criterion.order;
      } else {
        key = criterion;
      }
      
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Filtra un array por múltiples criterios
 */
export const filterBy = <T>(array: T[], filters: Partial<T>): T[] => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      return item[key as keyof T] === value;
    });
  });
};

/**
 * Obtiene valores únicos de un array
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

// ============================================================================
// UTILIDADES DE PAGINACIÓN
// ============================================================================

/**
 * Calcula la información de paginación
 */
export const getPaginationInfo = (
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    currentPage,
    totalItems,
  };
};

/**
 * Obtiene los elementos de una página específica
 */
export const getPageItems = <T>(
  items: T[],
  page: number,
  itemsPerPage: number
): T[] => {
  const startIndex = (page - 1) * itemsPerPage;
  return items.slice(startIndex, startIndex + itemsPerPage);
};

// ============================================================================
// UTILIDADES DE ESTADO
// ============================================================================

/**
 * Combina múltiples estados de loading
 */
export const combineLoadingStates = (...states: Array<{ loading: boolean; error: string }>) => {
  return {
    loading: states.some(state => state.loading),
    error: states.find(state => state.error)?.error || '',
  };
};

/**
 * Crea un estado inicial de loading
 */
export const createInitialLoadingState = () => ({
  loading: false,
  error: '',
});

// ============================================================================
// UTILIDADES DE CLIPBOARD
// ============================================================================

/**
 * Copia texto al portapapeles
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// ============================================================================
// UTILIDADES DE STORAGE
// ============================================================================

/**
 * Guarda datos en localStorage
 */
export const saveToStorage = (key: string, data: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Obtiene datos de localStorage
 */
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Elimina datos de localStorage
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// ============================================================================
// UTILIDADES DE DEBOUNCE Y THROTTLE
// ============================================================================

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================================================
// UTILIDADES DE ERROR HANDLING
// ============================================================================

/**
 * Maneja errores de forma consistente
 */
export const handleError = (error: unknown, context: string): string => {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Error inesperado';
};

/**
 * Crea un error personalizado
 */
export const createError = (message: string, context?: string): Error => {
  const errorMessage = context ? `${context}: ${message}` : message;
  return new Error(errorMessage);
};

// ============================================================================
// UTILIDADES DE VALIDACIÓN DE FORMULARIOS
// ============================================================================

/**
 * Mapea errores de Zod a errores de campo
 */
export const mapZodErrorsToFieldErrors = (zodError: unknown): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  
  if (zodError && typeof zodError === 'object' && 'issues' in zodError) {
    const issues = (zodError as { issues: unknown[] }).issues;
    issues.forEach((err: unknown) => {
      if (err && typeof err === 'object' && 'path' in err && 'message' in err) {
        const path = (err as { path: unknown }).path;
        const message = (err as { message: string }).message;
        if (Array.isArray(path) && path[0]) {
          fieldErrors[path[0].toString()] = message;
        }
      }
    });
  }
  
  return fieldErrors;
};

/**
 * Valida un formulario con Zod
 */
export const validateForm = <T>(
  schema: { safeParse: (data: T) => { success: boolean; error?: unknown } },
  data: T
): { success: boolean; errors?: Record<string, string> } => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: mapZodErrorsToFieldErrors(result.error),
    };
  }
  
  return { success: true };
}; 