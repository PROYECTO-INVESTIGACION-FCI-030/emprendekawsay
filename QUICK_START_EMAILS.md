# ⚡ Quick Start: Hacer que Funcionen los Emails

## El Problema
No llegan los emails de recuperación de contraseña.

## La Solución (3 pasos, 5 minutos)

### Paso 1: Agregar Variables de Entorno (2 minutos)

Ve a **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**

Agrega esta variable si no existe:
```
NEXT_PUBLIC_SITE_URL = https://proyecto-fci-2025.vercel.app
```

**⚠️ ESTO ES CRÍTICO - Sin esto no funciona en producción**

Presiona "Save".

---

### Paso 2: Configurar Redirect URLs en Supabase (2 minutos)

Ve a **Supabase Dashboard → Authentication → URL Configuration**

En **"Redirect URLs"**, agrega:
```
https://proyecto-fci-2025.vercel.app/auth/reset-password
https://proyecto-fci-2025.vercel.app/auth/callback
```

Presiona el botón azul para guardar.

**Espera 30 segundos después de guardar.**

---

### Paso 3: Redeploy (1 minuto)

En tu terminal:
```bash
cd /vercel/share/v0-project
git add .
git commit -m "Fix email recovery links"
git push
```

Vercel hará redeploy automáticamente.

---

## Test

1. Espera a que Vercel termine de deployar (2-3 minutos)
2. Ve a https://proyecto-fci-2025.vercel.app/auth/forgot-password
3. Ingresa tu email
4. Presiona "Enviar enlace de recuperación"
5. Deberías recibir un email en 1-2 minutos

**Si el email no llega en 2 minutos:**
- Revisa carpeta Spam
- Lee EMAIL_TROUBLESHOOTING.md (soluciones detalladas)

---

## ¿Qué se Corrigió?

Se agregó `?type=recovery` a los URLs de recuperación para que Supabase los reconozca correctamente.

**Archivos cambiados:**
- ✅ app/auth/forgot-password/page.tsx
- ✅ lib/usuarios-actions.ts
- ✅ app/auth/reset-password/page.tsx

---

## Preguntas Frecuentes

### P: ¿Dónde verifico si el email se envió?
**R:** Supabase Dashboard → Logs → Auth (busca tu email)

### P: ¿Cuánto tiempo tarda en llegar el email?
**R:** 30 segundos - 2 minutos. Si pasan 5 minutos, algo está mal.

### P: ¿El email tiene un link clickeable?
**R:** Sí, Supabase lo genera automáticamente con el token.

### P: ¿Qué pasa si abro el link 2 horas después?
**R:** Expira en 24 horas, así que está ok.

### P: ¿El link abre `/auth/reset-password`?
**R:** Sí, automáticamente. Supabase redirige al URL que configuraste.

---

## Checklist Final

- [ ] Agregué `NEXT_PUBLIC_SITE_URL` a Vercel
- [ ] Configuré Redirect URLs en Supabase
- [ ] Esperé 30 segundos después de guardar
- [ ] Hice `git push` en Vercel
- [ ] Esperé a que Vercel terminara de deployar
- [ ] Probé `/auth/forgot-password` y recibí email
- [ ] Abrí el email y el link funcionó
- [ ] Estableci nueva contraseña y pude iniciar sesión

Si pasaste todos los checks, ¡los emails funcionan! 🎉

---

## Si Algo No Funciona

Leche **EMAIL_TROUBLESHOOTING.md** - tiene soluciones para:
- No llega ningún email
- El email llega pero el link no funciona
- El link funciona pero dice "sesión no válida"
- Y muchos otros problemas

---

## Contacto

Si necesitas más ayuda:
1. Revisa los logs en Supabase
2. Lee EMAIL_TROUBLESHOOTING.md
3. Revisa que la URL sea exactamente: `https://proyecto-fci-2025.vercel.app/auth/reset-password`
