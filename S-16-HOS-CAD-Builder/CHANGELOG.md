# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-21

### Added

- **cad_generate** tool: Natural language → 3D CAD model generation
- **cad_modify** tool: Incremental model modification
- **cad_export** tool: Multi-format export (STEP, STL, 3MF, GLB, DXF)
- **cad_validate** tool: Printability and wall thickness validation
- **cad_parts_find** tool: Standard parts library search (7 built-in parts)
- **cad_robot_urdf** tool: URDF/SRDF robot description generation (2 templates)
- Multi-stage pipeline: Spec Planner → Geo Architect → Code Generator → Python Bridge
- Shape classification: box, cylinder, sphere, cone, extrusion, revolve, loft, sweep
- Feature extraction: holes, fillets, chamfers, slots, shells, patterns, mirrors
- Material detection: plastic, aluminum, steel, titanium, brass, wood, rubber
- Manufacturing awareness: 3D print, CNC, injection mold, sheet metal
- Unit conversion: mm, cm, m, inch
- Python subprocess bridge with timeout management
- Structured logging system
- Configuration via environment variables
- TypeScript build with full type definitions
- MCP SDK integration (stdio transport)
- CLI entry point with auto-build
- Comprehensive documentation (EN + CN)
