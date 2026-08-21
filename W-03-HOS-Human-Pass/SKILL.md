---
name: HOS-Human-Pass
description: "人机验证通行技能 — 安全测试中的人机识别与验证机制研究"
version: "0.1.0"
author: "HOS"
tags:
  - human-verification
  - captcha
  - security-testing
  - bot-detection
category: "security-testing"
risk-level: medium
confidence: 0.70
---

# HOS-Human-Pass

## Overview

HOS-Human-Pass is a security testing skill focused on human verification mechanisms and bot detection systems. This skill provides comprehensive analysis of CAPTCHA systems, behavioral biometrics, device fingerprinting, and risk control assessment to help security teams evaluate and improve their human verification defenses.

**Purpose**: Research and test human verification mechanisms in security contexts, helping organizations understand their bot detection capabilities and identify potential vulnerabilities.

## Core Capabilities

### 1. CAPTCHA Analysis

Comprehensive analysis of various CAPTCHA systems and their effectiveness:

- **Text-based CAPTCHA**: OCR resistance testing, character segmentation analysis, distortion effectiveness evaluation
- **Image-based CAPTCHA**: Image recognition testing, object detection capabilities, visual puzzle analysis
- **reCAPTCHA v2/v3**: Token analysis, behavior scoring evaluation, cookie/session examination
- **hCaptcha**: Challenge difficulty assessment, privacy-focused verification testing
- **Custom CAPTCHA Systems**: Proprietary system analysis, weakness identification, bypass feasibility assessment

**Analysis Metrics**:
- Solve time distribution
- Success rate across different attack vectors
- Resource consumption (CPU/GPU/memory)
- Scalability of automated solving approaches

### 2. Behavioral Analysis

Advanced behavioral biometrics analysis to distinguish humans from bots:

- **Mouse Movement Patterns**: Trajectory analysis, speed variation, acceleration curves, micro-movements
- **Keyboard Dynamics**: Keystroke timing, typing rhythm, pressure patterns (where available)
- **Touch Gestures**: Swipe patterns, tap pressure, multi-touch behavior (mobile)
- **Scroll Behavior**: Scroll speed, direction changes, momentum patterns
- **Navigation Patterns**: Page transition timing, click sequences, interaction flow

**Detection Evasion Testing**:
- Behavioral pattern simulation
- Machine learning model fingerprinting
- Temporal pattern analysis
- Anomaly detection bypass techniques

### 3. Device Fingerprinting

Comprehensive device fingerprint analysis and evasion testing:

- **Browser Fingerprinting**: Canvas fingerprint, WebGL rendering, AudioContext analysis, font enumeration
- **Hardware Fingerprint**: Screen resolution, GPU information, CPU characteristics, battery API
- **Network Fingerprint**: IP reputation, proxy/VPN detection, TLS fingerprinting, HTTP/2 fingerprint
- **Storage Fingerprint**: LocalStorage, SessionStorage, IndexedDB, Cookie behavior
- **Plugin/Extension Detection**: Installed plugin enumeration, extension fingerprinting

**Evasion Techniques**:
- Fingerprint randomization
- Browser profile spoofing
- Virtual environment detection bypass
- Anti-detection browser testing (Puppeteer, Playwright, Selenium)

### 4. Risk Control Assessment

Evaluation of risk control systems and decision engines:

- **Risk Scoring Models**: Analysis of risk calculation algorithms, weight distribution, threshold tuning
- **Decision Engine Testing**: Rule-based system analysis, ML model inference, ensemble method evaluation
- **Session Analysis**: Session validity checking, anomaly detection, session hijacking resistance
- **Rate Limiting**: Throttling effectiveness, distributed attack resistance, adaptive limiting
- **Geolocation Verification**: IP geolocation accuracy, GPS spoofing detection, timezone consistency

**Assessment Areas**:
- False positive/negative rates
- Adaptive threshold effectiveness
- Real-time decision latency
- Attack vector coverage

## File Structure

```
W-03-HOS-Human-Pass/
├── SKILL.md                      # Skill metadata (this file)
├── README.md                     # Project documentation
├── src/
│   ├── captcha/
│   │   ├── text_captcha.py       # Text-based CAPTCHA analysis
│   │   ├── image_captcha.py      # Image CAPTCHA testing
│   │   ├── recaptcha.py          # reCAPTCHA v2/v3 analysis
│   │   ├── hcaptcha.py           # hCaptcha testing
│   │   └── custom_captcha.py     # Custom system analysis
│   ├── behavioral/
│   │   ├── mouse_analysis.py     # Mouse movement patterns
│   │   ├── keyboard_dynamics.py  # Keystroke timing analysis
│   │   ├── touch_gestures.py     # Touch gesture analysis
│   │   └── scroll_behavior.py    # Scroll pattern analysis
│   ├── fingerprint/
│   │   ├── browser_fp.py         # Browser fingerprinting
│   │   ├── hardware_fp.py        # Hardware fingerprinting
│   │   ├── network_fp.py         # Network fingerprinting
│   │   └── evasion.py            # Fingerprint evasion techniques
│   ├── risk_control/
│   │   ├── risk_scoring.py       # Risk scoring analysis
│   │   ├── decision_engine.py    # Decision engine testing
│   │   ├── session_analysis.py   # Session security analysis
│   │   └── rate_limiting.py      # Rate limiting assessment
│   └── utils/
│       ├── http_client.py        # HTTP client utilities
│       ├── browser_automation.py # Browser automation helpers
│       └── data_collector.py     # Data collection utilities
├── tests/
│   ├── test_captcha.py           # CAPTCHA analysis tests
│   ├── test_behavioral.py        # Behavioral analysis tests
│   ├── test_fingerprint.py       # Fingerprinting tests
│   └── test_risk_control.py      # Risk control tests
├── config/
│   ├── targets.yaml              # Target configurations
│   └── detection_rules.yaml      # Detection rule definitions
└── reports/
    └── assessment_template.md    # Assessment report template
```

