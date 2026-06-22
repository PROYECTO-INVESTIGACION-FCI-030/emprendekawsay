# 🔧 Configuración Supabase para Recuperación de Contraseña

## Paso 1: Configurar Email Provider en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú izquierdo: **Authentication** → **Email Templates**
3. Verifica que:
   - ✅ Email Provider está habilitado
   - ✅ Si usas Supabase default (recomendado para desarrollo), está ok
   - ✅ Si usas proveedor personalizado (SendGrid, Mailgun, etc.), verifica credenciales

## Paso 2: Configurar Redirect URLs

Esto es **CRÍTICO** para que los enlaces de recuperación funcionen.

1. Ve a: **Authentication** → **URL Configuration**
2. En la sección "Redirect URLs", agrega estas URLs:

```
https://proyecto-fci-2025.vercel.app/auth/callback
https://proyecto-fci-2025.vercel.app/auth/reset-password
```

**Para desarrollo local, también agrega:**
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

3. Haz clic en **Save**

⚠️ **IMPORTANTE:**
- Sin estas URLs configuradas, Supabase **NO enviará emails de recuperación**
- Después de agregar, **espera 30 segundos** antes de probar
- Los emails se envían con esta estructura:
  ```
  https://proyecto-fci-2025.vercel.app/auth/reset-password?type=recovery#access_token=xxxxx
  ```
- Si no ves el email, primero verifica que estas URLs existan

## Paso 3: Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Settings → Environment Variables
3. Agrega estas variables:

```
NEXT_PUBLIC_SUPABASE_URL = tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = tu_anon_key
SUPABASE_SERVICE_ROLE_KEY = tu_service_role_key
NEXT_PUBLIC_SITE_URL = https://proyecto-fci-2025.vercel.app
```

