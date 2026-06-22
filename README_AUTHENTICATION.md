# 🔐 Sistema de Autenticación - Recuperación de Contraseña

## Resumen de Cambios

Se han implementado dos flujos de seguridad para gestión de contraseñas:

1. **Recuperación de Contraseña Olvidada** - Para usuarios que olvidan su contraseña
2. **Creación Segura de Usuarios** - Para que admin cree usuarios sin mostrar contraseña

---

## 🎯 Cambios en la Página de Login

### Antes ❌
```
┌─────────────────────┐
│ Correo: [    ]      │
│ Contraseña: [    ]  │
│ [Ingresar]          │
│                     │
│ ¿No tienes cuenta?  │
│ Regístrate          │ ← REMOVIDO
└─────────────────────┘
```

### Después ✅
```
┌─────────────────────────────┐
│ Correo: [            ]      │
│ Contraseña: [        ]      │
│ ¿Olvidaste tu contraseña?   │ ← AGREGADO
│ [Ingresar]                  │
└─────────────────────────────┘
```

---

## 🔄 Flujo 1: Usuario Olvida Contraseña

```
Login Page
    ↓
[¿Olvidaste tu contraseña?]
    ↓
/auth/forgot-password
    ├─ Ingresa email
    └─ [Enviar enlace de recuperación]
        ↓
        Supabase envía email con link seguro (24h)
        ↓
        Usuario abre email y hace clic en link
        ↓
        /auth/reset-password
        ├─ Ingresa nueva contraseña
        ├─ Confirma contraseña
        └─ [Actualizar contraseña]
            ↓
            Redirige a /auth/login
            ↓
            Login con nueva contraseña ✅
```

---

## 👤 Flujo 2: Admin Crea Nuevo Usuario

```
Admin: /configuracion
    ↓
Gestión de usuarios → [+ Nuevo usuario]
    ↓
Dialog:
├─ Nombre: "María García"
├─ Email: "maria@ejemplo.com"
├─ Rol: "Investigadora"
└─ [Crear usuario]
    ↓
Sistema:
├─ Crea usuario en Supabase Auth
├─ Asigna contraseña interna aleatoria
└─ Envía EMAIL al usuario
    ↓
    Usuario recibe email con link
    ↓
    Usuario abre link → /auth/reset-password
    ├─ Establece su propia contraseña (mín 8 caracteres)
    └─ [Actualizar contraseña]
        ↓
        Redirige a /auth/login
        ↓
        Login con su contraseña ✅
```

---

## 📁 Archivos Nuevos

```
app/
├── auth/
│   ├── forgot-password/
│   │   └── page.tsx          ← Recuperación de contraseña
│   └── reset-password/
│       └── page.tsx          ← Establecer nueva contraseña
│
CAMBIOS_REALIZADOS.md         ← Documentación técnica detallada
SUPABASE_SETUP.md             ← Guía de configuración Supabase
AUTH_CONFIGURATION.md         ← Configuración de autenticación
.env.example                  ← Variables de entorno
```

---

## 📝 Archivos Modificados

### 1. `app/auth/login/page.tsx`
- Removido botón/enlace "Regístrate"
- Agregado "¿Olvidaste tu contraseña?" → `/auth/forgot-password`

### 2. `lib/usuarios-actions.ts` - Función `crearUsuario()`
```typescript
// Antes:
// - Generaba contraseña temporal visible
// - Mensaje poco claro

// Después:
// - Genera contraseña aleatoria interna
// - Envía email con link de recuperación automáticamente
// - Mensaje claro: "Se ha enviado un correo..."
```

### 3. `components/configuracion/configuracion-tabs.tsx`
- Mejorado el diálogo de crear usuario
- Agregada información: "¿Cómo funciona?"
- Mejor explicación del proceso
- Validación mejorada de campos

---

## ⚙️ Configuración Requerida

### 1. Variables de Entorno

Copia `.env.example` a `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=https://proyecto-fci-2025.vercel.app
```

