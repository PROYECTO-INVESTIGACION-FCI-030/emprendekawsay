-- ============================================================
-- Kawsay Emprende Guayaquil
-- Esquema adaptado para visualización en MySQL Workbench
-- Fuente: estructura real actual de Supabase (esquema public)
-- Uso: solo para modelado / EER diagram
-- ============================================================

CREATE DATABASE IF NOT EXISTS kawsay_emprende_visual
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kawsay_emprende_visual;

SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_perfiles_usuario_con_rol;

DROP TABLE IF EXISTS notificaciones_leidas;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS quiz_leccion_intentos;
DROP TABLE IF EXISTS calificaciones_entrega;
DROP TABLE IF EXISTS entregas_tarea;
DROP TABLE IF EXISTS lecciones_curso;
DROP TABLE IF EXISTS tareas_curso;
DROP TABLE IF EXISTS modulos_curso;
DROP TABLE IF EXISTS curso_participantes;
DROP TABLE IF EXISTS productos_cientificos_investigadores;
DROP TABLE IF EXISTS productos_cientificos;
DROP TABLE IF EXISTS documentos_proyecto;
DROP TABLE IF EXISTS actividades_proyecto;
DROP TABLE IF EXISTS historial_ingresos;
DROP TABLE IF EXISTS cuestionario_limpio_respuestas;
DROP TABLE IF EXISTS configuracion_proyecto;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS roles_usuario;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS perfiles_usuario;
DROP TABLE IF EXISTS storage_objects;
DROP TABLE IF EXISTS storage_buckets;
DROP TABLE IF EXISTS auth_users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TABLAS PUENTE DE SUPABASE
-- ============================================================

