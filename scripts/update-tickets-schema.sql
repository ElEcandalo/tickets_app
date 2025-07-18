-- Script para actualizar la estructura de la tabla tickets
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura actual
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tickets' 
ORDER BY ordinal_position;

-- 2. Agregar columnas para validación si no existen
DO $$ 
BEGIN
    -- Agregar columna validated_at si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'validated_at'
    ) THEN
        ALTER TABLE tickets ADD COLUMN validated_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Columna validated_at agregada';
    END IF;

    -- Agregar columna validated_by si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'validated_by'
    ) THEN
        ALTER TABLE tickets ADD COLUMN validated_by TEXT;
        RAISE NOTICE 'Columna validated_by agregada';
    END IF;
END $$;

-- 3. Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'tickets';

-- 4. Crear índices para optimizar búsquedas si no existen
DO $$
BEGIN
    -- Índice en qr_code para búsquedas rápidas
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'tickets' AND indexname = 'idx_tickets_qr_code'
    ) THEN
        CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);
        RAISE NOTICE 'Índice idx_tickets_qr_code creado';
    END IF;

    -- Índice en invitado_id para búsquedas por invitado
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'tickets' AND indexname = 'idx_tickets_invitado_id'
    ) THEN
        CREATE INDEX idx_tickets_invitado_id ON tickets(invitado_id);
        RAISE NOTICE 'Índice idx_tickets_invitado_id creado';
    END IF;

    -- Índice en funcion_id para búsquedas por función
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'tickets' AND indexname = 'idx_tickets_funcion_id'
    ) THEN
        CREATE INDEX idx_tickets_funcion_id ON tickets(funcion_id);
        RAISE NOTICE 'Índice idx_tickets_funcion_id creado';
    END IF;

    -- Índice en usado para filtrar tickets disponibles
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'tickets' AND indexname = 'idx_tickets_usado'
    ) THEN
        CREATE INDEX idx_tickets_usado ON tickets(usado);
        RAISE NOTICE 'Índice idx_tickets_usado creado';
    END IF;
END $$;

-- 5. Verificar políticas RLS
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

-- 6. Crear políticas RLS si no existen
DO $$
BEGIN
    -- Política para permitir lectura de tickets
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' AND policyname = 'Enable read access for authenticated users'
    ) THEN
        CREATE POLICY "Enable read access for authenticated users" ON tickets
        FOR SELECT USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política de lectura creada';
    END IF;

    -- Política para permitir inserción de tickets
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' AND policyname = 'Enable insert for authenticated users'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users" ON tickets
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE 'Política de inserción creada';
    END IF;

    -- Política para permitir actualización de tickets
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tickets' AND policyname = 'Enable update for authenticated users'
    ) THEN
        CREATE POLICY "Enable update for authenticated users" ON tickets
        FOR UPDATE USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política de actualización creada';
    END IF;
END $$;

-- 7. Verificar estructura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tickets' 
ORDER BY ordinal_position;

-- 8. Mostrar estadísticas de tickets
SELECT 
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN usado = true THEN 1 END) as tickets_usados,
    COUNT(CASE WHEN usado = false THEN 1 END) as tickets_disponibles,
    COUNT(CASE WHEN validated_at IS NOT NULL THEN 1 END) as tickets_validados
FROM tickets; 