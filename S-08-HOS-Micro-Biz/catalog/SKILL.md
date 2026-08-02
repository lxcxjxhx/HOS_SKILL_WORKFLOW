# Service Catalog Design

## Pricing Formula

```
Base Quote = Estimated Hours x Hourly Rate x Difficulty Coeff x Urgency Coeff

Hourly Rate Reference:
  - Coursework / simple scripts: 50-80 CNY/h
  - Thesis / medium projects: 80-150 CNY/h
  - AI apps / security audits: 150-300 CNY/h
  - Architecture consulting: 300-500 CNY/h

Difficulty Coefficient:
  - Simple (template/config): 1.0
  - Medium (business logic): 1.3
  - Hard (research/innovation): 1.8
  - Expert (cutting-edge/complex): 2.5

Urgency Coefficient:
  - Normal (>= 3 days): 1.0
  - Rush (1-3 days): 1.5
  - Emergency (< 24h): 2.0
```

## Service Layering Model

| Tier | Examples | Purpose |
|------|----------|---------|
| Loss Leaders | Free 5-min consultation, 9.9 CNY tutorial | Build trust, filter leads |
| Standard | Coursework, debugging, docs, env setup | Stable cash flow |
| Profit | Full thesis guidance, AI apps, security audit | High unit price |
| Premium | Enterprise security advisor, architecture consult | Brand elevation |

## Service Menu

### Programming
| Service | Starting Price | Delivery |
|---------|---------------|----------|
| Code Debugging | 30 CNY | 1-24h |
| Coursework Guidance | 200 CNY | 3-7 days |
| Full Thesis | 800 CNY | 2-8 weeks |
| Scripts/Tools | 100 CNY | 1-3 days |
| Website Dev | 500 CNY | 3-14 days |
| Mini-Program | 1000 CNY | 7-30 days |

### AI Services
| Service | Starting Price | Delivery |
|---------|---------------|----------|
| Model Deployment | 200 CNY | 1-3 days |
| Prompt Engineering | 100 CNY | 1-3 days |
| RAG System | 500 CNY | 3-7 days |
| Data Analysis | 300 CNY | 2-5 days |
| AI App Dev | 1000 CNY | 7-30 days |

### Information Security
| Service | Starting Price | Delivery |
|---------|---------------|----------|
| CTF Coaching | 50 CNY/problem | Immediate |
| Penetration Testing | 500 CNY | 3-7 days |
| Security Hardening | 300 CNY | 1-3 days |
| Compliance Consulting | 1000 CNY | Per project |

### CS Fundamentals
| Service | Starting Price | Delivery |
|---------|---------------|----------|
| Algorithm Tutoring | 50 CNY/hour | Immediate |
| Lab Coaching | 80 CNY | 1-2 days |
| Exam Prep (408) | 100 CNY/hour | By appointment |