CREATE TABLE auth_users (
  id CHAR(36) NOT NULL,
  email VARCHAR(255) NULL,
  role VARCHAR(100) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE storage_buckets (
  id VARCHAR(100) NOT NULL,
  name VARCHAR(150) NOT NULL,
  public_flag TINYINT(1) NOT NULL DEFAULT 0,
  file_size_limit BIGINT NULL,
  allowed_mime_types JSON NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE storage_objects (
  id BIGINT NOT NULL AUTO_INCREMENT,
  bucket_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  owner CHAR(36) NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_storage_objects_bucket (bucket_id),
  CONSTRAINT fk_storage_objects_bucket
    FOREIGN KEY (bucket_id) REFERENCES storage_buckets(id)
) ENGINE=InnoDB;

-- ============================================================
-- NÚCLEO DE USUARIOS Y ROLES
-- ============================================================

CREATE TABLE perfiles_usuario (
  id CHAR(36) NOT NULL,
  nombre_completo TEXT NULL,
  email TEXT NULL,
  telefono TEXT NULL,
  breve_descripcion TEXT NULL,
  linkedin TEXT NULL,
  fecha_registro DATETIME NULL,
  fecha_actualizacion DATETIME NULL,
  ultimo_acceso DATETIME NULL,
  avatar_url TEXT NULL,
  notificaciones_activas TINYINT(1) NULL,
  cuenta_activa TINYINT(1) NULL,
  rol VARCHAR(50) NULL,
  parroquia TEXT NULL,
  sector TEXT NULL,
  autoidentificacion_cultural TEXT NULL,
  fecha_nacimiento DATE NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_perfiles_usuario_auth_user
    FOREIGN KEY (id) REFERENCES auth_users(id)
) ENGINE=InnoDB;

CREATE TABLE roles (
  id BIGINT NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NULL,
  creado_en DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE roles_usuario (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_usuario CHAR(36) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  fecha_asignacion DATETIME NOT NULL,
  id_rol BIGINT NULL,
  asignado_por CHAR(36) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_usuario (id_usuario, rol),
  KEY idx_roles_usuario_id_rol (id_rol),
  KEY idx_roles_usuario_asignado_por (asignado_por),
  CONSTRAINT fk_roles_usuario_auth_user
    FOREIGN KEY (id_usuario) REFERENCES auth_users(id),
  CONSTRAINT fk_roles_usuario_rol
    FOREIGN KEY (id_rol) REFERENCES roles(id),
  CONSTRAINT fk_roles_usuario_asignado_por
    FOREIGN KEY (asignado_por) REFERENCES auth_users(id)
) ENGINE=InnoDB;

CREATE TABLE historial_ingresos (
  id CHAR(36) NOT NULL,
  id_usuario CHAR(36) NOT NULL,
  nombre_usuario TEXT NULL,
  email_usuario TEXT NULL,
  rol_usuario TEXT NULL,
  fecha_ingreso DATETIME NOT NULL,
  ruta TEXT NOT NULL,
  user_agent TEXT NULL,
  accion TEXT NULL,
  pagina_nombre TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_historial_ingresos_usuario (id_usuario),
  CONSTRAINT fk_historial_ingresos_usuario
    FOREIGN KEY (id_usuario) REFERENCES auth_users(id)
) ENGINE=InnoDB;

-- ============================================================
-- CONFIGURACIÓN Y DIAGNÓSTICO
-- ============================================================

CREATE TABLE configuracion_proyecto (
  id SMALLINT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  fecha_actualizacion DATETIME NOT NULL,
  meta_validacion INT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE cuestionario_limpio_respuestas (
  id BIGINT NOT NULL AUTO_INCREMENT,
  parroquia TEXT NULL,
  sector_ubicacion TEXT NULL,
  antiguedad_emprendimiento TEXT NULL,
  sector_economico TEXT NULL,
  ingreso_mensual TEXT NULL,
  nivel_instruccion TEXT NULL,
  etnia TEXT NULL,
  situacion_formalizacion TEXT NULL,
  control_dinero TEXT NULL,
  planifica_metas TEXT NULL,
  reinvierte_ganancias TEXT NULL,
  define_precios_costos TEXT NULL,
  promocion_negocio TEXT NULL,
  medios_promocion TEXT NULL,
  usa_sugerencias_clientes TEXT NULL,
  dispositivo_internet TEXT NULL,
  dispositivos_usados TEXT NULL,
  usa_apps_digitales TEXT NULL,
  apps_usadas TEXT NULL,
  usa_pagos_digitales TEXT NULL,
  pagos_usados TEXT NULL,
  dificultad_tecnologia TEXT NULL,
  incorpora_cultura TEXT NULL,
  elementos_culturales TEXT NULL,
  origen_conocimiento_cultural TEXT NULL,
  participa_asociaciones TEXT NULL,
  asociaciones TEXT NULL,
  interes_programa TEXT NULL,
  contacto_programa TEXT NULL,
  modalidad_preferida TEXT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- CURSOS, MÓDULOS, LECCIONES Y TAREAS
-- ============================================================

CREATE TABLE cursos (
  id CHAR(36) NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  enlace TEXT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  creado_por CHAR(36) NULL,
  fecha_creacion DATETIME NOT NULL,
  fecha_actualizacion DATETIME NOT NULL,
  estado VARCHAR(50) NOT NULL,
  id_encargado CHAR(36) NULL,
  PRIMARY KEY (id),
  KEY idx_cursos_creado_por (creado_por),
  KEY idx_cursos_id_encargado (id_encargado),
  CONSTRAINT fk_cursos_creado_por
    FOREIGN KEY (creado_por) REFERENCES perfiles_usuario(id),
  CONSTRAINT fk_cursos_id_encargado
    FOREIGN KEY (id_encargado) REFERENCES perfiles_usuario(id)
) ENGINE=InnoDB;

CREATE TABLE modulos_curso (
  id CHAR(36) NOT NULL,
  id_curso CHAR(36) NOT NULL,
  titulo TEXT NOT NULL,
  contenido_html LONGTEXT NOT NULL,
  orden INT NOT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion DATETIME NOT NULL,
  fecha_actualizacion DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_modulos_curso_id_curso (id_curso),
  CONSTRAINT fk_modulos_curso_curso
    FOREIGN KEY (id_curso) REFERENCES cursos(id)
) ENGINE=InnoDB;

CREATE TABLE tareas_curso (
  id CHAR(36) NOT NULL,
  id_curso CHAR(36) NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NULL,
  fecha_limite DATETIME NOT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  creado_por CHAR(36) NULL,
  fecha_creacion DATETIME NOT NULL,
  fecha_actualizacion DATETIME NOT NULL,
  id_modulo CHAR(36) NULL,
  PRIMARY KEY (id),
  KEY idx_tareas_curso_id_curso (id_curso),
  KEY idx_tareas_curso_creado_por (creado_por),
  KEY idx_tareas_curso_id_modulo (id_modulo),
  CONSTRAINT fk_tareas_curso_curso
    FOREIGN KEY (id_curso) REFERENCES cursos(id),
  CONSTRAINT fk_tareas_curso_creado_por
    FOREIGN KEY (creado_por) REFERENCES perfiles_usuario(id),
  CONSTRAINT fk_tareas_curso_modulo
    FOREIGN KEY (id_modulo) REFERENCES modulos_curso(id)
) ENGINE=InnoDB;

CREATE TABLE lecciones_curso (
  id CHAR(36) NOT NULL,
  id_curso CHAR(36) NOT NULL,
  id_modulo CHAR(36) NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NULL,
  contenido_html LONGTEXT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  orden INT NOT NULL,
  creado_por CHAR(36) NULL,
  fecha_creacion DATETIME NOT NULL,
  fecha_actualizacion DATETIME NOT NULL,
  pregunta TEXT NULL,
  opciones JSON NOT NULL,
  respuesta_correcta TEXT NULL,
  explicacion TEXT NULL,
  puntaje INT NOT NULL,
  preguntas JSON NOT NULL,
  fecha_inicio DATETIME NULL,
  fecha_fin DATETIME NULL,
  tiempo_total_min INT NULL,
  tiempo_pregunta_min INT NULL,
  mostrar_respuestas_correctas TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_lecciones_curso_id_curso (id_curso),
  KEY idx_lecciones_curso_id_modulo (id_modulo),
  KEY idx_lecciones_curso_creado_por (creado_por),
  CONSTRAINT fk_lecciones_curso_curso
    FOREIGN KEY (id_curso) REFERENCES cursos(id),
  CONSTRAINT fk_lecciones_curso_modulo
    FOREIGN KEY (id_modulo) REFERENCES modulos_curso(id),
  CONSTRAINT fk_lecciones_curso_auth_user
    FOREIGN KEY (creado_por) REFERENCES auth_users(id)
) ENGINE=InnoDB;

CREATE TABLE curso_participantes (
  id CHAR(36) NOT NULL,
  id_curso CHAR(36) NOT NULL,
  id_participante CHAR(36) NOT NULL,
  fecha_asignacion DATETIME NOT NULL,
  asignado_por CHAR(36) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_curso_participantes (id_curso, id_participante),
  KEY idx_curso_participantes_participante (id_participante),
  KEY idx_curso_participantes_asignado_por (asignado_por),
  CONSTRAINT fk_curso_participantes_curso
    FOREIGN KEY (id_curso) REFERENCES cursos(id),
  CONSTRAINT fk_curso_participantes_perfil
    FOREIGN KEY (id_participante) REFERENCES perfiles_usuario(id),
  CONSTRAINT fk_curso_participantes_asignado_por
    FOREIGN KEY (asignado_por) REFERENCES perfiles_usuario(id)
) ENGINE=InnoDB;

CREATE TABLE entregas_tarea (
  id CHAR(36) NOT NULL,
  id_tarea CHAR(36) NOT NULL,
  id_participante CHAR(36) NOT NULL,
  archivo_path TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  fecha_entrega DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_entrega_tarea_participante (id_tarea, id_participante),
  KEY idx_entregas_tarea_participante (id_participante),
  CONSTRAINT fk_entregas_tarea_tarea
    FOREIGN KEY (id_tarea) REFERENCES tareas_curso(id),
  CONSTRAINT fk_entregas_tarea_participante
    FOREIGN KEY (id_participante) REFERENCES perfiles_usuario(id)
) ENGINE=InnoDB;

CREATE TABLE calificaciones_entrega (
  id CHAR(36) NOT NULL,
  id_entrega CHAR(36) NOT NULL,
  calificacion DECIMAL(4,2) NOT NULL,
  retroalimentacion TEXT NULL,
  calificado_por CHAR(36) NULL,
  fecha_calificacion DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_calificaciones_entrega_id_entrega (id_entrega),
  KEY idx_calificaciones_entrega_calificado_por (calificado_por),
  CONSTRAINT fk_calificaciones_entrega_entrega
    FOREIGN KEY (id_entrega) REFERENCES entregas_tarea(id),
  CONSTRAINT fk_calificaciones_entrega_calificado_por
    FOREIGN KEY (calificado_por) REFERENCES perfiles_usuario(id)
) ENGINE=InnoDB;

CREATE TABLE quiz_leccion_intentos (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_leccion CHAR(36) NOT NULL,
  id_usuario CHAR(36) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  respuestas JSON NOT NULL,
  puntaje_total DECIMAL(10,2) NULL,
  puntaje_obtenido DECIMAL(10,2) NULL,
  started_at DATETIME NOT NULL,
  submitted_at DATETIME NULL,
  updated_at DATETIME NOT NULL,
  feedback TEXT NULL,
  revision_detalle JSON NULL,
  PRIMARY KEY (id),
  KEY idx_quiz_intentos_leccion (id_leccion),
  KEY idx_quiz_intentos_usuario (id_usuario),
  CONSTRAINT fk_quiz_intentos_leccion
    FOREIGN KEY (id_leccion) REFERENCES lecciones_curso(id),
  CONSTRAINT fk_quiz_intentos_usuario
    FOREIGN KEY (id_usuario) REFERENCES auth_users(id)
) ENGINE=InnoDB;

-- ============================================================
-- PRODUCCIÓN CIENTÍFICA Y AVANCE
-- ============================================================

CREATE TABLE productos_cientificos (
  id CHAR(36) NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NULL,
  tipo VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  avance INT NOT NULL,
  responsable CHAR(36) NULL,
  evidencia_url TEXT NULL,
  enlace TEXT NULL,
  fecha_objetivo DATE NULL,
  fecha_creacion DATETIME NOT NULL,
  fecha_actualizacion DATETIME NOT NULL,
  fecha_publicacion DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_productos_cientificos_responsable (responsable),
  CONSTRAINT fk_productos_cientificos_responsable
    FOREIGN KEY (responsable) REFERENCES perfiles_usuario(id)
) ENGINE=InnoDB;

CREATE TABLE productos_cientificos_investigadores (
  id_producto CHAR(36) NOT NULL,
  id_investigador CHAR(36) NOT NULL,
  fecha_asignacion DATETIME NOT NULL,
  PRIMARY KEY (id_producto, id_investigador),
  KEY idx_prod_cientificos_investigador (id_investigador),
  CONSTRAINT fk_prod_cientificos_inv_producto
    FOREIGN KEY (id_producto) REFERENCES productos_cientificos(id),
  CONSTRAINT fk_prod_cientificos_inv_investigador
    FOREIGN KEY (id_investigador) REFERENCES perfiles_usuario(id)
) ENGINE=InnoDB;

CREATE TABLE actividades_proyecto (
  id CHAR(36) NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NULL,
  fecha_objetivo DATE NOT NULL,
  estado VARCHAR(50) NOT NULL,
  orden INT NOT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  creado_por CHAR(36) NULL,
  fecha_creacion DATETIME NOT NULL,
  fecha_actualizacion DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_actividades_proyecto_creado_por (creado_por),
  CONSTRAINT fk_actividades_proyecto_creado_por
    FOREIGN KEY (creado_por) REFERENCES perfiles_usuario(id)
) ENGINE=InnoDB;

-- ============================================================
-- DOCUMENTOS Y NOTIFICACIONES
-- ============================================================

CREATE TABLE documentos_proyecto (
  id BIGINT NOT NULL AUTO_INCREMENT,
  titulo TEXT NOT NULL,
  descripcion TEXT NULL,
  categoria TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  archivo_path TEXT NOT NULL,
  archivo_tipo TEXT NULL,
  archivo_tamano BIGINT NULL,
  enlace_externo TEXT NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  orden INT NOT NULL DEFAULT 0,
  creado_por CHAR(36) NULL,
  actualizado_por CHAR(36) NULL,
  fecha_creacion DATETIME NOT NULL,
  fecha_actualizacion DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_documentos_proyecto_creado_por (creado_por),
  KEY idx_documentos_proyecto_actualizado_por (actualizado_por),
  CONSTRAINT fk_documentos_proyecto_creado_por
    FOREIGN KEY (creado_por) REFERENCES perfiles_usuario(id),
  CONSTRAINT fk_documentos_proyecto_actualizado_por
    FOREIGN KEY (actualizado_por) REFERENCES perfiles_usuario(id)
) ENGINE=InnoDB;

CREATE TABLE notificaciones (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_usuario CHAR(36) NULL,
  rol TEXT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  href TEXT NULL,
  accion TEXT NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  fecha_creacion DATETIME NOT NULL,
  fecha_actualizacion DATETIME NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE notificaciones_leidas (
  id BIGINT NOT NULL AUTO_INCREMENT,
  id_notificacion TEXT NOT NULL,
  id_usuario CHAR(36) NOT NULL,
  fecha_lectura DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notificaciones_leidas (id_notificacion(255), id_usuario),
  KEY idx_notificaciones_leidas_usuario (id_usuario),
  CONSTRAINT fk_notificaciones_leidas_usuario
    FOREIGN KEY (id_usuario) REFERENCES auth_users(id)
) ENGINE=InnoDB;

-- ============================================================
-- VISTA ANALÍTICA
-- ============================================================

CREATE VIEW v_perfiles_usuario_con_rol AS
SELECT
  p.id,
  p.nombre_completo,
  p.email,
  p.telefono,
  p.breve_descripcion,
  p.linkedin,
  p.avatar_url,
  p.parroquia,
  p.sector,
  p.autoidentificacion_cultural,
  p.fecha_nacimiento,
  p.fecha_registro,
  p.fecha_actualizacion,
  p.ultimo_acceso,
  p.notificaciones_activas,
  p.cuenta_activa,
  p.rol,
  r.nombre AS rol_nombre
FROM perfiles_usuario p
LEFT JOIN roles r
  ON r.codigo = p.rol;

-- ============================================================
-- DATOS BASE OPCIONALES PARA ROLES
-- ============================================================

INSERT INTO roles (codigo, nombre, descripcion, creado_en) VALUES
  ('administradora', 'Administradora', 'Acceso completo a la plataforma', NOW()),
  ('investigadora', 'Investigadora', 'Seguimiento analítico y científico', NOW()),
  ('formadora', 'Formadora', 'Gestión académica y acompañamiento', NOW()),
  ('mujer_emprendedora', 'Mujer emprendedora', 'Participación formativa y operativa', NOW()),
  ('institucion_aliada', 'Institución aliada', 'Consulta y apoyo institucional', NOW())
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  descripcion = VALUES(descripcion);
