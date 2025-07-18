-- =====================================================
-- EMPEZAR DESDE CERO - ELIMINAR TODO Y RECREAR
-- =====================================================

-- ELIMINACIÓN: Eliminar todas las tablas en orden correcto
SELECT '🧹 ELIMINANDO TODAS LAS TABLAS...' as info;

-- Eliminar tablas en orden de dependencias (hijos primero, padres después)
DROP TABLE IF EXISTS entradas CASCADE;
DROP TABLE IF EXISTS invitados CASCADE;
DROP TABLE IF EXISTS funcion_colaboradores CASCADE;
DROP TABLE IF EXISTS funciones CASCADE;
DROP TABLE IF EXISTS obras CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Eliminar tipos personalizados si existen
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "Estado" CASCADE;

-- Verificar que se eliminaron todas las tablas
SELECT '✅ Verificación: Tablas restantes' as info;

SELECT 
    'Tabla restante: ' || tablename
    as remaining_table
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- CREACIÓN: Crear tablas desde cero correctamente
SELECT '🔧 CREANDO TABLAS DESDE CERO...' as info;

-- Crear tabla de perfiles de usuario (correcta desde el inicio)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'colaborador')) NOT NULL DEFAULT 'colaborador',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de obras
CREATE TABLE obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de funciones
CREATE TABLE funciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    ubicacion TEXT NOT NULL DEFAULT 'El Escándalo',
    capacidad_total INTEGER NOT NULL,
    precio_entrada INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'CANCELADA', 'FINALIZADA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de colaboradores
CREATE TABLE colaboradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefono TEXT,
    rol TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de invitados
CREATE TABLE invitados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funcion_id UUID NOT NULL REFERENCES funciones(id) ON DELETE CASCADE,
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    cantidad_tickets INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funcion_id UUID NOT NULL REFERENCES funciones(id) ON DELETE CASCADE,
    invitado_id UUID NOT NULL REFERENCES invitados(id) ON DELETE CASCADE,
    qr_code TEXT NOT NULL UNIQUE,
    usado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_obras_nombre ON obras(nombre);
CREATE INDEX idx_funciones_obra_id ON funciones(obra_id);
CREATE INDEX idx_funciones_fecha ON funciones(fecha);
CREATE INDEX idx_funciones_estado ON funciones(estado);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_colaboradores_email ON colaboradores(email);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);

-- CONFIGURACIÓN RLS: Habilitar RLS en todas las tablas
SELECT '🔒 CONFIGURANDO RLS...' as info;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE funciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitados ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS: Crear políticas básicas
SELECT '🔒 CREANDO POLÍTICAS RLS...' as info;

-- Políticas para user_profiles
CREATE POLICY "user_profiles_insert_policy" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "user_profiles_select_all" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para obras
CREATE POLICY "obras_select_authenticated" ON obras
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "obras_insert_admin" ON obras
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "obras_update_admin" ON obras
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "obras_delete_admin" ON obras
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Políticas para funciones
CREATE POLICY "funciones_select_authenticated" ON funciones
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "funciones_insert_admin" ON funciones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "funciones_update_admin" ON funciones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "funciones_delete_admin" ON funciones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Políticas para colaboradores
CREATE POLICY "colaboradores_select_authenticated" ON colaboradores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "colaboradores_insert_admin" ON colaboradores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "colaboradores_update_admin" ON colaboradores
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "colaboradores_delete_admin" ON colaboradores
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Políticas para invitados
CREATE POLICY "invitados_select_authenticated" ON invitados
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "invitados_insert_admin" ON invitados
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "invitados_update_admin" ON invitados
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "invitados_delete_admin" ON invitados
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Políticas para tickets
CREATE POLICY "tickets_select_authenticated" ON tickets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tickets_insert_admin" ON tickets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "tickets_update_admin" ON tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "tickets_delete_admin" ON tickets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- FUNCIÓN RPC: Crear función para registro de usuarios
SELECT '🔧 CREANDO FUNCIÓN RPC...' as info;

CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT
)
RETURNS JSON AS $$
DECLARE
  is_first_user BOOLEAN;
  result JSON;
BEGIN
  -- Verificar si es el primer usuario
  SELECT COUNT(*) = 0 INTO is_first_user FROM user_profiles;
  
  -- Insertar el perfil de usuario
  INSERT INTO user_profiles (id, email, role)
  VALUES (
    user_id,
    user_email,
    CASE WHEN is_first_user THEN 'admin' ELSE 'colaborador' END
  );
  
  -- Preparar resultado
  result := json_build_object(
    'success', true,
    'user_id', user_id,
    'role', CASE WHEN is_first_user THEN 'admin' ELSE 'colaborador' END,
    'is_admin', is_first_user
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, retornar información del error
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT) TO anon;

-- TRIGGERS: Crear función y triggers para updated_at
SELECT '🔧 CREANDO TRIGGERS...' as info;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para todas las tablas
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON obras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funciones_updated_at BEFORE UPDATE ON funciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_colaboradores_updated_at BEFORE UPDATE ON colaboradores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitados_updated_at BEFORE UPDATE ON invitados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- VERIFICACIÓN FINAL
SELECT '✅ VERIFICACIÓN FINAL:' as info;

-- Verificar tablas creadas
SELECT 
    'Tabla creada: ' || tablename
    as created_table
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar políticas creadas
SELECT 
    'Políticas totales: ' || COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';

-- Verificar función RPC
SELECT 
    'Función RPC creada: ' || proname as rpc_function
FROM pg_proc 
WHERE proname = 'create_user_profile';

-- Verificar foreign key constraints
SELECT 
    'Foreign key: ' || tc.constraint_name || ' -> ' ||
    ccu.table_schema || '.' || ccu.table_name || '.' || ccu.column_name
    as foreign_key
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

SELECT '🎉 BASE DE DATOS CREADA DESDE CERO - Lista para usar' as final_status; 