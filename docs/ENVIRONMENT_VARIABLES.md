# Variables de Entorno

## Configuración Requerida

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Resend (para envío de emails)
```bash
RESEND_API_KEY=re_your_resend_api_key_here
```

### Next.js (opcional)
```bash
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Configuración de Resend

1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. En el dashboard, ve a "API Keys"
3. Crea una nueva API key
4. Copia la clave (empieza con `re_`)
5. Agrega la clave a tu archivo `.env.local`:
   ```bash
   RESEND_API_KEY=re_tu_clave_aqui
   ```

## Dominio de Email

Para que los emails se envíen correctamente, necesitas configurar un dominio verificado en Resend. Por defecto, el código usa:
- `no-reply@elescandalo.com`

Puedes cambiar esto en `src/app/api/send-invite/route.ts` línea 32.

## Notas

- El archivo `.env.local` no se sube a Git por seguridad
- En producción (Vercel), configura estas variables en el dashboard de Vercel
- La API key de Resend es necesaria para que funcione el envío de emails 