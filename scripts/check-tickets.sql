-- =====================================================
-- VERIFICAR ESTADO DE LA TABLA TICKETS
-- =====================================================

-- Verificar que la tabla existe
SELECT '🔍 Verificando tabla tickets...' as info;

SELECT 
    'Tabla tickets existe: ' || tablename
    as table_status
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'tickets';

-- Verificar estructura de la tabla
SELECT '📋 Estructura de la tabla tickets:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'tickets'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT '🔒 Políticas RLS para tickets:' as info;

SELECT 
    'Política: ' || policyname || ' - ' || cmd || ' - ' || permissive
    as policy_info
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'tickets';

-- Verificar si RLS está habilitado
SELECT '🔒 Estado RLS:' as info;

SELECT 
    'RLS habilitado: ' || CASE WHEN rowsecurity THEN 'SÍ' ELSE 'NO' END
    as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'tickets';

-- Verificar tickets existentes
SELECT '🎫 Tickets existentes:' as info;

SELECT 
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN usado = true THEN 1 END) as tickets_usados,
    COUNT(CASE WHEN usado = false THEN 1 END) as tickets_disponibles
FROM tickets;

-- Verificar últimos tickets creados
SELECT '📅 Últimos tickets creados:' as info;

SELECT 
    id,
    funcion_id,
    invitado_id,
    usado,
    created_at
FROM tickets 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar invitados con tickets
SELECT '👥 Invitados con tickets:' as info;

SELECT 
    i.nombre as invitado_nombre,
    i.email as invitado_email,
    COUNT(t.id) as cantidad_tickets
FROM invitados i
LEFT JOIN tickets t ON i.id = t.invitado_id
GROUP BY i.id, i.nombre, i.email
HAVING COUNT(t.id) > 0
ORDER BY COUNT(t.id) DESC;

SELECT '✅ Verificación completada' as final_status; 