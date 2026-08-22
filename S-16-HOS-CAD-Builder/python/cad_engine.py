#!/usr/bin/env python3
"""
HOS-CAD-Builder Python Execution Engine

This module provides the build123d execution environment for
the MCP Agent Skill. It can be invoked directly or through the
Node.js Python bridge.

Usage:
    python cad_engine.py --code-file <path> --output-dir <path> --formats step,stl
    python cad_engine.py --code-string "<python code>" --output-dir <path> --formats step
"""

import argparse
import json
import os
import sys
import tempfile
from pathlib import Path

try:
    import build123d as bd
    from build123d import *
    BUILD123D_AVAILABLE = True
except ImportError:
    BUILD123D_AVAILABLE = False
    print("[WARN] build123d not installed. Install with: pip install build123d", file=sys.stderr)


EXPORTERS = {
    "step": lambda part, path: bd.export_step(part, path),
    "stp": lambda part, path: bd.export_step(part, path),
    "stl": lambda part, path: bd.export_stl(part, path),
    "3mf": lambda part, path: bd.export_3mf(part, path),
    "glb": lambda part, path: bd.export_gltf(part, path, export_type="glb"),
    "dxf": lambda part, path: _export_dxf(part, path),
}


def _export_dxf(part, path):
    """Export the largest face as DXF."""
    try:
        faces = part.faces()
        if len(faces) > 0:
            largest = max(faces, key=lambda f: f.area)
            with bd.BuildSketch(bd.Plane.XY) as sketch:
                bd.add(largest)
            bd.export_dxf(sketch, path)
        else:
            print("[WARN] No faces to export as DXF", file=sys.stderr)
    except Exception as e:
        print(f"[WARN] DXF export failed: {e}", file=sys.stderr)


def execute_code(code_string: str, output_dir: str, formats: list[str]) -> dict:
    """Execute build123d code and export results."""
    if not BUILD123D_AVAILABLE:
        return {
            "success": False,
            "error": "build123d not installed",
            "volume": None,
            "surface_area": None,
            "files": [],
        }

    os.makedirs(output_dir, exist_ok=True)
    result = {
        "success": False,
        "volume": None,
        "surface_area": None,
        "bounding_box": None,
        "files": [],
        "error": None,
    }

    try:
        # Execute the code in a fresh namespace
        namespace = {
            "bd": bd,
            "__builtins__": __builtins__,
        }

        exec(code_string, namespace)

        # Get the part object
        part = namespace.get("part")
        if part is None:
            # Try common variable names
            for name in ["model", "result", "cad_part", "solid"]:
                part = namespace.get(name)
                if part is not None:
                    break

        if part is None:
            result["error"] = "No 'part' variable found in generated code"
            return result

        # Measure
        result["volume"] = float(part.volume)
        result["surface_area"] = float(part.area)
        bb = part.bounding_box()
        result["bounding_box"] = [float(bb.size.X), float(bb.size.Y), float(bb.size.Z)]

        print(f"Volume: {result['volume']:.2f} mm³")
        print(f"Surface area: {result['surface_area']:.2f} mm²")
        print(f"Bounding box: {result['bounding_box'][0]:.2f} x {result['bounding_box'][1]:.2f} x {result['bounding_box'][2]:.2f} mm")

        # Export
        base_path = os.path.join(output_dir, "model")
        for fmt in formats:
            fmt = fmt.lower().strip()
            if fmt not in EXPORTERS:
                print(f"[WARN] Unsupported format: {fmt}", file=sys.stderr)
                continue

            try:
                file_path = f"{base_path}.{fmt}"
                EXPORTERS[fmt](part, file_path)
                if os.path.exists(file_path):
                    result["files"].append(file_path)
                    print(f"[FILE]{file_path}[/FILE]")
                    print(f"Exported {fmt}: {file_path}")
            except Exception as e:
                print(f"[ERROR] Failed to export {fmt}: {e}", file=sys.stderr)

        result["success"] = True

    except Exception as e:
        result["error"] = str(e)
        print(f"[ERROR] Execution failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)

    return result


def main():
    parser = argparse.ArgumentParser(description="HOS-CAD-Builder Python Engine")
    parser.add_argument("--code-file", help="Path to Python code file")
    parser.add_argument("--code-string", help="Python code as string")
    parser.add_argument("--output-dir", default="./output", help="Output directory")
    parser.add_argument("--formats", default="step", help="Comma-separated export formats")
    parser.add_argument("--json", action="store_true", help="Output result as JSON")

    args = parser.parse_args()

    if not args.code_file and not args.code_string:
        parser.error("Either --code-file or --code-string is required")

    if args.code_file:
        with open(args.code_file, "r") as f:
            code = f.read()
    else:
        code = args.code_string

    formats = [f.strip() for f in args.formats.split(",")]
    result = execute_code(code, args.output_dir, formats)

    if args.json:
        print(json.dumps(result, indent=2))

    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
