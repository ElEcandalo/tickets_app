'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        false
      );

      scanner.render(
        (decodedText) => {
          console.log('🔍 QR escaneado:', decodedText);
          onScan(decodedText);
          // Opcional: detener el escáner después del primer escaneo
          // scanner.clear();
        },
        (errorMessage) => {
          console.log('⚠️ Error de escaneo:', errorMessage);
          // No mostrar errores menores como "No QR code found"
          if (!errorMessage.includes('No QR code found')) {
            setError(errorMessage);
            onError?.(errorMessage);
          }
        }
      );

      scannerRef.current = scanner;
      setIsScanning(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      }
    };
  }, [onScan, onError]);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const startScanner = () => {
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        false
      );

      scanner.render(
        (decodedText) => {
          console.log('🔍 QR escaneado:', decodedText);
          onScan(decodedText);
        },
        (errorMessage) => {
          console.log('⚠️ Error de escaneo:', errorMessage);
          if (!errorMessage.includes('No QR code found')) {
            setError(errorMessage);
            onError?.(errorMessage);
          }
        }
      );

      scannerRef.current = scanner;
      setIsScanning(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📱 Escáner QR</h3>
        <div className="flex space-x-2">
          {isScanning ? (
            <button
              onClick={stopScanner}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Detener
            </button>
          ) : (
            <button
              onClick={startScanner}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            >
              Iniciar
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-4">
        <div id="qr-reader" className="w-full max-w-md mx-auto"></div>
      </div>

      <div className="text-center text-sm text-gray-600">
        <p>📱 Apunta la cámara hacia el código QR del ticket</p>
        <p>💡 Asegúrate de que el QR esté bien iluminado</p>
      </div>
    </div>
  );
} 