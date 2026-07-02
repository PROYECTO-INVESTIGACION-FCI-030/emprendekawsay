# SQL para visualización en MySQL Workbench

Estos archivos están pensados para **crear el diagrama visual** de la base de datos en MySQL Workbench.

Importante:

- La plataforma real corre sobre **Supabase/PostgreSQL**.
- MySQL Workbench no interpreta bien varias características nativas de Postgres (`uuid`, `jsonb`, `timestamptz`, RLS, policies, funciones `auth.*`, `storage.*`, enums de Supabase).
- Por eso, este paquete es una **adaptación de visualización**, no un reemplazo del esquema real de Supabase.

## Archivo principal

- `01_kawsay_visualizacion_mysql_workbench.sql`

## Qué incluye

- Tablas operativas reales de la plataforma (`public` en Supabase).
- Tabla puente `auth_users` para representar las relaciones que en Supabase apuntan a `auth.users`.
- Tablas puente `storage_buckets` y `storage_objects` para representar almacenamiento documental.
- Claves primarias, claves únicas y relaciones principales.
- Vista `v_perfiles_usuario_con_rol` para reflejar la vista analítica usada en la app.

## Cómo usarlo en MySQL Workbench

1. Abrir **MySQL Workbench**.
2. Ir a **File > Open SQL Script** y abrir `01_kawsay_visualizacion_mysql_workbench.sql`.
3. Crear un esquema vacío o usar uno temporal.
4. Ejecutar el script.
5. Ir a **Database > Reverse Engineer** o **Model > Create EER Model from Database**.
6. Seleccionar el esquema `kawsay_emprende_visual`.
7. Generar el diagrama.

## Nota práctica

Si quieres, después te preparo una segunda versión:

- una **minimalista** solo con las tablas más importantes para tesis/presentación, o
- una **extendida** con más tablas internas de `auth` y `storage`.
