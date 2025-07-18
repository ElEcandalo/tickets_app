import { supabase } from '@/lib/supabaseClient';
import QRCode from 'qrcode';
import { Ticket } from '@/types/tickets';

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

// Cache para QR codes generados
const qrCodeCache = new Map<string, string>();

export class TicketService {
  /**
   * Genera un código QR único para un ticket con cache
   */
  static async generateQRCode(ticketId: string): Promise<string> {
    // Verificar cache primero
    if (qrCodeCache.has(ticketId)) {
      return qrCodeCache.get(ticketId)!;
    }

    try {
      const qrData = JSON.stringify({
        ticketId,
        timestamp: Date.now(),
        type: 'theater-ticket'
      });
      
      const qrCode = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'L', // Menor corrección de errores para archivos más pequeños
        type: 'image/png',
        margin: 1,
        width: 200, // Tamaño más pequeño
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Guardar en cache
      qrCodeCache.set(ticketId, qrCode);
      
      return qrCode;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('No se pudo generar el código QR');
    }
  }

  /**
   * Crea tickets automáticamente para un invitado
   */
  static async createTicketsForInvitado(invitadoId: string, funcionId: string, cantidadTickets: number): Promise<Ticket[]> {
    try {
      const tickets: Ticket[] = [];
      
      for (let i = 0; i < cantidadTickets; i++) {
        // Generar ID único para el ticket
        const ticketId = `${invitadoId}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Crear ticket en la base de datos
        const { data: ticket, error } = await supabase
          .from('tickets')
          .insert({
            funcion_id: funcionId,
            invitado_id: invitadoId,
            qr_code: ticketId, // Guardamos solo el ID único
            usado: false
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating ticket:', error);
          throw new Error('No se pudo crear el ticket');
        }

        tickets.push(ticket);
      }

      return tickets;
    } catch (error) {
      console.error('Error creating tickets for invitado:', error);
      throw error;
    }
  }

  /**
   * Genera el QR code para un ticket específico (optimizado)
   */
  static async generateQRForTicket(ticketId: string): Promise<string> {
    console.log('🔧 generateQRForTicket llamado con ticketId:', ticketId);
    
    // Verificar cache primero
    if (qrCodeCache.has(ticketId)) {
      console.log('🔧 QR encontrado en cache para ticketId:', ticketId);
      return qrCodeCache.get(ticketId)!;
    }

    try {
      console.log('🔧 Generando nuevo QR para ticketId:', ticketId);
      
      // Obtener información básica del ticket
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('id, qr_code, funcion_id, invitado_id, usado, created_at')
        .eq('id', ticketId)
        .single();

      if (error || !ticket) {
        throw new Error('No se pudo obtener la información del ticket');
      }

      // Obtener datos del invitado
      const { data: invitado } = await supabase
        .from('invitados')
        .select('nombre, email')
        .eq('id', ticket.invitado_id)
        .single();

      // Obtener datos de la función
      const { data: funcion } = await supabase
        .from('funciones')
        .select('nombre, fecha, ubicacion')
        .eq('id', ticket.funcion_id)
        .single();

      // Crear datos únicos y consistentes para el QR
      const qrData = JSON.stringify({
        ticketId: ticket.id,
        qrCode: ticket.qr_code, // ID único original
        funcionId: ticket.funcion_id,
        invitadoId: ticket.invitado_id,
        // Datos del invitado
        invitadoNombre: invitado?.nombre || 'Sin nombre',
        invitadoEmail: invitado?.email || 'Sin email',
        // Datos de la función
        funcionNombre: funcion?.nombre || 'Sin función',
        funcionFecha: funcion?.fecha || 'Sin fecha',
        funcionUbicacion: funcion?.ubicacion || 'Sin ubicación',
        // Estado y metadatos
        usado: ticket.usado,
        created_at: ticket.created_at,
        type: 'theater-ticket',
        version: '1.0'
      });
      
      console.log('🔧 Datos QR únicos y completos:', qrData);
      
      const qrCode = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'L', // Menor corrección de errores para archivos más pequeños
        type: 'image/png',
        margin: 1,
        width: 200, // Tamaño más pequeño
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      console.log('🔧 QR generado exitosamente, longitud:', qrCode.length);
      
      // Guardar en cache
      qrCodeCache.set(ticketId, qrCode);
      console.log('🔧 QR guardado en cache');
      
      return qrCode;
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      throw new Error('No se pudo generar el código QR');
    }
  }

  /**
   * Limpia el cache de QR codes
   */
  static clearQRCache(): void {
    qrCodeCache.clear();
  }

  /**
   * Obtiene todos los tickets de un invitado
   */
  static async getTicketsByInvitado(invitadoId: string): Promise<TicketWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          invitado:invitados(id, nombre, email),
          funcion:funciones(id, nombre, fecha, ubicacion)
        `)
        .eq('invitado_id', invitadoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        throw new Error('No se pudieron obtener los tickets');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting tickets by invitado:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los tickets de una función
   */
  static async getTicketsByFuncion(funcionId: string): Promise<TicketWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          invitado:invitados(id, nombre, email),
          funcion:funciones(id, nombre, fecha, ubicacion)
        `)
        .eq('funcion_id', funcionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        throw new Error('No se pudieron obtener los tickets');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting tickets by funcion:', error);
      throw error;
    }
  }

  /**
   * Marca un ticket como usado
   */
  static async markTicketAsUsed(ticketId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ usado: true })
        .eq('id', ticketId);

      if (error) {
        console.error('Error marking ticket as used:', error);
        throw new Error('No se pudo marcar el ticket como usado');
      }
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      throw error;
    }
  }

  /**
   * Reenvía el email con los tickets QR
   */
  static async resendTicketEmail(invitadoId: string): Promise<void> {
    try {
      // Obtener información del invitado y sus tickets
      const { data: invitado, error: invitadoError } = await supabase
        .from('invitados')
        .select(`
          *,
          funcion:funciones(nombre, fecha, ubicacion),
          tickets:tickets(*)
        `)
        .eq('id', invitadoId)
        .single();

      if (invitadoError || !invitado) {
        throw new Error('No se pudo obtener la información del invitado');
      }

      if (!invitado.email) {
        throw new Error('El invitado no tiene email registrado');
      }

      // Aquí implementarías el envío real del email
      // Por ahora, simulamos el envío
      console.log('Enviando email a:', invitado.email);
      console.log('Tickets:', invitado.tickets);
      console.log('Función:', invitado.funcion);

      // TODO: Integrar con servicio de email (SendGrid, Resend, etc.)
      // await emailService.sendTicketEmail(invitado.email, invitado, invitado.tickets);

    } catch (error) {
      console.error('Error resending ticket email:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de tickets para una función
   */
  static async getTicketStats(funcionId: string): Promise<{
    total: number;
    usados: number;
    disponibles: number;
    porcentajeUsados: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('usado')
        .eq('funcion_id', funcionId);

      if (error) {
        console.error('Error fetching ticket stats:', error);
        throw new Error('No se pudieron obtener las estadísticas');
      }

      const total = data?.length || 0;
      const usados = data?.filter(ticket => ticket.usado).length || 0;
      const disponibles = total - usados;
      const porcentajeUsados = total > 0 ? Math.round((usados / total) * 100) : 0;

      return {
        total,
        usados,
        disponibles,
        porcentajeUsados
      };
    } catch (error) {
      console.error('Error getting ticket stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de tickets para un invitado
   */
  static async getTicketStatsForInvitado(invitadoId: string): Promise<{
    total: number;
    usados: number;
    disponibles: number;
    porcentajeUsados: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('usado')
        .eq('invitado_id', invitadoId);

      if (error) {
        console.error('Error fetching ticket stats for invitado:', error);
        throw new Error('No se pudieron obtener las estadísticas');
      }

      const total = data?.length || 0;
      const usados = data?.filter(ticket => ticket.usado).length || 0;
      const disponibles = total - usados;
      const porcentajeUsados = total > 0 ? Math.round((usados / total) * 100) : 0;

      return {
        total,
        usados,
        disponibles,
        porcentajeUsados
      };
    } catch (error) {
      console.error('Error getting ticket stats for invitado:', error);
      throw error;
    }
  }

  /**
   * Valida un ticket escaneado
   */
  static async validateTicket(qrData: string): Promise<{
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
  }> {
    try {
      console.log('🔍 Validando ticket con datos QR:', qrData);
      
      // Parsear los datos del QR
      const parsedData = JSON.parse(qrData);
      
      if (!parsedData.ticketId || parsedData.type !== 'theater-ticket') {
        return {
          valid: false,
          message: 'QR inválido: formato incorrecto'
        };
      }

      // Buscar el ticket en la base de datos
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
          *,
          funcion:funciones(nombre, fecha, ubicacion),
          invitado:invitados(nombre, email)
        `)
        .eq('id', parsedData.ticketId)
        .single();

      if (error || !ticket) {
        return {
          valid: false,
          message: 'Ticket no encontrado'
        };
      }

      // Verificar si ya fue usado
      if (ticket.usado) {
        return {
          valid: false,
          ticket,
          qrInfo: parsedData,
          message: 'Ticket ya fue utilizado'
        };
      }

      // Verificar que los datos coincidan
      if (ticket.qr_code !== parsedData.qrCode) {
        return {
          valid: false,
          ticket,
          qrInfo: parsedData,
          message: 'QR inválido: datos no coinciden'
        };
      }

      // Verificar que los datos del QR coincidan con la base de datos
      const invitado = Array.isArray(ticket.invitado) ? ticket.invitado[0] : ticket.invitado;
      const funcion = Array.isArray(ticket.funcion) ? ticket.funcion[0] : ticket.funcion;

      if (invitado?.nombre !== parsedData.invitadoNombre || 
          invitado?.email !== parsedData.invitadoEmail ||
          funcion?.nombre !== parsedData.funcionNombre) {
        return {
          valid: false,
          ticket,
          qrInfo: parsedData,
          message: 'QR inválido: datos del invitado o función no coinciden'
        };
      }

      return {
        valid: true,
        ticket,
        qrInfo: parsedData,
        message: 'Ticket válido'
      };

    } catch (error) {
      console.error('Error validating ticket:', error);
      return {
        valid: false,
        message: 'Error al validar el ticket'
      };
    }
  }

  /**
   * Marca un ticket como usado y registra la validación
   */
  static async useTicket(ticketId: string, validatedBy?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          usado: true,
          validated_at: new Date().toISOString(),
          validated_by: validatedBy
        })
        .eq('id', ticketId);

      if (error) {
        console.error('Error marking ticket as used:', error);
        throw new Error('No se pudo marcar el ticket como usado');
      }

      console.log('✅ Ticket marcado como usado:', ticketId);
    } catch (error) {
      console.error('Error using ticket:', error);
      throw error;
    }
  }
} 