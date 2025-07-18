// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

async function testEmailAPI() {
  console.log('🧪 Probando API de envío de emails...\n');

  try {
    // Datos de prueba para el email
    const emailData = {
      to: 'elescandalo.info@gmail.com',
      nombreInvitado: 'Usuario de Prueba',
      obra: 'Obra de Prueba - Email Integration',
      fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      lugar: 'Teatro de Prueba',
      qrCodes: [
        {
          imageUrl: null,
          link: 'https://tickets-app-git-main-elecandalos-projects.vercel.app/ticket/test-1'
        },
        {
          imageUrl: null,
          link: 'https://tickets-app-git-main-elecandalos-projects.vercel.app/ticket/test-2'
        }
      ]
    };

    console.log('📧 Enviando email de prueba...');
    console.log('📋 Datos del email:');
    console.log('- Para:', emailData.to);
    console.log('- Nombre:', emailData.nombreInvitado);
    console.log('- Obra:', emailData.obra);
    console.log('- Fecha:', emailData.fecha);
    console.log('- Lugar:', emailData.lugar);
    console.log('- QR Codes:', emailData.qrCodes.length);

    const response = await fetch('http://localhost:3001/api/send-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error enviando email:', result.error);
      console.log('🔍 Detalles del error:');
      console.log('- Status:', response.status);
      console.log('- Status Text:', response.statusText);
      console.log('- Response:', JSON.stringify(result, null, 2));
      return;
    }

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 Revisa tu bandeja de entrada (y spam) en:', emailData.to);
    console.log('📋 Respuesta del servidor:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.log('🔍 Detalles del error:');
    console.log('- Mensaje:', error.message);
    console.log('- Stack:', error.stack);
  }
}

// Ejecutar la prueba
testEmailAPI(); 