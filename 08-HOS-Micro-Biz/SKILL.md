# HOS-Micro-Biz: Micro-Business Tech Service Operations Skill

> A complete skill system for operating tech services on WeChat Moments, social groups, Xianyu (Idle Fish), Xiaohongshu, and other micro-business/private domain platforms — covering service design, pricing, customer acquisition copywriting, client communication SOP, order management, and delivery.

---

## Overview

```
+------------------------------------------------------+
|                  HOS-Micro-Biz                        |
|       Micro-Business Tech Service Operations          |
+------------------------------------------------------+
|                                                      |
|  +----------+  +----------+  +----------+            |
|  | catalog  |  | marketing|  |templates |            |
|  | Service  |  | Customer |  | Comm SOP |            |
|  | & Pricing|  | Acquisition| | & Scripts|            |
|  +----------+  +----------+  +----------+            |
|                                                      |
|  +----------+  +----------+                          |
|  | orders   |  |compliance|                          |
|  | Order &  |  | Risk &   |                          |
|  | Finance  |  | Compliance|                          |
|  +----------+  +----------+                          |
|                                                      |
+------------------------------------------------------+
```

---

## Sub-Skills

### 1. Service Catalog Design (catalog)

**Origin**: Fully self-developed

**Core Capabilities**:
- Four-tier service layering model: Loss Leader -> Standard -> Profit -> Premium
- Four tech domains: Programming, CS Fundamentals, AI, InfoSec
- Complete service menu template with starting prices and delivery timelines
- Personalized service portfolio design based on tech stack and market demand

**Detailed docs**: [catalog/SKILL.md](catalog/SKILL.md)

---

### 2. Customer Acquisition Content (marketing)

**Origin**: Fully self-developed

**Core Capabilities**:
- WeChat Moments copywriting (case study / knowledge sharing / flash sale)
- Xianyu product listing copy (title SEO formula + description template)
- Xiaohongshu note template (seeding-based acquisition)
- Social group promotion scripts and QQ group/forum targeted campaigns
- Multi-platform content adaptation (integrates with hos-content-adapt)

**Detailed docs**: [marketing/SKILL.md](marketing/SKILL.md)

---

### 3. Client Communication SOP (templates)

**Origin**: Fully self-developed

**Core Capabilities**:
- Requirements confirmation checklist (basics / delivery / business terms)
- Full-scenario script library: initial inquiry -> clarification -> quoting -> negotiation -> delivery -> after-sales
- Pricing engine: estimated_hours x hourly_rate x difficulty_coefficient x urgency_coefficient
- Standard quote / negotiation / price-adjustment script templates

**Detailed docs**: [templates/SKILL.md](templates/SKILL.md)

---

### 4. Order Management (orders)

**Origin**: Fully self-developed

**Core Capabilities**:
- Order tracking table (ID / client / type / quote / deposit / status / deadline)
- Status flow: Confirmed -> Deposit Received -> In Progress -> Pending Review -> Completed -> After-sales
- Monthly financial summary template (income by category / expenses / net profit / avg order value / repeat rate)
- Refund policy (not started / in progress / delivered / client cancellation)

**Detailed docs**: [orders/SKILL.md](orders/SKILL.md)

---

### 5. Risk Control & Compliance (compliance)

**Origin**: Fully self-developed

**Core Capabilities**:
- Red-line list: exam cheating, paper ghostwriting, malicious attacks, cheating tools, illegal projects
- Risk prevention: compliance check, chat log retention, deposit system, written change confirmation
- After-sales scope definition (default 7-day free modification)
- Phased delivery recommendation for large orders (>2000 CNY)

**Detailed docs**: [compliance/SKILL.md](compliance/SKILL.md)

---

## Trigger Conditions

| Scenario | Activated Skill | Trigger Examples |
|----------|----------------|-----------------|
| Design service catalog | catalog | "service menu", "pricing", "what to sell" |
| Write acquisition copy | marketing | "moments post", "xianyu listing", "xiaohongshu" |
| Client communication | templates | "how to quote", "scripts", "requirements" |
| Manage orders | orders | "order tracking", "monthly summary", "revenue" |
| Compliance check | compliance | "can I take this", "red lines", "refund" |

## Skill Composition Workflows

**Scenario 1: Cold Start**
```
Service Catalog (catalog) -> Acquisition Copy (marketing) -> Client Comm (templates)
```

**Scenario 2: Steady Operations**
```
Client Inquiry -> Requirements (templates) -> Quote -> Deliver -> Record (orders) -> Monthly Review (orders)
```

**Scenario 3: Case Packaging**
```
Completed Order -> Case Study Copy (marketing) -> Multi-platform Distribution (hos-content-adapt)
```

---

## Service Domain Coverage

| Domain | Typical Services | Price Range (CNY) |
|--------|-----------------|-------------------|
| Programming | Coursework/thesis guidance, tools, scripts, websites, mini-programs | 50-5000 |
| CS Fundamentals | Algorithm tutoring, OS experiments, compiler assignments | 30-800 |
| AI | Model deployment, prompt engineering, RAG, data analysis, AI apps | 100-10000 |
| InfoSec | Penetration testing reports, hardening, CTF coaching, compliance consulting | 200-8000 |

---

## Platform Matrix

| Platform | Role | Content Format |
|----------|------|---------------|
| WeChat Moments | Core conversion | Case studies + client testimonials |
| WeChat Groups | Trust building + referrals | Tech sharing + flash deals |
| Xianyu (Idle Fish) | Public acquisition | SEO-optimized listings + loss leaders |
| Xiaohongshu | Seeding acquisition | Study notes + freelancing stories |
| QQ Groups/Forums | Student acquisition | Seasonal coursework campaigns |
| Taobao/PDD | Standardized sales | Store + review system |

---

## File Structure

```
08-HOS-Micro-Biz/
+-- SKILL.md                       # This file - skill system overview
+-- README.md                      # Quick start guide
+-- catalog/                       # Service catalog & pricing
|   +-- SKILL.md
+-- marketing/                     # Customer acquisition content
|   +-- SKILL.md
+-- templates/                     # Client communication SOP
|   +-- SKILL.md
+-- orders/                        # Order & finance management
|   +-- SKILL.md
+-- compliance/                    # Risk control & compliance
    +-- SKILL.md
```

---

## Version

- **Version**: 1.0.0
- **Created**: 2026-07-26
- **Maintainer**: HOS-Micro-Biz Team
- **License**: MIT