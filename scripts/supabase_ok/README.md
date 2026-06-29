# Scripts Supabase en uso

Esta carpeta reúne los scripts que siguen conectados con la aplicación actual.

## Incluidos

- `001_auth_setup.sql` - Auth, perfiles, roles y trigger de registro.
- `004_cuestionario_limpio_dashboard.sql` - Tabla limpia de encuesta y vista resumen.
- `005_configuracion_proyecto.sql` - Configuración editable del proyecto.
- `006_cursos_tareas.sql` - Cursos, módulos, tareas, entregas y calificaciones.
- `007_encuestas_produccion_prediccion.sql` - Producción científica, encuestas y predicción.
- `008_actividades_proyecto.sql` - Actividades del proyecto para avance y próximas actividades.
- `009_productos_cientificos_fecha_publicacion.sql` - Fecha de publicación para producción científica.

## Fuera del flujo principal

- `import_cuestionario_limpio.py` - Importación manual del Excel.
- `export_cuestionario_limpio_csv.py` - Exportación manual a CSV.
- `__pycache__` - No forma parte de la lógica de Supabase.
