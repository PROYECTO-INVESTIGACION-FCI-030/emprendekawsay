# Solución: Code Exchange para Reset Password

## El Problema

Cuando Supabase envía un email de recuperación de contraseña, redirige al usuario a:

```
https://proyecto-fci-2025.vercel.app/auth/reset-password?code=f788e25a-d886-4341-860d-93b57872d927&type=recovery
```

El código anterior intentaba usar `getSession()` que busca un token en el hash (`#access_token=xxx`), pero Supabase estaba enviando un `code` en el query parameter (`?code=xxx`).

## La Solución

Usar `exchangeCodeForSession()` para intercambiar el código por una sesión válida.

### Cambios Realizados

**Archivo: app/auth/reset-password/page.tsx**

Se cambió la lógica de verificación:

```typescript
// ANTES - ❌ No funcionaba
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  setError("El enlace no es válido...")
}

// DESPUÉS - ✅ Funciona
const code = searchParams.get('code')
const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
if (exchangeError) {
  setError("El enlace no es válido...")
}
```

### Flujo Completo

1. **Usuario recibe email** con link:
   ```
   https://proyecto-fci-2025.vercel.app/auth/reset-password?code=xxx&type=recovery
   ```

2. **Página lee el código** del query parameter:
   ```typescript
   const code = searchParams.get('code')
   ```

3. **Intercambia código por sesión**:
   ```typescript
   await supabase.auth.exchangeCodeForSession(code)
   ```

4. **Verifica que la sesión se creó**:
   ```typescript
   const { data: { session } } = await supabase.auth.getSession()
   ```

5. **Usuario ve el formulario** para cambiar contraseña

6. **Usuario actualiza contraseña**:
   ```typescript
   await supabase.auth.updateUser({ password })
   ```

7. **Redirige a login** automáticamente

## Por Qué Funciona Ahora

- `exchangeCodeForSession()` es el método correcto para Supabase email links
- El código contiene el token de recuperación de Supabase
- Una vez intercambiado, Supabase crea una sesión válida en el cliente
- Con la sesión, `updateUser()` puede cambiar la contraseña

## Testing

Prueba el flujo completo:

1. Ve a `/auth/forgot-password`
2. Ingresa tu email
3. Abre el email y haz clic en el link
4. Deberías ver el formulario para cambiar contraseña
5. Ingresa nueva contraseña y guarda
6. Redirige a login automáticamente

## Variables de Entorno Requeridas

En `.env.local` (desarrollo) o Vercel Settings (producción):

```
NEXT_PUBLIC_SUPABASE_URL=https://cpskpnpweafpbuvggfje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=https://proyecto-fci-2025.vercel.app
```

## Configuración Supabase

En Supabase → Authentication → URL Configuration

Redirect URLs:
```
https://proyecto-fci-2025.vercel.app/auth/reset-password
https://proyecto-fci-2025.vercel.app/auth/callback
```

Para desarrollo local:
```
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/callback
```
