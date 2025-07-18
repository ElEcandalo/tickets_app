'use client';

import { useState } from 'react';
import { TicketService } from '@/services/ticketService';
import Image from 'next/image';

export default function QRTest() {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateTestQR = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🧪 Generando QR de prueba...');
      
      const testTicketId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const qr = await TicketService.generateQRForTicket(testTicketId);
      
      console.log('🧪 QR generado:', qr.substring(0, 100) + '...');
      setQrCode(qr);
    } catch (err) {
      console.error('❌ Error en prueba QR:', err);
      setError('Error generando QR de prueba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">🧪 Prueba de QR Codes</h3>
      
      <button
        onClick={generateTestQR}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium mb-4"
      >
        {loading ? 'Generando...' : 'Generar QR de Prueba'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {qrCode && (
        <div className="text-center">
          <h4 className="text-md font-medium mb-2">QR Generado:</h4>
          <div className="bg-white p-2 rounded-lg inline-block border">
            <Image
              src={qrCode}
              alt="QR Code de prueba"
              width={200}
              height={200}
              className="rounded"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Longitud del código: {qrCode.length} caracteres
          </p>
        </div>
      )}
    </div>
  );
} 