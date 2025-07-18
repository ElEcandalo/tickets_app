-- =====================================================
-- CREAR PERFIL DE USUARIO ADMIN
-- =====================================================

-- Verificar usuarios existentes en auth.users
SELECT '🔍 Usuarios en auth.users:' as info;

SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at;

-- Verificar perfiles existentes en user_profiles
SELECT '🔍 Perfiles en user_profiles:' as info;

SELECT 
    id,
    email,
    role,
    created_at
FROM user_profiles
ORDER BY created_at;

-- Crear perfil para el primer usuario (será admin)
SELECT '🔧 Creando perfil admin...' as info;

-- Insertar perfil para el primer usuario encontrado
INSERT INTO user_profiles (id, email, role)
SELECT 
    id,
    email,
    'admin' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ORDER BY created_at
LIMIT 1;

-- Verificar que se creó el perfil
SELECT '✅ Verificación final:' as info;

SELECT 
    'Perfil creado: ' || id || ' - ' || email || ' (' || role || ')'
    as profile_info
FROM user_profiles
ORDER BY created_at;

-- Mostrar todos los perfiles
SELECT 
    id,
    email,
    role,
    created_at
FROM user_profiles
ORDER BY created_at;

SELECT '🎉 Perfil admin creado exitosamente' as final_status; 