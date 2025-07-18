// Script para probar el rendimiento de la generación de QR codes
const QRCode = require('qrcode');

async function testQRGeneration() {
  console.log('🧪 Probando rendimiento de generación de QR codes...\n');

  const testCases = [1, 5, 10, 20, 50];
  
  for (const count of testCases) {
    console.log(`📊 Generando ${count} QR codes...`);
    
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < count; i++) {
      const ticketId = `test-ticket-${i}-${Date.now()}`;
      const qrData = JSON.stringify({
        ticketId,
        timestamp: Date.now(),
        type: 'theater-ticket'
      });
      
      promises.push(
        QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'L',
          type: 'image/png',
          margin: 1,
          width: 200,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      );
    }
    
    try {
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ ${count} QR codes generados en ${duration}ms`);
      console.log(`   Promedio: ${(duration / count).toFixed(2)}ms por QR`);
      console.log(`   Tamaño promedio: ${(results[0].length / 1024).toFixed(2)}KB por QR\n`);
      
    } catch (error) {
      console.error(`❌ Error generando ${count} QR codes:`, error.message);
    }
  }
  
  console.log('🏁 Prueba completada');
}

// Función para probar cache
async function testCache() {
  console.log('\n🧪 Probando sistema de cache...\n');
  
  const cache = new Map();
  const ticketId = 'test-ticket-cache';
  
  // Primera generación (sin cache)
  console.log('📊 Primera generación (sin cache)...');
  const startTime1 = Date.now();
  const qrData = JSON.stringify({
    ticketId,
    timestamp: Date.now(),
    type: 'theater-ticket'
  });
  
  const qrCode = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'L',
    type: 'image/png',
    margin: 1,
    width: 200,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  cache.set(ticketId, qrCode);
  const endTime1 = Date.now();
  console.log(`✅ Generado en ${endTime1 - startTime1}ms`);
  
  // Segunda generación (con cache)
  console.log('📊 Segunda generación (con cache)...');
  const startTime2 = Date.now();
  const cachedQR = cache.get(ticketId);
  const endTime2 = Date.now();
  console.log(`✅ Recuperado del cache en ${endTime2 - startTime2}ms`);
  
  console.log(`🚀 Mejora de rendimiento: ${((endTime1 - startTime1) / (endTime2 - startTime2)).toFixed(0)}x más rápido\n`);
}

// Función para probar diferentes configuraciones
async function testConfigurations() {
  console.log('\n🧪 Probando diferentes configuraciones...\n');
  
  const configs = [
    { name: 'Alta calidad', errorCorrectionLevel: 'H', width: 300 },
    { name: 'Calidad media', errorCorrectionLevel: 'M', width: 250 },
    { name: 'Baja calidad', errorCorrectionLevel: 'L', width: 200 },
    { name: 'Muy baja calidad', errorCorrectionLevel: 'L', width: 150 }
  ];
  
  for (const config of configs) {
    console.log(`📊 Probando: ${config.name}`);
    const startTime = Date.now();
    
    const qrData = JSON.stringify({
      ticketId: 'test-config',
      timestamp: Date.now(),
      type: 'theater-ticket'
    });
    
    const qrCode = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: config.errorCorrectionLevel,
      type: 'image/png',
      margin: 1,
      width: config.width,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    const endTime = Date.now();
    const sizeKB = (qrCode.length / 1024).toFixed(2);
    
    console.log(`✅ Generado en ${endTime - startTime}ms, tamaño: ${sizeKB}KB\n`);
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  try {
    await testQRGeneration();
    await testCache();
    await testConfigurations();
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testQRGeneration,
  testCache,
  testConfigurations
}; 