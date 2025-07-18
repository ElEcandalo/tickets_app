# Configuración de Prisma con Supabase

Este documento explica cómo configurar Prisma ORM para trabajar con Supabase en el proyecto de gestión de teatro.

## 🚀 Configuración Inicial

### 1. Instalar dependencias
```bash
npm install prisma @prisma/client
```

### 2. Configurar Prisma con Supabase
```bash
npm run db:setup
```

Este comando:
- Genera la URL de conexión de Supabase
- Crea el archivo `.env` con `DATABASE_URL`
- Crea la migración inicial

### 3. Configurar la contraseña de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings > Database**
4. Copia la contraseña de la base de datos
5. Reemplaza `[YOUR-PASSWORD]` en el archivo `.env` con tu contraseña real

### 4. Aplicar el esquema a la base de datos
```bash
npm run db:push
```

### 5. Generar el cliente de Prisma
```bash
npm run db:generate
```

## 📋 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run db:setup` | Configuración inicial de Prisma con Supabase |
| `npm run db:push` | Aplica el esquema a la base de datos |
| `npm run db:generate` | Genera el cliente de Prisma |
| `npm run db:migrate` | Ejecuta migraciones de desarrollo |
| `npm run db:studio` | Abre Prisma Studio (interfaz visual) |
| `npm run db:reset` | Resetea la base de datos |

## 🗄️ Esquema de Base de Datos

### Modelos principales:

- **UserProfile**: Perfiles de usuario con roles (admin/colaborador)
- **Obra**: Obras de teatro
- **Funcion**: Funciones específicas de una obra
- **Colaborador**: Colaboradores del teatro
- **Invitado**: Invitados a funciones específicas
- **Ticket**: Tickets con códigos QR

### Relaciones:
- Una obra puede tener múltiples funciones
- Una función puede tener múltiples invitados
- Un invitado puede tener múltiples tickets
- Los colaboradores pueden invitar a múltiples invitados

## 🔧 Migraciones

### Crear una nueva migración:
```bash
npx prisma migrate dev --name nombre_de_la_migracion
```

### Aplicar migraciones en producción:
```bash
npx prisma migrate deploy
```

## 🎯 Uso en el Código

### Importar el cliente:
```typescript
import { prisma } from '@/lib/prisma';
```

### Ejemplo de consulta:
```typescript
// Obtener todas las funciones con sus obras
const funciones = await prisma.funcion.findMany({
  include: {
    obra: true,
    author: true
  }
});
```

### Ejemplo de creación:
```typescript
// Crear una nueva obra
const obra = await prisma.obra.create({
  data: {
    nombre: 'Romeo y Julieta',
    descripcion: 'Tragedia de Shakespeare',
    created_by: userId
  }
});
```

## 🔒 Seguridad

- Las políticas RLS (Row Level Security) de Supabase se mantienen
- Prisma no interfiere con las políticas de seguridad
- Todas las consultas pasan por las políticas RLS configuradas

## 🐛 Solución de Problemas

### Error de conexión:
1. Verifica que la contraseña en `.env` sea correcta
2. Asegúrate de que la URL de Supabase sea válida
3. Verifica que el proyecto de Supabase esté activo

### Error de migración:
1. Ejecuta `npm run db:reset` para resetear la base de datos
2. Verifica que no haya conflictos en el esquema
3. Revisa los logs de error en la consola

### Error de tipos:
1. Ejecuta `npm run db:generate` para regenerar los tipos
2. Reinicia el servidor de desarrollo
3. Verifica que el esquema esté sincronizado

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Prisma con Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Prisma Studio](https://www.prisma.io/docs/concepts/tools/prisma-studio) 