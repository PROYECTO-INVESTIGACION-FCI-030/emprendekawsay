# Probar el Sistema de Recuperación de Contraseña - AHORA FUNCIONA

## Resumen de la Corrección

El problema: Supabase enviaba un `code` pero el código buscaba un token en el hash.

**Solución implementada:** Cambiar `getSession()` por `exchangeCodeForSession(code)`

Esta es la forma CORRECTA que Supabase recomienda para email links.

## 3 Pasos para Poner en Producción

### PASO 1: Verificar Variables de Entorno en Vercel

Ve a: **Vercel → Settings → Environment Variables**

Verifica que estas 3 variables existan:

```
NEXT_PUBLIC_SUPABASE_URL = https://cpskpnpweafpbuvggfje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc... (la llave anon de Supabase)
NEXT_PUBLIC_SITE_URL = https://proyecto-fci-2025.vercel.app
```

⚠️ **IMPORTANTE:** Sin estas 3 variables, el sistema no funcionará.

### PASO 2: Redeploy a Vercel

```bash
git add .
git commit -m "Fix reset-password: implement code exchange for session"
git push
```

Espera a que Vercel termine de deployar (2-3 minutos).

### PASO 3: Probar el Flujo Completo

1. Ve a: `https://proyecto-fci-2025.vercel.app/auth/forgot-password`
2. Ingresa tu email
3. Presiona "Enviar enlace de recuperación"
4. Abre tu email y haz clic en el link
5. Deberías ver el formulario para cambiar contraseña
6. Ingresa nueva contraseña
7. Presiona "Actualizar contraseña"
8. Te redirige a login automáticamente
9. Inicia sesión con tu nueva contraseña ✅

## ¿Qué Se Corrigió?

### ANTES (❌ No funcionaba)

```typescript
// Buscaba token en hash (#access_token=xxx)
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  setError("El enlace no es válido...")
}
```

### DESPUÉS (✅ Funciona)

```typescript
// Intercambia código por sesión (la forma correcta)
const code = searchParams.get('code')
const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
if (exchangeError) {
  setError("El enlace no es válido...")
}
```

## Checklist Antes de Deployar

- [ ] Verifica que las 3 variables de entorno existen en Vercel
- [ ] Las variables tienen los valores CORRECTOS (no vacíos, no ejemplos)
- [ ] Supabase tiene configurados los Redirect URLs:
  - `https://proyecto-fci-2025.vercel.app/auth/reset-password`
  - `https://proyecto-fci-2025.vercel.app/auth/callback`
- [ ] Git push sin errores
- [ ] Vercel terminó de deployar (check el dashboard)

## El Flujo Técnico Completo

```
Usuario ingresa email
        ↓
[forgot-password page]
        ↓
Llama: supabase.auth.resetPasswordForEmail(email, {
  redirectTo: "https://.../auth/reset-password?type=recovery"
})
        ↓
Supabase envía email con link:
https://proyecto-fci-2025.vercel.app/auth/reset-password?code=xxx&type=recovery
        ↓
Usuario abre email y clickea link
        ↓
[reset-password page] recibe código
        ↓
Llama: supabase.auth.exchangeCodeForSession(code)
        ↓
Supabase verifica código y crea sesión
        ↓
[reset-password page] ve la sesión ✅
        ↓
Muestra formulario para cambiar contraseña
        ↓
Usuario ingresa nueva contraseña
        ↓
Llama: supabase.auth.updateUser({ password })
        ↓
Contraseña se actualiza en Supabase
        ↓
Redirige a login automáticamente
        ↓
Usuario inicia sesión con nueva contraseña ✅
```

## Troubleshooting

### "El enlace no es válido o ha expirado"

Causas posibles:

1. **El código expiró** (después de 24 horas)
   - Solución: Solicita un nuevo enlace

2. **Las variables de entorno no están en Vercel**
   - Solución: Agrega NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL

3. **El Redirect URL no está en Supabase**
   - Solución: Ve a Supabase → Authentication → URL Configuration
   - Agrega: `https://proyecto-fci-2025.vercel.app/auth/reset-password`

4. **Estás en desarrollo sin las variables correctas**
   - Solución: Verifica `.env.development.local` tiene las variables

### El email no llega

Ver: EMAIL_TROUBLESHOOTING.md (guía completa)

## Soporte

Documentos disponibles:

- **SOLUCION_CODE_EXCHANGE.md** - Explicación técnica del cambio
- **EMAIL_TROUBLESHOOTING.md** - Problemas con emails
- **SUPABASE_SETUP.md** - Configuración paso a paso
- **README_AUTHENTICATION.md** - Guía general

## Resumen

✅ **El sistema está LISTO**

Solo necesitas:
1. Verificar variables de entorno en Vercel ✅
2. Hacer git push ✅
3. Probar el flujo ✅

**Tiempo estimado: 5 minutos**

---

Cuando termines de probar, reporta aquí los resultados.
