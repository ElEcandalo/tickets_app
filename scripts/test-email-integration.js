// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailIntegration() {
  console.log('🧪 Iniciando prueba de integración de emails...\n');

  try {
    // 1. Obtener una función existente
    console.log('📋 Buscando función disponible...');
    const { data: funciones, error: funcionesError } = await supabase
      .from('funciones')
      .select('id, nombre, fecha, lugar, capacidad_total')
      .limit(1);

    let funcion;
    
    if (funcionesError || !funciones || funciones.length === 0) {
      console.log('📝 No se encontraron funciones. Creando función de prueba...');
      
      // Primero crear una obra
      console.log('📚 Creando obra de prueba...');
      const obraTest = {
        nombre: 'Obra de Prueba - Email Integration',
        descripcion: 'Obra de prueba para verificar integración de emails',
        created_by: '00000000-0000-0000-0000-000000000000' // UUID dummy para la prueba
      };

      const { data: obraCreada, error: obraCreateError } = await supabase
        .from('obras')
        .insert([obraTest])
        .select();

      if (obraCreateError) {
        console.error('❌ Error creando obra de prueba:', obraCreateError);
        return;
      }

      console.log(`✅ Obra de prueba creada: ${obraCreada[0].nombre}`);

      // Ahora crear la función
      const funcionTest = {
        obra_id: obraCreada[0].id,
        nombre: 'Función de Prueba - Email Integration',
        fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora
        ubicacion: 'Teatro de Prueba',
        capacidad_total: 100,
        precio_entrada: 1500,
        descripcion: 'Función de prueba para verificar integración de emails',
        estado: 'ACTIVA',
        created_by: '00000000-0000-0000-0000-000000000000' // UUID dummy para la prueba
      };

      const { data: funcionCreada, error: funcionCreateError } = await supabase
        .from('funciones')
        .insert([funcionTest])
        .select();

      if (funcionCreateError) {
        console.error('❌ Error creando función de prueba:', funcionCreateError);
        return;
      }

      funcion = funcionCreada[0];
      console.log(`✅ Función de prueba creada: ${funcion.nombre}`);
    } else {
      funcion = funciones[0];
    }
    console.log(`✅ Función encontrada: ${funcion.nombre} (${funcion.fecha})`);

    // 2. Crear invitado de prueba
    console.log('\n👤 Creando invitado de prueba...');
    const invitadoTest = {
      funcion_id: funcion.id,
      nombre: 'Usuario de Prueba',
      email: 'elescandalo.info@gmail.com', // Email real para recibir la prueba
      telefono: '+54 9 11 1234-5678',
      cantidad_tickets: 2,
      colaborador_id: null
    };

    const { data: invitadoCreado, error: invitadoError } = await supabase
      .from('invitados')
      .insert([invitadoTest])
      .select();

    if (invitadoError) {
      console.error('❌ Error creando invitado:', invitadoError);
      return;
    }

    console.log(`✅ Invitado creado: ${invitadoCreado[0].nombre} (ID: ${invitadoCreado[0].id})`);

    // 3. Generar tickets
    console.log('\n🎫 Generando tickets...');
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .insert([
        {
          invitado_id: invitadoCreado[0].id,
          funcion_id: funcion.id,
          estado: 'activo',
          qr_code: `TEST_QR_${Date.now()}_1`,
          qr_image_url: null,
          qr_link: `https://tickets-app-git-main-elecandalos-projects.vercel.app/ticket/${invitadoCreado[0].id}_1`
        },
        {
          invitado_id: invitadoCreado[0].id,
          funcion_id: funcion.id,
          estado: 'activo',
          qr_code: `TEST_QR_${Date.now()}_2`,
          qr_image_url: null,
          qr_link: `https://tickets-app-git-main-elecandalos-projects.vercel.app/ticket/${invitadoCreado[0].id}_2`
        }
      ])
      .select();

    if (ticketsError) {
      console.error('❌ Error generando tickets:', ticketsError);
      return;
    }

    console.log(`✅ Tickets generados: ${tickets.length} tickets`);

    // 4. Probar envío de email
    console.log('\n📧 Probando envío de email...');
    const emailData = {
      to: invitadoTest.email,
      nombreInvitado: invitadoTest.nombre,
      obra: funcion.nombre,
      fecha: new Date(funcion.fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      lugar: funcion.ubicacion,
      qrCodes: tickets.map((ticket, index) => ({
        imageUrl: ticket.qr_image_url || null,
        link: ticket.qr_link || `https://tickets-app-git-main-elecandalos-projects.vercel.app/ticket/${ticket.id}`
      }))
    };

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
      return;
    }

    console.log('✅ Email enviado exitosamente!');
    console.log('📧 Revisa tu bandeja de entrada (y spam)');

    // 5. Verificar mailing_list
    console.log('\n📋 Verificando mailing_list...');
    const { data: mailingEntry, error: mailingError } = await supabase
      .from('mailing_list')
      .select('*')
      .eq('email', invitadoTest.email)
      .single();

    if (mailingError) {
      console.log('⚠️ No se encontró entrada en mailing_list (puede ser normal si la tabla no existe)');
    } else {
      console.log('✅ Entrada encontrada en mailing_list:', mailingEntry);
    }

    // 6. Limpiar datos de prueba
    console.log('\n🧹 Limpiando datos de prueba...');
    await supabase.from('tickets').delete().eq('invitado_id', invitadoCreado[0].id);
    await supabase.from('invitados').delete().eq('id', invitadoCreado[0].id);
    console.log('✅ Datos de prueba eliminados');

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('\n📝 Resumen:');
    console.log('- ✅ Función encontrada');
    console.log('- ✅ Invitado creado');
    console.log('- ✅ Tickets generados');
    console.log('- ✅ Email enviado');
    console.log('- ✅ Datos limpiados');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }
}

// Ejecutar la prueba
testEmailIntegration(); 