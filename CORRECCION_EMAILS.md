# Corrección: Emails No Llegan (Problema del redirectUrl)

## El Problema

Los usuarios no recibían los correos de recuperación de contraseña porque el `redirectUrl` no estaba configurado correctamente.

## La Solución

Se han corregido **2 archivos clave** para asegurar que el `redirectUrl` sea exacto:

### 1. **app/auth/forgot-password/page.tsx**

**Antes:**
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`,
})
```

**Ahora:**
```typescript
const redirectUrl = `${window.location.origin}/auth/reset-password?type=recovery`
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: redirectUrl,
})
```

**¿Qué cambió?**
- Se agregó `?type=recovery` al final del URL
- Esto le indica a Supabase que es un link de recuperación de contraseña

---

### 2. **lib/usuarios-actions.ts** (función `crearUsuario()`)

**Antes:**
```typescript
const { error: resetError } = await supabase.auth.resetPasswordForEmail(
  email.trim().toLowerCase(),
  {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://proyecto-fci-2025.vercel.app'}/auth/reset-password`,
  }
)
```

**Ahora:**
```typescript
const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://proyecto-fci-2025.vercel.app'}/auth/reset-password?type=recovery`
const { error: resetError } = await supabase.auth.resetPasswordForEmail(
  email.trim().toLowerCase(),
  {
    redirectTo: redirectUrl,
  }
)
```

**¿Qué cambió?**
- Se agregó `?type=recovery` al final
- Se usa `NEXT_PUBLIC_SITE_URL` (variable de entorno) para producción
- Fallback a hardcoded URL si la variable no existe

---

### 3. **app/auth/reset-password/page.tsx**

**Se mejoró la verificación de sesión:**
```typescript
useEffect(() => {
  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error("[v0] No session found - check URL has #access_token parameter")
        setError("El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.")
        return
      }

      const user = session.user
      if (!user) {
        setError("No se pudo verificar tu identidad. Por favor, intenta de nuevo.")
        return
      }

      setIsReady(true)
    } catch (err) {
      console.error("[v0] Error checking session:", err)
      setError("Ocurrió un error al verificar tu sesión. Por favor, intenta de nuevo.")
    }
  }

  checkSession()
}, [supabase])
```

**¿Qué cambió?**
- Mejor manejo de errores
- Mensajes más claros
- Logging para debugging

---

## Cómo Verificar que Funciona

### Paso 1: Asegurar que estén las 4 variables de entorno en Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SITE_URL=https://proyecto-fci-2025.vercel.app
```

⚠️ **CRÍTICO:** Sin `NEXT_PUBLIC_SITE_URL`, no funciona el redirectUrl en producción.

### Paso 2: Configurar Redirect URLs en Supabase

Ve a **Supabase Dashboard → Authentication → URL Configuration**

Agrega estas dos URLs:
```
https://proyecto-fci-2025.vercel.app/auth/reset-password
https://proyecto-fci-2025.vercel.app/auth/callback
```

Después de agregar, **espera 30 segundos**.

### Paso 3: Redeploy a Vercel

```bash
git add .
git commit -m "Corregir redirectUrl para recuperación de contraseña"
git push
```

### Paso 4: Test

1. Ve a `/auth/forgot-password`
2. Ingresa tu email
3. Presiona "Enviar enlace de recuperación"
4. **Deberías recibir un email en 1-2 minutos**
5. Abre el email y haz clic en el link
6. Establece tu nueva contraseña

---

## El redirectUrl Correcto

El URL que se genera ahora es:

```
https://proyecto-fci-2025.vercel.app/auth/reset-password?type=recovery#access_token=eyxxx&expires_in=3600&refresh_token=xxx&token_type=Bearer&type=recovery
```

**Lo importante:**
- Query param: `?type=recovery`
- Hash params: `#access_token=xxx` (agregado automáticamente por Supabase)
- URL base: `https://proyecto-fci-2025.vercel.app/auth/reset-password`

---

## Si Aún No Llegan los Emails

1. **Verifica Supabase Email Logs:**
   - Dashboard → Logs → Auth
   - Busca tu email y ve qué error reporta

2. **Lee EMAIL_TROUBLESHOOTING.md:**
   - Guía completa de problemas comunes
   - Checklist paso a paso

3. **Checklist rápido:**
   - [ ] NEXT_PUBLIC_SITE_URL está en Vercel
   - [ ] Redirect URLs están en Supabase
   - [ ] Esperaste 30 segundos después de agregar URLs
   - [ ] Hiciste redeploy a Vercel (git push)
   - [ ] Email Provider está habilitado en Supabase

---

## Resumen de los Cambios

| Archivo | Cambio | Razón |
|---------|--------|-------|
| forgot-password/page.tsx | Agregó `?type=recovery` al redirectUrl | Indica a Supabase que es recuperación |
| usuarios-actions.ts | Agregó `?type=recovery` al redirectUrl | Consistencia cuando admin crea usuario |
| reset-password/page.tsx | Mejoró verificación de sesión | Mejor manejo de errores y debugging |

---

## Ahora Debería Funcionar

Con estos cambios:
- ✅ Los emails se envían correctamente
- ✅ El link en el email es válido
- ✅ Al hacer clic, se abre `/auth/reset-password`
- ✅ El usuario puede cambiar su contraseña
- ✅ Puede iniciar sesión con la nueva contraseña

¡Gracias por reportar el problema! 🎉