## Usage Guide

### Prerequisites

- Python 3.8+
- Required packages: `requests`, `selenium`, `playwright`, `numpy`, `scikit-learn`
- Browser drivers (ChromeDriver, GeckoDriver) for automation testing

### Installation

```bash
# Install dependencies
pip install requests selenium playwright numpy scikit-learn Pillow

# Install browser binaries
playwright install
```

### Basic Usage

#### CAPTCHA Analysis

```python
from src.captcha import text_captcha, image_captcha, recaptcha

# Analyze text-based CAPTCHA
text_result = text_captcha.analyze(
    target_url="https://example.com/captcha",
    sample_count=100
)

# Test image CAPTCHA
image_result = image_captcha.analyze(
    target_url="https://example.com/image-captcha",
    attack_vectors=["ocr", "ml_recognition", "segmentation"]
)

# Evaluate reCAPTCHA v3
recaptcha_result = recaptcha.analyze_v3(
    site_key="your-site-key",
    action="login",
    min_score=0.5
)
```

#### Behavioral Analysis

```python
from src.behavioral import mouse_analysis, keyboard_dynamics

# Analyze mouse movement patterns
mouse_result = mouse_analysis.collect_patterns(
    session_duration=300,  # 5 minutes
    sample_interval=0.01   # 10ms
)

# Test keyboard dynamics
keyboard_result = keyboard_dynamics.analyze_typing(
    text_samples=["sample1", "sample2"],
    detect_rhythm=True
)
```

#### Device Fingerprinting

```python
from src.fingerprint import browser_fp, evasion

# Collect browser fingerprint
fingerprint = browser_fp.collect_fingerprint(
    browser="chrome",
    include_canvas=True,
    include_webgl=True,
    include_audio=True
)

# Test fingerprint evasion
evasion_result = evasion.test_randomization(
    fingerprint=fingerprint,
    iterations=100
)
```

#### Risk Control Assessment

```python
from src.risk_control import risk_scoring, decision_engine

# Analyze risk scoring model
risk_result = risk_scoring.analyze_model(
    target_url="https://example.com/api/risk",
    test_cases="config/test_cases.yaml"
)

# Test decision engine
decision_result = decision_engine.test_rules(
    rule_set="config/detection_rules.yaml",
    simulate_attacks=True
)
```

### Configuration

#### Target Configuration (targets.yaml)

```yaml
targets:
  - name: "example_login"
    url: "https://example.com/login"
    captcha_type: "recaptcha_v3"
    site_key: "6Le..."
    rate_limit: 10  # requests per minute
    
  - name: "example_signup"
    url: "https://example.com/signup"
    captcha_type: "hcaptcha"
    behavioral_analysis: true
    fingerprint_check: true
```

#### Detection Rules (detection_rules.yaml)

```yaml
detection_rules:
  mouse_patterns:
    - name: "linear_movement"
      threshold: 0.8
      action: "flag"
    - name: "instant_teleport"
      max_time_ms: 50
      action: "block"
      
  fingerprint_changes:
    - name: "canvas_change"
      check_interval: 60
      action: "alert"
```

### Assessment Report

Generate comprehensive assessment reports:

```python
from src.utils import report_generator

report = report_generator.generate_assessment(
    target="example_login",
    captcha_results=text_result,
    behavioral_results=mouse_result,
    fingerprint_results=fingerprint,
    risk_results=risk_result,
    output_format="markdown"
)

# Save report
with open("reports/assessment_example_login.md", "w") as f:
    f.write(report)
```

## Testing Methodology

### 1. Baseline Assessment

- Document current verification mechanisms
- Identify all protection layers
- Establish baseline metrics

### 2. Attack Simulation

- Automated solving attempts
- Behavioral pattern simulation
- Fingerprint manipulation
- Distributed attack testing

### 3. Vulnerability Analysis

- Identify weak points
- Calculate bypass feasibility
- Assess attack scalability
- Evaluate resource requirements

### 4. Recommendation Generation

- Prioritize vulnerabilities by risk
- Suggest mitigation strategies
- Provide implementation guidance
- Estimate improvement metrics

## Ethical Considerations

**Important**: This skill is designed for **authorized security testing only**.

- ✅ Only test systems you own or have explicit permission to test
- ✅ Follow responsible disclosure practices
- ✅ Comply with applicable laws and regulations
- ✅ Document all testing activities
- ❌ Do not use for unauthorized access
- ❌ Do not disrupt production systems
- ❌ Do not violate terms of service

## Notes

- Local environment limitations, relying on CI/CD automated testing
- Some CAPTCHA systems may have rate limiting or IP blocking
- Behavioral analysis requires sufficient sample sizes for statistical significance
- Fingerprinting effectiveness varies by browser and platform
- Risk control assessment may require access to internal systems for full analysis
