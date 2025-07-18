// Script para debuggear la generación de tickets
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (reemplazar con tus credenciales)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTickets() {
  console.log('🔍 Debuggeando sistema de tickets...\n');

  try {
    // 1. Verificar funciones activas
    console.log('1. Verificando funciones activas...');
    const { data: funciones, error: funcionesError } = await supabase
      .from('funciones')
      .select('id, nombre, fecha, estado')
      .eq('estado', 'ACTIVA')
      .limit(5);

    if (funcionesError) {
      console.error('❌ Error obteniendo funciones:', funcionesError);
      return;
    }

    console.log(`✅ Funciones activas encontradas: ${funciones.length}`);
    if (funciones.length > 0) {
      console.log('   Primera función:', funciones[0]);
    }

    // 2. Verificar invitados recientes
    console.log('\n2. Verificando invitados recientes...');
    const { data: invitados, error: invitadosError } = await supabase
      .from('invitados')
      .select('id, nombre, email, funcion_id, cantidad_tickets, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (invitadosError) {
      console.error('❌ Error obteniendo invitados:', invitadosError);
      return;
    }

    console.log(`✅ Invitados recientes encontrados: ${invitados.length}`);
    if (invitados.length > 0) {
      console.log('   Invitado más reciente:', invitados[0]);
    }

    // 3. Verificar tickets existentes
    console.log('\n3. Verificando tickets existentes...');
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, invitado_id, funcion_id, usado, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (ticketsError) {
      console.error('❌ Error obteniendo tickets:', ticketsError);
      return;
    }

    console.log(`✅ Tickets encontrados: ${tickets.length}`);
    if (tickets.length > 0) {
      console.log('   Ticket más reciente:', tickets[0]);
    }

    // 4. Verificar políticas RLS
    console.log('\n4. Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'tickets' });

    if (policiesError) {
      console.log('⚠️ No se pudieron obtener políticas (normal si no tienes permisos)');
    } else {
      console.log(`✅ Políticas encontradas: ${policies.length}`);
    }

    // 5. Crear un invitado de prueba si no hay funciones
    if (funciones.length === 0) {
      console.log('\n⚠️ No hay funciones activas. Creando una función de prueba...');
      
      const { data: obra, error: obraError } = await supabase
        .from('obras')
        .select('id')
        .limit(1)
        .single();

      if (obraError) {
        console.error('❌ Error obteniendo obra:', obraError);
        return;
      }

      const { data: nuevaFuncion, error: funcionError } = await supabase
        .from('funciones')
        .insert([{
          obra_id: obra.id,
          nombre: 'Función de Prueba',
          fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora
          capacidad_total: 100,
          precio_entrada: 50,
          estado: 'ACTIVA'
        }])
        .select()
        .single();

      if (funcionError) {
        console.error('❌ Error creando función de prueba:', funcionError);
        return;
      }

      console.log('✅ Función de prueba creada:', nuevaFuncion);
    }

    // 6. Crear un invitado de prueba
    console.log('\n5. Creando invitado de prueba...');
    const funcionId = funciones.length > 0 ? funciones[0].id : null;
    
    if (!funcionId) {
      console.error('❌ No hay función disponible para crear invitado de prueba');
      return;
    }

    const { data: nuevoInvitado, error: invitadoError } = await supabase
      .from('invitados')
      .insert([{
        funcion_id: funcionId,
        nombre: 'Invitado de Prueba',
        email: 'test@example.com',
        telefono: '+1234567890',
        cantidad_tickets: 2
      }])
      .select()
      .single();

    if (invitadoError) {
      console.error('❌ Error creando invitado de prueba:', invitadoError);
      return;
    }

    console.log('✅ Invitado de prueba creado:', nuevoInvitado);

    // 7. Verificar si se generaron tickets automáticamente
    console.log('\n6. Verificando tickets generados...');
    const { data: ticketsGenerados, error: ticketsGenError } = await supabase
      .from('tickets')
      .select('id, invitado_id, funcion_id, usado, created_at')
      .eq('invitado_id', nuevoInvitado.id);

    if (ticketsGenError) {
      console.error('❌ Error verificando tickets generados:', ticketsGenError);
      return;
    }

    console.log(`✅ Tickets generados para el invitado: ${ticketsGenerados.length}`);
    if (ticketsGenerados.length > 0) {
      console.log('   Tickets:', ticketsGenerados);
    } else {
      console.log('⚠️ No se generaron tickets automáticamente');
    }

    // 8. Limpiar datos de prueba
    console.log('\n7. Limpiando datos de prueba...');
    await supabase.from('tickets').delete().eq('invitado_id', nuevoInvitado.id);
    await supabase.from('invitados').delete().eq('id', nuevoInvitado.id);
    console.log('✅ Datos de prueba eliminados');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el debug
debugTickets().then(() => {
  console.log('\n🏁 Debug completado');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
}); 