# Guía: Corrigiendo Problemas con Correos de Recuperación

## ¿Por qué no llegan los correos?

Si los usuarios no reciben los correos de recuperación de contraseña, aquí están las causas más comunes y cómo verificarlas.

---

## 1. Verificar la Configuración de Redirect URLs

### ¿Qué es?
Supabase necesita saber a dónde redirigir al usuario cuando abre el enlace del email.

### ¿Cómo verificar?

1. Ve a **Supabase Dashboard → Your Project**
2. Ve a **Authentication → URL Configuration**
3. Bajo **Redirect URLs**, verifica que existan:

```
https://proyecto-fci-2025.vercel.app/auth/reset-password
https://proyecto-fci-2025.vercel.app/auth/callback
```

### ¿Qué tiene que ver con los emails?
- Si la URL no está configurada, Supabase **rechaza enviar emails de recuperación**
- El error puede no ser visible, solo no llega el correo

### Solución:
Agrega ambas URLs si no existen. Después de agregar, **espera 30 segundos**.

---

## 2. Verificar Variables de Entorno

### Necesitas estas 4 variables en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx
NEXT_PUBLIC_SITE_URL=https://proyecto-fci-2025.vercel.app
```

### ¿Cómo verificar?

1. Ve a Vercel → **Tu Proyecto → Settings**
2. Ve a **Environment Variables**
3. Verifica que todas 4 están presentes

### ¿Qué hace cada una?

- `NEXT_PUBLIC_SITE_URL`: Se usa en el `redirectUrl` del email
  - Si falta, usa la URL hardcodeada que puede ser incorrecta
  - **Esto es CRÍTICO para que funcione el link del email**

### Solución:
```bash
# En desarrollo local, agrega a .env.local:
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# En Vercel, agrega:
NEXT_PUBLIC_SITE_URL=https://proyecto-fci-2025.vercel.app
```

---

## 3. Verificar Email Provider en Supabase

### ¿Dónde?

Supabase Dashboard → **Authentication → Email Templates**

### Verifica que:

✓ Email Provider está **Enable** (no Disabled)
✓ Ves las templates para:
  - Confirm signup
  - Invite user
  - Magic Link
  - Recovery
  - Change email

### Si no ves las templates:

1. Haz clic en **"Reset to default"** para cada una
2. Espera 30 segundos
3. Intenta enviar un email de recuperación

### Solución:
Si Email Provider dice "Disabled", click en **"Enable Supabase Auth Email"**

---

## 4. Verificar Email Logs en Supabase

### ¿Dónde?

Supabase Dashboard → **Logs → Auth**

### Qué buscar:

Busca logs que contengan:
- `resetPasswordForEmail`
- `recovery`
- El email del usuario

### Ejemplo de log exitoso:
```
2024-06-13 10:30:45 - resetPasswordForEmail called for maria@ejemplo.com - SUCCESS
Email sent to maria@ejemplo.com with recovery link
```

### Ejemplo de log con error:
```
2024-06-13 10:30:45 - resetPasswordForEmail failed for maria@ejemplo.com
Error: Redirect URL not configured
```

### Solución:
Si ves error **"Redirect URL not configured"** → Ve al paso 1 (Redirect URLs)

---

## 5. Verificar Redirección Correcta del Email Link

### El URL correcto debe tener:

```
https://proyecto-fci-2025.vercel.app/auth/reset-password?type=recovery#access_token=xxxxx&expires_in=3600&refresh_token=xxxxx&token_type=Bearer&type=recovery
```

### Lo IMPORTANTE:

- `type=recovery` ← Se añade automáticamente por Supabase
- `#access_token=xxxxx` ← Supabase lo añade al link del email
- `type=recovery` ← Aparece 2 veces (en query y en hash)

### Si el link está mal:

Verifica en **EMAIL_LOGS** de Supabase que el link tenga el formato correto.

---

## 6. Testing: Verificar Paso a Paso

### Paso 1: Probar resetPasswordForEmail

En `/auth/forgot-password`, ingresa tu email y presiona "Enviar enlace"

Verifica:
✓ Ves mensaje "Correo enviado"
✓ El email llega a tu bandeja (o spam)

### Paso 2: Verificar el Email

Cuando recibas el email:
✓ El link comienza con `https://proyecto-fci-2025.vercel.app`
✓ El link tiene parámetros `type=recovery` y `access_token`
✓ El link es clickeable

### Paso 3: Abre el Link

