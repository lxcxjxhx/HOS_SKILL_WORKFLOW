---
name: HOS-JSON-Prompts
description: "Structured prompt engineering framework with JSON templates for generating standardized, reusable AI prompts across diverse scenarios including articles, exams, projects, security, and operations."
version: 1.0.0
author: HOS
tags:
  - prompt-engineering
  - json-templates
  - structured-output
  - ai-writing
category: prompt-engineering
risk-level: low
confidence: 0.85
---

# 🎯 JSON Structured Prompts Framework

## Overview

A comprehensive prompt engineering framework that uses JSON templates to generate standardized, reusable AI prompts. This system provides 15 specialized templates covering diverse scenarios from article writing to security auditing, enabling consistent and high-quality AI output across different use cases.

## Core Concepts

### 1. Adaptive Instructions

The framework employs adaptive instruction methodology that dynamically adjusts prompt structure based on user requirements:

- **Dynamic Restructuring**: Templates serve as reference frameworks, not rigid output structures
- **Semantic Reconstruction**: Prioritizes reorganizing content based on user input rather than copying template fields
- **Flexible Module Management**: Allows deletion, reordering, or replacement of modules to fit specific scenarios
- **User-Centric Priority**: When templates conflict with user needs, user requirements take highest priority

### 2. Template Structure

Each JSON template follows a standardized structure:

```json
{
  "adaptive_instruction": [...],
  "prompt": {
    "title": "...",
    "author": "...",
    "role": "...",
    "core_constraints": [...],
    "generation_strategy": {...},
    "writing_standards": {...},
    "file_management": {...},
    "final_goal": "..."
  }
}
```

Key components:
- **Role Definition**: Clear AI role and core capabilities
- **Core Constraints**: Input source limitations and originality requirements
- **Generation Strategy**: Planning and execution steps
- **Writing Standards**: Style, structure, and formatting guidelines
- **File Management**: Output organization and versioning rules

### 3. Writing Standards

All templates enforce consistent writing standards:

- **Audience**: AI engineers, prompt developers, product managers
- **Style**: Objective, concise, zero redundancy, logical progression
- **Structure**: Standardized sections (Role, Constraints, Strategy, Output Standards, Content Requirements, File Management)
- **Length**: Moderate (500-2000 words)
- **Elements**: ≥2 example code blocks or tables
- **Format**: JSON nested or Markdown compatible

## File Structure

```
W-02-HOS-JSON-Prompts/
├── AAA-develop-template.json          # Master template with adaptive instructions
├── develop-article.json               # Article writing template
├── develop-article-code.json          # Article with code examples template
├── develop-auto-skill.json            # Automated skill generation template
├── develop-exam.json                  # General exam/quiz template
├── develop-exam-CT.json               # CT (Capture The Flag) exam template
├── develop-exam-SG.json               # SG exam template
├── develop-merged.json                # Merged multi-purpose template
├── develop-model.json                 # Model development template
├── develop-operations.json            # Operations workflow template
├── develop-operations-report.json     # Operations report template
├── develop-project.json               # Project management template
├── develop-security.json              # Security audit template
├── develop-test.json                  # Testing template
└── develop-token-save.json            # Token optimization template
```

## Usage Guide

### Basic Usage

1. **Select Template**: Choose the appropriate JSON template based on your use case
2. **Customize Input**: Provide your scenario description as the primary input source
3. **Generate Prompt**: Use the template structure to generate a standardized prompt
4. **Iterate**: Refine based on output quality and specific requirements

### Template Selection Guide

| Template | Use Case | Key Features |
|----------|----------|--------------|
| `AAA-develop-template.json` | Master reference | Complete framework with all components |
| `develop-article.json` | Content writing | Article structure, SEO optimization |
| `develop-article-code.json` | Technical articles | Code examples integration |
| `develop-auto-skill.json` | Skill automation | Automated workflow generation |
| `develop-exam.json` | General assessments | Quiz/exam generation |
| `develop-exam-CT.json` | CTF challenges | Security competition format |
| `develop-exam-SG.json` | SG assessments | Specialized exam format |
| `develop-merged.json` | Multi-purpose | Combined template for flexible use |
| `develop-model.json` | Model development | AI/ML model training prompts |
| `develop-operations.json` | Operations | Operational workflow automation |
| `develop-operations-report.json` | Reporting | Operations report generation |
| `develop-project.json` | Project management | Project planning and tracking |
| `develop-security.json` | Security | Security audit and assessment |
| `develop-test.json` | Testing | Test case generation |
| `develop-token-save.json` | Optimization | Token-efficient prompt design |

### Best Practices

1. **Start with Master Template**: Use `AAA-develop-template.json` as reference for understanding the framework
2. **Adapt, Don't Copy**: Treat templates as frameworks, not rigid structures
3. **Focus on User Input**: Primary content should come from user scenario descriptions
4. **Maintain Standards**: Follow writing standards for consistency
5. **Iterate and Refine**: Continuously improve templates based on output quality

## Integration with HOS Ecosystem

This framework integrates with other HOS components:

- **HOS-Sec-Engine**: Security validation for generated prompts
- **HOS-Vibe-Guard**: Quality assessment and template trap detection
- **HOS-Silly-Mock**: Prevention of fake data patterns in generated content

## License

MIT
