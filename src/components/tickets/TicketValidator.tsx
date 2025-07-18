'use client';

import { useState } from 'react';
import { TicketService } from '@/services/ticketService';
import QRScanner from './QRScanner';

export default function TicketValidator() {
  const [qrData, setQrData] = useState('');
  const [validationResult, setValidationResult] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const validateTicket = async () => {
    if (!qrData.trim()) {
      alert('Por favor ingresa los datos del QR');
      return;
    }

    try {
      setLoading(true);
      setValidationResult(null);
      
      console.log('🧪 Validando ticket con datos:', qrData);
      const result = await TicketService.validateTicket(qrData);
      
      console.log('🧪 Resultado de validación:', result);
      setValidationResult(result);
      
      if (result.valid) {
        // Preguntar si quiere marcar como usado
        const shouldUse = confirm('¿Deseas marcar este ticket como usado?');
        if (shouldUse && result.ticket) {
          try {
            await TicketService.markTicketAsUsed(result.ticket.id);
            alert('Ticket marcado como usado');
            setValidationResult({ ...result, ticket: { ...result.ticket, usado: true } });
          } catch (error) {
            console.error('Error al marcar ticket como usado:', error);
            alert('Error al marcar ticket como usado');
          }
        }
      }
    } catch (err) {
      console.error('❌ Error validando ticket:', err);
      setValidationResult({
        valid: false,
        message: 'Error al validar el ticket'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    console.log('🔍 QR escaneado en validador:', data);
    setQrData(data);
    setShowScanner(false);
    // Auto-validar después del escaneo
    setTimeout(() => validateTicket(), 500);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">🔍 Validador de Tickets</h3>
      
      <div className="space-y-4">
        {/* Botones de modo */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowScanner(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            📱 Escanear QR
          </button>
          <button
            onClick={() => setShowScanner(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            ✏️ Ingresar Manualmente
          </button>
        </div>

        {/* Escáner QR */}
        {showScanner && (
          <div className="border border-gray-200 rounded-lg p-4">
            <QRScanner 
              onScan={handleQRScan}
              onError={(error) => console.error('Error del escáner:', error)}
            />
          </div>
        )}

        {/* Entrada manual */}
        {!showScanner && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datos del QR (JSON):
              </label>
              <textarea
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                placeholder='{"ticketId":"...","qrCode":"...","type":"theater-ticket",...}'
                className="w-full h-32 p-3 border border-gray-300 rounded-md text-sm font-mono"
              />
            </div>

            <button
              onClick={validateTicket}
              disabled={loading || !qrData.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {loading ? 'Validando...' : 'Validar Ticket'}
            </button>
          </>
        )}

        {validationResult && (
          <div className={`p-4 rounded-md ${
            validationResult.valid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h4 className={`font-medium mb-2 ${
              validationResult.valid ? 'text-green-800' : 'text-red-800'
            }`}>
              {validationResult.valid ? '✅ Ticket Válido' : '❌ Ticket Inválido'}
            </h4>
            <p className={`text-sm ${
              validationResult.valid ? 'text-green-700' : 'text-red-700'
            }`}>
              {validationResult.message}
            </p>
            
            {validationResult.ticket && (
              <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                <h5 className="font-medium text-gray-800 mb-2">Información del Ticket:</h5>
                <div className="space-y-1 text-gray-600">
                  <p><strong>ID:</strong> {validationResult.ticket.id}</p>
                  <p><strong>QR Code:</strong> {validationResult.ticket.qr_code}</p>
                  <p><strong>Estado:</strong> {validationResult.ticket.usado ? 'Usado' : 'Disponible'}</p>
                  <p><strong>Creado:</strong> {new Date(validationResult.ticket.created_at).toLocaleString()}</p>
                  {validationResult.ticket.funcion && (
                    <p><strong>Función:</strong> {validationResult.ticket.funcion.nombre}</p>
                  )}
                  {validationResult.ticket.invitado && (
                    <p><strong>Invitado:</strong> {validationResult.ticket.invitado.nombre}</p>
                  )}
                </div>
              </div>
            )}

            {validationResult.qrInfo && (
              <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                <h5 className="font-medium text-blue-800 mb-2">Datos del QR:</h5>
                <div className="space-y-1 text-blue-700">
                  <p><strong>Invitado:</strong> {validationResult.qrInfo.invitadoNombre}</p>
                  <p><strong>Email:</strong> {validationResult.qrInfo.invitadoEmail}</p>
                  <p><strong>Función:</strong> {validationResult.qrInfo.funcionNombre}</p>
                  <p><strong>Fecha:</strong> {validationResult.qrInfo.funcionFecha}</p>
                  <p><strong>Ubicación:</strong> {validationResult.qrInfo.funcionUbicacion}</p>
                  <p><strong>Versión QR:</strong> {validationResult.qrInfo.version}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 