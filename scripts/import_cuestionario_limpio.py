from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_XLSX = Path(r"C:\Users\R-R\Downloads\BD_cuestionario_limpio.xlsx")


def load_env() -> None:
    env_path = ROOT / ".env.local"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        if not line or line.strip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def find_column(columns: list[str], prefix: str) -> str:
    for column in columns:
        if column.startswith(prefix):
            return column
    raise KeyError(f"No se encontro una columna que empiece con: {prefix}")


def clean_value(value):
    if pd.isna(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    text = str(value).strip()
    return text or None


def build_payload(path: Path) -> list[dict[str, object]]:
    df = pd.read_excel(path)
    columns = [str(column) for column in df.columns]
    df.columns = columns

    mapping = {
        "marca_temporal": "Marca temporal",
        "ubicacion": "Ubicación",
        "parroquia": find_column(columns, "1."),
        "sector_ubicacion": find_column(columns, "2."),
        "antiguedad_emprendimiento": find_column(columns, "3."),
        "sector_economico": find_column(columns, "4."),
        "ingreso_mensual": find_column(columns, "5."),
        "nivel_instruccion": find_column(columns, "6."),
        "etnia": find_column(columns, "7."),
        "situacion_formalizacion": find_column(columns, "8."),
        "control_dinero": find_column(columns, "9."),
        "planifica_metas": find_column(columns, "10."),
        "reinvierte_ganancias": find_column(columns, "11."),
        "define_precios_costos": find_column(columns, "12."),
        "promocion_negocio": find_column(columns, "13."),
        "medios_promocion": "👉 Si marcó la segunda opción, indique las opciones que utiliza con más frecuencia (puede marcar más de una)",
        "usa_sugerencias_clientes": find_column(columns, "14."),
        "dispositivo_internet": find_column(columns, "15."),
        "dispositivos_usados": "👉 Si respondió “Sí” o “A veces”: indique cuál utiliza con mayor frecuencia (puede escoger más de una",
        "usa_apps_digitales": find_column(columns, "16."),
        "apps_usadas": "👉 Si respondió “Sí” o “A veces”: indique cuál utiliza con mayor frecuencia (puede escoger más de una)",
        "usa_pagos_digitales": find_column(columns, "17."),
        "pagos_usados": "👉 Si respondió “Sí” o “A veces”: indique cuál utiliza con mayor frecuencia (puede escoger más de una) .1",
        "dificultad_tecnologia": find_column(columns, "18."),
        "incorpora_cultura": find_column(columns, "19."),
        "elementos_culturales": "👉Si marcó “Sí” o “A veces”, indique cuáles (puede marcar más de una):",
        "origen_conocimiento_cultural": find_column(columns, "20."),
        "participa_asociaciones": find_column(columns, "21."),
        "asociaciones": "👉 Si marcó “Sí” o “A veces”, indique en cuáles: (puede marcar mas de una)",
        "interes_programa": find_column(columns, "22."),
        "contacto_programa": "Si su respuesta fue si, por favor proporcionar un número de WhatsApp activo o correo electrónico que revise a menudo para enviar detalle de programa y enlace de inscripción",
        "modalidad_preferida": find_column(columns, "23."),
    }

    payload: list[dict[str, object]] = []
    for _, source in df.iterrows():
        item = {target: clean_value(source[column]) for target, column in mapping.items()}
        payload.append(item)

    return payload


def post_chunk(url: str, service_key: str, rows: list[dict[str, object]]) -> None:
    endpoint = f"{url.rstrip('/')}/rest/v1/cuestionario_limpio_respuestas"
    body = json.dumps(rows, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            if response.status not in (200, 201, 204):
                raise RuntimeError(f"Supabase respondio HTTP {response.status}")
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Error Supabase HTTP {error.code}: {detail}") from error


def main() -> int:
    parser = argparse.ArgumentParser(description="Importa BD_cuestionario_limpio.xlsx a Supabase.")
    parser.add_argument("--file", type=Path, default=DEFAULT_XLSX, help="Ruta del archivo XLSX.")
    parser.add_argument("--chunk-size", type=int, default=500, help="Filas por lote.")
    args = parser.parse_args()

    load_env()
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_key:
        print("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.", file=sys.stderr)
        return 1

    if not args.file.exists():
        print(f"No existe el archivo: {args.file}", file=sys.stderr)
        return 1

    rows = build_payload(args.file)
    for start in range(0, len(rows), args.chunk_size):
        post_chunk(supabase_url, service_key, rows[start : start + args.chunk_size])
        print(f"Importadas {min(start + args.chunk_size, len(rows))}/{len(rows)} filas")

    print(f"Importacion completa: {len(rows)} filas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