**Cómo obtener las credenciales:**
- Ve a Supabase Dashboard → Project Settings → API Keys
- `Project URL` → NEXT_PUBLIC_SUPABASE_URL
- `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
- `service_role secret` → SUPABASE_SERVICE_ROLE_KEY

## Paso 4: Verificar Configuración en Desarrollo Local

1. Crea archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

2. Reinicia servidor: `pnpm dev`

3. Prueba en http://localhost:3000/auth/forgot-password

## Paso 5: Probar Recuperación de Contraseña

### En Desarrollo (localhost):

1. Abre http://localhost:3000/auth/login
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa tu correo
4. **En lugar de recibir email:**
   - Ve a Supabase Dashboard → Authentication → Users
   - Busca el usuario
   - Haz clic en los 3 puntos → Reset password (esto genera un link)
   - Copia el URL y pégalo en el navegador
   - O mejor aún, ve a Email Logs para ver si el email se envió

### En Producción (vercel.app):

1. Deploya a Vercel: `git push`
2. Ve a https://proyecto-fci-2025.vercel.app/auth/login
3. Haz clic en "¿Olvidaste tu contraseña?"
4. Ingresa tu correo real
5. Revisa tu bandeja de entrada (incluyendo SPAM)
6. Haz clic en el enlace
7. Establece tu nueva contraseña
8. Inicia sesión

## Paso 6: Probar Creación de Usuarios

1. Loguea como administrador
2. Ve a `/configuracion` → "Gestión de usuarios"
3. Haz clic en "+ Nuevo usuario"
4. Rellena:
   - Nombre completo: "María Pérez"
   - Email: "maria@ejemplo.com"
   - Rol: "Investigadora"
5. Haz clic en "Crear usuario"
6. Verifica:
   - Mensaje de éxito aparece
   - Usuario aparece en la tabla
   - Usuario recibe email (revisar SPAM)

## 🔍 Solución de Problemas

### "No recibo el email"

**Checklist:**
1. ✅ Verifica carpeta de SPAM
2. ✅ En Supabase, ve a Authentication → Email Logs
   - Si hay error, lee el mensaje
   - Si dice "bounced", verifica que el email existe
3. ✅ Verifica que NEXT_PUBLIC_SITE_URL está correcto
4. ✅ Verifica que Redirect URLs incluyen `/auth/reset-password`

**Si sigue sin funcionar:**
- En desarrollo: Ve a Supabase → Auth → Users
- Busca el usuario y usa "Reset password" (botón de 3 puntos)
- Esto genera un link que puedes usar para testear

### "El enlace expiró"

- Los enlaces expiran en 24 horas por defecto
- Solicita uno nuevo usando "¿Olvidaste tu contraseña?"

### "Mostró error de no autenticado en /auth/reset-password"

- El enlace probablemente expiró
- O los Redirect URLs no están configurados en Supabase
- Sigue Paso 2 nuevamente

### "TypeError: Cannot read property NEXT_PUBLIC_SUPABASE_URL"

- Falta variable de entorno en Vercel
- En Vercel → Settings → Environment Variables
- Agrega todas las variables del Paso 3
- Vuelve a deployar

## 📊 Testing Completo (Checklist)

- [ ] Login page muestra "¿Olvidaste tu contraseña?"
- [ ] Click en enlace va a /auth/forgot-password
- [ ] Ingresando email envía el correo (revisar Supabase Email Logs)
- [ ] Link en email funciona y abre /auth/reset-password
- [ ] Puedo establecer nueva contraseña
- [ ] Login con nueva contraseña funciona
- [ ] Admin puede crear usuario nuevo
- [ ] Nuevo usuario recibe email
- [ ] Nuevo usuario puede establecer contraseña
- [ ] Nuevo usuario puede iniciar sesión

## 📧 Email Personalización (Opcional)

Si quieres personalizar los emails:

1. Ve a Supabase → Authentication → Email Templates
2. Busca "Reset Password" o "Confirm Signup"
3. Haz clic en "Edit"
4. Personaliza el template
5. Variables disponibles:
   - `{{ .ConfirmationURL }}` - URL con token
   - `{{ .Email }}` - Email del usuario
   - `{{ .SiteURL }}` - Tu sitio

## 🎯 Resumen Rápido

| Tarea | Ubicación |
|-------|-----------|
| Configurar Redirect URLs | Supabase → Authentication → URL Configuration |
| Agregar variables de entorno | Vercel → Settings → Environment Variables |
| Test en desarrollo | http://localhost:3000/auth/forgot-password |
| Test en producción | https://proyecto-fci-2025.vercel.app/auth/forgot-password |
| Ver logs de email | Supabase → Email Logs |
| Reset manual de usuario | Supabase → Auth → Users → 3 dots → Reset password |

## 🔑 Entendiendo el Redirect URL para Recuperación de Contraseña

### ¿Qué es el redirectUrl?

El `redirectUrl` es la URL a donde Supabase redirige al usuario después de hacer clic en el link del email.

### Estructura del Link en el Email:

```
https://proyecto-fci-2025.vercel.app/auth/reset-password?type=recovery#access_token=xxx&expires_in=3600&token_type=Bearer&type=recovery
```

### Dónde se configura:

1. **En el código:**
   ```typescript
   // app/auth/forgot-password/page.tsx
   const redirectUrl = `${window.location.origin}/auth/reset-password?type=recovery`
   const { error } = await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: redirectUrl,
   })
   ```

2. **En Supabase (URL Configuration):**
   - Debes agregar: `https://proyecto-fci-2025.vercel.app/auth/reset-password`
   - El parámetro `?type=recovery` se añade automáticamente

3. **En Vercel (Environment Variables):**
   - `NEXT_PUBLIC_SITE_URL=https://proyecto-fci-2025.vercel.app`
   - Se usa en crearUsuario() para enviar el link correcto

### Checklist del Redirect URL:

- [ ] URL está en Supabase → Authentication → URL Configuration
- [ ] URL comienza con `https://` (en producción)
- [ ] URL es exactamente: `https://proyecto-fci-2025.vercel.app/auth/reset-password`
- [ ] No tiene trailing slash: `❌ /auth/reset-password/`
- [ ] La página /auth/reset-password existe en el código
- [ ] NEXT_PUBLIC_SITE_URL está en Vercel (sin URL al final)

### Troubleshooting:

**Si el email no llega:**
1. Verifica que redirectUrl existe en Supabase
2. Espera 30 segundos después de guardar
3. Ve a Email Logs y busca el error

**Si el link no funciona:**
1. Verifica que el URL es exacto (sin espacios, sin slash final)
2. Verifica que la página `/auth/reset-password` existe
3. Verifica que la página puede acceder a Supabase

---

## 📞 Soporte

Si algo no funciona:

1. Revisa **EMAIL_TROUBLESHOOTING.md** (guía completa de problemas con emails)

2. Revisa los logs:
   - Supabase → Email Logs (para errores de email)
   - Vercel → Logs (para errores de servidor)
   - Console del navegador (para errores de cliente)

3. Verifica las URLs:
   - Que estén exactamente como en Supabase
   - Sin trailing slash
   - Con https (en producción)

3. Prueba un usuario nuevo:
   - A veces hay datos caché
   - Crea un usuario con nuevo email para testear
