# Configuración de Autenticación Supabase

## Cambios Realizados

### 1. Página de Login
- ✅ Removido enlace "Regístrate"
- ✅ Agregado enlace "¿Olvidaste tu contraseña?" vinculado a `/auth/forgot-password`

### 2. Recuperación de Contraseña
Se han creado dos nuevas páginas:

#### `/auth/forgot-password`
- Página donde los usuarios ingresan su correo electrónico
- Sistema envía un enlace de recuperación seguro
- Válido por 24 horas

#### `/auth/reset-password`
- Página donde el usuario establece su nueva contraseña
- Requiere confirmación de contraseña
- Mínimo 8 caracteres

### 3. Creación de Usuarios (Panel Admin)
Al crear un nuevo usuario desde el panel de configuración:
- Se genera un usuario en Supabase Auth
- **Se envía automáticamente** un correo con enlace para establecer contraseña
- El usuario NO recibe una contraseña temporal visible
- Es el enfoque más seguro ✅

## Configuración Requerida en Supabase

### Email Configuration
En **Supabase → Authentication → Email Templates**, asegúrate que:

1. **Email Provider** está configurado (Supabase (default) o un proveedor personalizado)
2. Los templates de email están habilitados

### Redirect URLs
En **Supabase → Authentication → URL Configuration**:

Agrega estas URLs (reemplaza tu dominio):

```
https://proyecto-fci-2025.vercel.app/auth/callback
https://proyecto-fci-2025.vercel.app/auth/reset-password
```

La primera es para el flujo general de autenticación.
La segunda es específica para recuperación de contraseña.

### Variables de Entorno
En tu proyecto Vercel o archivo `.env.local`, asegúrate que:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key (para crear usuarios)
NEXT_PUBLIC_SITE_URL=https://proyecto-fci-2025.vercel.app
```

**NEXT_PUBLIC_SITE_URL** es importante para que los enlaces de recuperación funcionen correctamente.

## Flujo de Usuario

### Olvido de Contraseña (Usuario)
1. Usuario hace clic en "¿Olvidaste tu contraseña?" en el login
2. Ingresa su correo
3. Supabase envía un enlace seguro
4. Usuario hace clic en el enlace
5. Establece su nueva contraseña
6. Inicia sesión con la nueva contraseña

### Nuevo Usuario (Admin)
1. Admin crea nuevo usuario en panel de configuración
2. Admin ingresa: Nombre, Email, Rol
3. Sistema crea usuario con contraseña temporal aleatoria
4. Sistema **envía automáticamente** correo con enlace de recuperación
5. Usuario recibe el correo
6. Usuario establece su propia contraseña segura
7. Usuario puede iniciar sesión

## Seguridad

✅ **Lo que es seguro:**
- Las contraseñas se establecen directamente por el usuario (no se envían por email)
- Los enlaces de recuperación expiran en 24 horas
- Solo el usuario autenticado puede cambiar su contraseña

⚠️ **Importante:**
- Verifica que Supabase envía los correos correctamente
- Los usuarios deben tener acceso a su correo para recuperar contraseña
- Si un usuario no recibe correo, revisa la carpeta de SPAM

## Testing

Para probar en desarrollo local:

1. En Supabase, usa el mail preview (si está habilitado) o ve a Auth → Users para ver logs
2. En producción, verifica que el correo se envía correctamente
3. Prueba el flujo completo: crear usuario → recibir email → establecer contraseña → login

## Solución de Problemas

### "El enlace de recuperación no es válido"
- Verifica que pasó 24 horas (enlace expiró)
- Verifica que las URL en Supabase incluyen `/auth/reset-password`
- Intenta de nuevo con "¿Olvidaste tu contraseña?"

### "No recibo el correo"
- Verifica carpeta de SPAM
- Confirma que el email provider en Supabase está configurado
- En Supabase, ve a Email Logs para ver si hay errores

### Usuario creado pero no recibe email
- Verifica NEXT_PUBLIC_SITE_URL está correcto
- Revisa logs de Supabase Email en el dashboard
- El admin puede pedirle al usuario que use "¿Olvidaste tu contraseña?" manualmente
