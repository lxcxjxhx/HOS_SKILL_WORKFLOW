# Architecture — S-16-HOS-CAD-Builder

## System Overview

HOS-CAD-Builder is a multi-stage pipeline that converts natural language descriptions into production-ready 3D CAD files via the build123d Python library.

## Pipeline Stages

### Stage 1: Spec Planner (`src/planners/spec-planner.ts`)

**Input**: Natural language prompt  
**Output**: `CADBrief` (structured specification)

Responsibilities:
- Shape classification (box, cylinder, sphere, cone, extrusion, revolve, loft, sweep)
- Dimension extraction with unit conversion (mm, cm, m, inch)
- Feature detection (holes, fillets, chamfers, slots, shells, patterns, mirrors)
- Material identification (plastic, aluminum, steel, titanium, brass, wood, rubber)
- Manufacturing method detection (3D print, CNC, injection mold, sheet metal)

### Stage 2: Geo Architect (`src/planners/geo-architect.ts`)

**Input**: `CADBrief`  
**Output**: `GeoOperation[]` (ordered operation sequence)

Responsibilities:
- Map shape + dimensions to base geometric operation
- Map each `CADFeature` to one or more `GeoOperation`s
- Order operations for build123d compatibility

### Stage 3: Code Generator (`src/planners/code-generator.ts`)

**Input**: `GeoOperation[]`  
**Output**: Python source code (build123d)

Responsibilities:
- Emit build123d Python code for each operation
- Generate export wrapper for file output
- Include measurement hooks (volume, surface area, bounding box)

### Stage 4: Python Bridge (`src/execution/python-bridge.ts`)

**Input**: Python source code  
**Output**: `PythonExecutionResult` (file paths, measurements)

Responsibilities:
- Write code to temporary file
- Spawn Python subprocess
- Parse stdout/stderr for file paths and measurements
- Timeout management

## Component Diagram

```
                    ┌──────────────────┐
                    │   MCP Server     │
                    │   (server.ts)    │
                    └────────┬─────────┘
                             │ tool calls
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ generate │  │  modify  │  │  export  │
        │   tool   │  │   tool   │  │   tool   │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │              │              │
             ▼              ▼              ▼
        ┌──────────────────────────────────────┐
        │          cad-engine.ts               │
        │  (Pipeline Orchestrator)             │
        └──────────┬───────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│  Spec  │  │   Geo    │  │   Code   │
│Planner │→ │Architect │→ │Generator │
└────────┘  └──────────┘  └──────────┘
                                    │
                                    ▼
                         ┌──────────────────┐
                         │  Python Bridge   │
                         │  (subprocess)    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  build123d       │
                         │  (Python)        │
                         └──────────────────┘
```

## Data Flow

```
prompt: "100x50x30mm box with 10mm hole"
         │
         ▼
brief: { shape: "box", dimensions: {100,50,30}, features: [{type:"hole", d:10}] }
         │
         ▼
ops: [{ op: "box", params: {100,50,30} }, { op: "hole", params: {r:5, depth:50} }]
         │
         ▼
code: "with BuildPart() as part:\n  Box(100,50,30)\n  Hole(radius=5, depth=50)"
         │
         ▼
result: { stepPath: "output/model.step", volume: 146507.32, ... }
```

## Error Handling

Each pipeline stage catches errors independently and propagates them as structured results:

- **Spec Planner**: Falls back to default dimensions when parsing fails
- **Geo Architect**: Uses conservative defaults for unknown shapes
- **Code Generator**: Emits safe default code for unknown operations
- **Python Bridge**: Returns structured error with stderr content
- **Validation**: Reports individual check failures without blocking

## Extensibility

### Adding New Shapes

1. Add shape type to `CADShape` in `types.ts`
2. Add classification rules in `spec-planner.ts`
3. Add base operation mapping in `geo-architect.ts`
4. Add code emission in `code-generator.ts`

### Adding New Features

1. Add feature type to `CADFeature.type` in `types.ts`
2. Add extraction rules in `spec-planner.ts`
3. Add operation mapping in `geo-architect.ts`
4. Add code emission in `code-generator.ts`

### Adding Export Formats

1. Add format to `ExportFormat` type
2. Add handler in `python/cad_engine.py` EXPORTERS dict
3. Add format option to `generate.ts` and `export.ts` tools
