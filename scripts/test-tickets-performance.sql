-- Script para verificar el rendimiento de tickets
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de la tabla tickets
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tickets' 
ORDER BY ordinal_position;

-- 2. Verificar índices en la tabla tickets
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'tickets';

-- 3. Contar tickets por invitado (para identificar invitados con muchos tickets)
SELECT 
    i.nombre as invitado_nombre,
    i.email as invitado_email,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.usado = true THEN 1 END) as tickets_usados,
    COUNT(CASE WHEN t.usado = false THEN 1 END) as tickets_disponibles
FROM invitados i
LEFT JOIN tickets t ON i.id = t.invitado_id
GROUP BY i.id, i.nombre, i.email
ORDER BY total_tickets DESC
LIMIT 10;

-- 4. Verificar tickets de un invitado específico (reemplazar con el ID real)
-- SELECT 
--     t.id,
--     t.qr_code,
--     t.usado,
--     t.created_at,
--     f.nombre as funcion_nombre,
--     f.fecha as funcion_fecha
-- FROM tickets t
-- LEFT JOIN funciones f ON t.funcion_id = f.id
-- WHERE t.invitado_id = '8cd130c0-701b-4dc1-9ee7-b0e04fc97bc1'
-- ORDER BY t.created_at DESC;

-- 5. Verificar políticas RLS para tickets
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'tickets';

-- 6. Verificar tamaño de la tabla tickets
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename = 'tickets';

-- 7. Verificar estadísticas de uso de tickets
SELECT 
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN usado = true THEN 1 END) as tickets_usados,
    COUNT(CASE WHEN usado = false THEN 1 END) as tickets_disponibles,
    ROUND(
        (COUNT(CASE WHEN usado = true THEN 1 END)::decimal / COUNT(*)) * 100, 2
    ) as porcentaje_usados
FROM tickets;

-- 8. Verificar tickets recientes (últimos 7 días)
SELECT 
    DATE(created_at) as fecha_creacion,
    COUNT(*) as tickets_creados
FROM tickets 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY fecha_creacion DESC; 