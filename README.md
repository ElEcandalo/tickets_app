# App de Gestión de Teatro - Contexto General

## Objetivo
Crear una aplicación interna para administrar funciones teatrales, venta de entradas y gestión de invitados, con control de acceso para diferentes tipos de usuarios.

---

## Usuarios

- **Administradores**
  - Pueden crear y modificar funciones (obras).
  - Venden entradas.
  - Gestionan datos completos.
  - Acceso total a todas las obras y datos.

- **Colaboradores**
  - Asignados a una o varias obras específicas.
  - Solo pueden gestionar invitados y funciones relacionadas con esas obras.
  - Envían mails a invitados y pueden escanear códigos QR en la puerta.

---

## Funcionalidades principales

1. **Gestión de funciones (obras)**
   - Crear, editar y listar funciones.
   - Cada función incluye datos como nombre, fecha, y ubicación.

2. **Venta de entradas**
   - Generar entradas con código QR único para cada invitado.
   - Control de stock y conteo de entradas vendidas por función.

3. **Gestión de invitados**
   - Registrar invitados vinculados a funciones.
   - Guardar datos de contacto.
   - Enviar entradas por correo electrónico usando la API de Resend.

4. **Escaneo de códigos QR**
   - Validar entradas en la puerta.
   - Marcar entradas como usadas para evitar duplicados.

5. **Control de permisos**
   - Roles definidos (admin y colaborador).
   - Acceso restringido según rol y función asignada.

6. **Base de datos**
   - Usar Supabase para almacenar funciones, entradas, usuarios y permisos.

---

## Tecnologías propuestas

- Frontend: Next.js (App Router, React)
- Backend & Base de datos: Supabase (PostgreSQL + Auth)
- Envío de mails: Resend API
- Generación y lectura de códigos QR: librerías especializadas

---

## Notas adicionales

- Aplicación interna, no pública.
- Enfocada en usabilidad para equipo de gestión y control en puerta.
- Diseño escalable para agregar futuros roles o funcionalidades.
