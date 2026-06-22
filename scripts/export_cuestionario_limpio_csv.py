from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

from import_cuestionario_limpio import DEFAULT_XLSX, build_payload


DEFAULT_OUTPUT = Path(r"C:\Users\R-R\Downloads\BD_cuestionario_limpio_supabase.csv")


def main() -> int:
    parser = argparse.ArgumentParser(description="Convierte BD_cuestionario_limpio.xlsx a CSV listo para Supabase.")
    parser.add_argument("--file", type=Path, default=DEFAULT_XLSX, help="Ruta del archivo XLSX.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Ruta de salida CSV.")
    args = parser.parse_args()

    rows = build_payload(args.file)
    df = pd.DataFrame(rows)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(args.output, index=False, encoding="utf-8-sig")
    print(f"CSV generado: {args.output}")
    print(f"Filas: {len(df)}")
    print(f"Columnas: {len(df.columns)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