**Cómo obtenerlas:**
- Ve a [Supabase Dashboard](https://app.supabase.com)
- Proyecto → Settings → API Keys
- Copia los valores correspondientes

### 2. Supabase URL Configuration

**IMPORTANTE:** Esto DEBE estar configurado para que los emails funcionen.

En Supabase Dashboard → Authentication → URL Configuration

Agrega en "Redirect URLs":
```
https://proyecto-fci-2025.vercel.app/auth/callback
https://proyecto-fci-2025.vercel.app/auth/reset-password
```

Para desarrollo local, también agrega:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

### 3. Email Provider

En Supabase Dashboard → Authentication → Email Templates

- Verifica que Email Provider está habilitado
- Si usas proveedor personalizado, configura credenciales

---

## 🧪 Testing

### Test Local

```bash
# 1. Configurar .env.local
# 2. Ejecutar servidor
pnpm dev

# 3. Test recuperación de contraseña
# - Ir a http://localhost:3000/auth/forgot-password
# - Ingresar email
# - En Supabase, ir a Email Logs para ver si se envió

# 4. Test crear usuario
# - Loguear como admin
# - Ir a /configuracion → Gestión de usuarios
# - Crear nuevo usuario
# - Verificar que recibe email (revisar SPAM)
```

### Test Producción

```bash
# 1. Desplegar a Vercel (git push)
# 2. Configurar variables de entorno en Vercel
# 3. Ir a https://proyecto-fci-2025.vercel.app/auth/forgot-password
# 4. Ingresar tu correo real
# 5. Revisar bandeja de entrada
# 6. Hacer clic en enlace
# 7. Establecer nueva contraseña
# 8. Iniciar sesión
```

---

## 🔒 Seguridad

### ✅ Lo que es seguro:

- **Contraseñas nunca por email** - Solo se envía un enlace seguro
- **Usuario establece contraseña** - No el admin
- **Enlaces expiran** - En 24 horas
- **Requiere autenticación** - Para cambiar contraseña
- **Admin nunca ve contraseña** - Del usuario

### ⚠️ Importante:

1. Los usuarios deben tener acceso a su correo
2. Verificar carpeta SPAM si no reciben email
3. Los enlaces solo funcionan UNA VEZ
4. Después de cambiar contraseña, debe hacer login con la nueva

---

## 🆘 Solución de Problemas

### "No recibo el email"

**Checklist:**
1. ✓ Revisar carpeta SPAM
2. ✓ Ir a Supabase → Email Logs
3. ✓ Verificar que Redirect URLs están configuradas
4. ✓ Verificar NEXT_PUBLIC_SITE_URL es correcto
5. ✓ Si falla en Supabase, revisar Email Provider

**Si sigue fallando:**
- En desarrollo: Ve a Supabase → Auth → Users
- Busca el usuario y usa botón "Reset password" (3 puntos)
- Esto genera un link que puedes usar para testear

### "El enlace no funciona"

**Causas comunes:**
1. ✓ Enlace expiró (fueron 24+ horas)
2. ✓ Redirect URLs no configuradas en Supabase
3. ✓ Variables de entorno incompletas

**Solución:**
- Solicita un nuevo enlace usando "¿Olvidaste tu contraseña?"
- Verifica configuración en Supabase

### "Error: Missing NEXT_PUBLIC_SUPABASE_URL"

- Falta variable de entorno
- En Vercel → Settings → Environment Variables
- Agrega todas las variables del .env.example
- Redeploy

---

## 📚 Documentación Completa

Para información detallada, consulta:

- **CAMBIOS_REALIZADOS.md** - Todo lo que cambió
- **SUPABASE_SETUP.md** - Configuración paso a paso
- **AUTH_CONFIGURATION.md** - Detalles técnicos

---

## ✅ Checklist de Implementación

- [ ] Copiar variables de .env.example a .env.local
- [ ] Configurar Redirect URLs en Supabase
- [ ] Probar en desarrollo (pnpm dev)
- [ ] Desplegar a Vercel
- [ ] Agregar variables de entorno en Vercel
- [ ] Probar login con "¿Olvidaste tu contraseña?"
- [ ] Probar crear usuario nuevo
- [ ] Verificar que usuarios reciben emails
- [ ] Listo para producción ✅

---

## 🚀 Listo para Usar

El sistema está completamente implementado y listo para:
- Usuarios que olvidan contraseña
- Admins creando usuarios seguros
- Producción en https://proyecto-fci-2025.vercel.app

¡Comienza con SUPABASE_SETUP.md! 📘