Al hacer clic:
✓ Te redirige a `/auth/reset-password`
✓ VES un formulario para cambiar contraseña
✓ NO ves error "El enlace no es válido"

### Paso 4: Cambiar Contraseña

En el formulario:
✓ Ingresas nueva contraseña (mín 8 caracteres)
✓ Confirmas contraseña
✓ Presionas "Actualizar contraseña"
✓ Ves mensaje "Contraseña actualizada"
✓ Te redirige a login automáticamente

### Paso 5: Probar Login

✓ Usas tu email y nueva contraseña
✓ Ingresas a la plataforma correctamente

---

## 7. Checklist para Admin: Crear Nuevo Usuario

### Paso 1: Crear usuario
- Ve a `/configuracion → Gestión de usuarios`
- Presiona "+ Nuevo usuario"
- Completa: Nombre, Email, Rol
- Presiona "Crear usuario"

### Paso 2: Verificar mensaje
- Ves: "✅ Usuario creado exitosamente"
- Ves: "Se ha enviado un correo a [email]..."

### Paso 3: Verificar email
- Usuario recibe email (verificar spam)
- Email tiene link clickeable
- Link comienza con `https://proyecto-fci-2025.vercel.app/auth/reset-password`

### Paso 4: Usuario establece contraseña
- Usuario abre link
- Ve formulario para contraseña
- Establece contraseña y confirma
- Ves "Contraseña actualizada"

### Paso 5: Usuario puede iniciar sesión
- Usuario usa email + nueva contraseña
- Ingresa a la plataforma

---

## 8. Problemas Comunes y Soluciones

### ❌ "El enlace no es válido o ha expirado"

**Causa probable:** Redirect URL no configurada en Supabase

**Solución:**
1. Ve a Supabase → Authentication → URL Configuration
2. Agrega: `https://proyecto-fci-2025.vercel.app/auth/reset-password`
3. Espera 30 segundos
4. Intenta de nuevo

---

### ❌ No llega ningún email

**Causa probable:** Email Provider deshabilitado

**Solución:**
1. Ve a Supabase → Authentication → Email Templates
2. Verifica que Email Provider está **Enable**
3. Si dice Disabled, haz clic en "Enable Supabase Auth Email"
4. Espera 1 minuto
5. Intenta de nuevo

---

### ❌ Email llega pero el link no funciona

**Causa probable:** NEXT_PUBLIC_SITE_URL incorrecta

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica: `NEXT_PUBLIC_SITE_URL=https://proyecto-fci-2025.vercel.app`
3. Si está mal, corrígela
4. **Redeploy** el proyecto (git push)
5. Intenta de nuevo

---

### ❌ Email llega, link funciona, pero dice "sesión no válida"

**Causa probable:** Token expirado (> 24 horas)

**Solución:**
- Los links expiran en 24 horas
- Solicita uno nuevo en `/auth/forgot-password`

---

### ❌ "NEXT_PUBLIC_SUPABASE_URL" no está definido

**Causa probable:** Variable de entorno faltante

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Agrega: `NEXT_PUBLIC_SUPABASE_URL=https://tu-project.supabase.co`
3. Redeploy (git push)

---

## 9. Verificar Logs en Desarrollo Local

Si estás desarrollando localmente, abre DevTools (F12):

### Console Tab:
Busca mensajes tipo:
```
[v0] Sending password reset to: maria@ejemplo.com
[v0] Success! Check email
```

### Network Tab:
1. Presiona "Enviar enlace de recuperación"
2. Busca request POST a Supabase
3. Verifica Response:
   ```json
   {
     "message": "email sent successfully"
   }
   ```

---

## 10. Soporte de Supabase

Si nada funciona, puedes:

1. **Verificar Email Logs en Supabase:**
   - Dashboard → Logs → Auth
   - Busca tu email para ver qué error reporta

2. **Contactar Supabase Support:**
   - Dashboard → Help & Support
   - Supabase es muy rápido respondiendo

3. **Verificar documentación oficial:**
   - https://supabase.com/docs/guides/auth/passwords

---

## Resumen: 6 Pasos para Arreglarlo

1. ✓ Agrega Redirect URLs en Supabase
2. ✓ Agrega NEXT_PUBLIC_SITE_URL a Vercel
3. ✓ Verifica Email Provider está Enable
4. ✓ Redeploy el proyecto
5. ✓ Prueba enviando un email
6. ✓ Verifica Email Logs en Supabase si falla

Si sigues estos pasos, ¡los emails deberían funcionar! 🎉
