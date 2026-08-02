# Implementation Guide: Real-World Skill Application

This guide shows how to apply the four-skill system to actual projects with concrete examples.

---

## Part 1: New Project - Full ANPE + TFE Implementation

### Scenario
Starting a new e-commerce service (order management system).

### Timeline: Day 1 (4-6 hours)

#### Step 1: Project Structure (ANPE Principle 1)
Create `project.yaml` — single source of truth:

```yaml
# project.yaml
project:
  name: order-service
  version: 0.1.0
  description: Order management and fulfillment service
  aiNative: true

models:
  default: claude-haiku-4.5
  reasoning: claude-opus

api:
  baseUrl: http://localhost:3000
  timeout: 30s
  retries: 3

database:
  type: postgres
  host: ${env:DB_HOST}
  port: ${env:DB_PORT}
  name: orders_db

cache:
  type: redis
  host: ${env:REDIS_HOST}

workflows:
  orderCreation: config/workflows/order-creation.yaml
  orderFulfillment: config/workflows/fulfillment.yaml
  orderCancellation: config/workflows/cancellation.yaml

agents:
  orderProcessor: agents/order-processor.yaml
  notificationSender: agents/notification.yaml
```

**TFE Token Cost**: 500 tokens
**ANPE Benefit**: Every tool, config, workflow now discoverable in single file.

#### Step 2: Configuration-Driven Rules (ANPE Principle 2)
Create `config/discount-rules.yaml`:

```yaml
# config/discount-rules.yaml
rules:
  - id: bulk_order
    name: "Bulk Order Discount"
    condition: "order.quantity > 100"
    discount: 0.15
    priority: 10
    enabled: true

  - id: returning_customer
    name: "Returning Customer"
    condition: "customer.orders_count > 5"
    discount: 0.1
    priority: 9
    enabled: true

  - id: seasonal_sale
    name: "Seasonal Promotion"
    condition: "now() in [2026-12-01, 2026-12-31]"
    discount: 0.25
    priority: 11
    enabled: true
```

**TFE Token Cost**: 300 tokens
**Benefit**: Business team can enable/disable discounts without code changes.

#### Step 3: Reusable Prompts (ANPE Principle 3)
Create `prompts/order-processing.md`:

```markdown
# Order Processing Prompt

## Context
You are processing customer orders for an e-commerce platform.
Your responsibility is ensuring accuracy and compliance with business rules.

## Instructions
1. Validate order structure (customer, items, quantities)
2. Check inventory availability
3. Calculate discount based on config/discount-rules.yaml
4. Generate order ID and confirmation
5. Emit event to fulfillment queue

## Output Format
- **status**: success | validation_error | inventory_error
- **orderId**: unique identifier
- **discount**: applied discount percentage
- **finalTotal**: calculated total after discount
- **event**: JSON for fulfillment queue

## Constraints
- Order must have at least 1 item
- Quantity must be positive integer
- Customer must have valid payment method
- Discount cannot exceed 100%

## Success Criteria
- All validations passed
- Discount applied correctly per rules
- Event emitted to queue
- No data loss
```

**TFE Token Cost**: 400 tokens
**Benefit**: Clear, testable instructions for AI agents or developers.

#### Step 4: Skill Assets (ANPE Principle 4)
Create `skills/backend.skill` (or reference existing):

```markdown
# Backend Development Skill

## When to Use
- Implementing API endpoints
- Creating database queries
- Writing business logic

## Core Patterns

### API Endpoint Pattern
```javascript
// Structure: validation → logic → response
exports.create = async (req, res) => {
  try {
    // 1. Validate input
    const errors = validate(req.body);
    if (errors) return res.status(400).json(errors);
    
    // 2. Execute business logic
    const result = await service.process(req.body);
    
    // 3. Return response
    return res.status(201).json(result);
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
```

### Database Query Pattern
- Use parameterized queries (prevent SQL injection)
- Always handle errors
- Return consistent response format

## Common Mistakes
- ❌ Forgetting error handling
- ❌ Hard-coding business logic (use config instead)
- ❌ Mixing validation + business logic
- ✓ Separate concerns clearly
```

**TFE Token Cost**: 600 tokens
**Benefit**: Team expertise documented, AI knows patterns.

#### Step 5: Knowledge Assets (ANPE Principle 5)
Create `knowledge/architecture.md`:

```markdown
# Order Service Architecture

## Components

### API Server
- Port: 3000
- Framework: Express.js
- Responsibilities: Request routing, validation

### Order Service
- Responsibilities: Order processing, business logic
- Dependencies: Database, Redis, Queue

### Notification Service
- Responsibilities: Send emails/SMS about order status
- Trigger: Messages from order.events queue

### Database (PostgreSQL)
- Tables: orders, customers, items, payments

### Redis
- Session cache (2h TTL)
- Discount rule cache (1d TTL)

## Data Flow
Order Submission → Validation → Rule Application → Database → Queue → Fulfillment
```

**TFE Token Cost**: 400 tokens
**ANPE Benefit**: AI understands architecture without reading code.

#### Step 6: AI-First Module Documentation (ANPE Principle 6)
Create `src/order/README.md`:

```markdown
# Order Module

## Purpose
Manages order creation, validation, and state transitions.

## Input
```json
{
  "customerId": "uuid",
  "items": [
    { "sku": "string", "quantity": "number" }
  ],
  "shippingAddress": "object",
  "paymentMethod": "string"
}
```

## Output
```json
{
  "orderId": "uuid",
  "status": "pending",
  "totalAmount": 99.99,
  "discount": 0.15,
  "finalAmount": 84.99,
  "createdAt": "2026-06-13T..."
}
```

## Dependencies
- `src/validators/` — Input validation
- `src/rules/` — Business rule engine
- `src/database/` — Data persistence
- `config/discount-rules.yaml` — Discount configuration

## Risks & Mitigations
- **Risk**: Duplicate order submission
  - **Mitigation**: Idempotency key in request header
- **Risk**: Race condition on inventory
  - **Mitigation**: Database-level locks
```

**TFE Token Cost**: 300 tokens
**ANPE Benefit**: AI knows exactly how to use this module.

### Day 1 Summary

**Total ANPE setup cost**: 2.5K tokens (one-time)
**Token saved per feature**: 5K tokens avg (TFE applied to each task)
**Break-even**: After 1st feature (one-time cost amortized)

Result:
- ✅ Project.yaml centralizes configuration
- ✅ Rules are configuration-driven
- ✅ Prompts are reusable
- ✅ Skills document team patterns
- ✅ Knowledge captures architecture
- ✅ Modules are self-documenting

**AI agents can now join and be productive in <30 minutes.**

---

## Part 2: Adding a Feature - TFE in Action

### Scenario
Add "subscription discount" feature to existing ANPE project.

### Process

#### Step 1: Token Estimation (TFE Foundation)

**Before writing code**, output:

```
## Token Assessment: Subscription Discount Feature

**Target**: Add 5% automatic discount for subscribed customers
**Input**: Customer object with subscription status
**Output**: Discount percentage applied to order total
**Constraints**: 
  - Discount only applies if subscription active
  - Cannot combine with other discounts (use max)
  - Must be stored in discount-rules.yaml for future changes

**Token Estimate**: 3.8K tokens
  - Add rule to config/discount-rules.yaml: 200 tokens
  - Update order service: 1.5K tokens
  - Write tests: 1.2K tokens
  - Update documentation: 900 tokens

**Complexity**: Simple (configuration change + single logic update)
**Maintenance Cost**: Low (configuration-driven, no special code)
**Refactor Cost**: Low (isolated to order service)

**Action Plan**:
1. Add subscription_discount rule to config (100 tokens)
2. Read existing discount application code (200 tokens)
3. Add subscription check to rule evaluation (800 tokens)
4. Write test case (600 tokens)
5. Update README.md (300 tokens)
```

**Token saved vs. traditional**: 6.5K → 3.8K (42% reduction)

#### Step 2: Implementation

**Add to config/discount-rules.yaml**:
```yaml
- id: subscription_discount
  name: "Active Subscription"
  condition: "customer.subscription && customer.subscription.active"
  discount: 0.05
  priority: 8
  enabled: true
```

**Update src/order/applyDiscounts.js** (TFE principle: minimal code):
```javascript
async function applyDiscounts(order, customer) {
  const applicableRules = rules.rules
    .filter(r => evaluateCondition(r.condition, { order, customer }))
    .sort((a, b) => b.priority - a.priority);
  
  return applicableRules[0]?.discount ?? 0;
}
```

**Result**: No code duplication. New discount works automatically. Change deployment time: 0 (just config update).

#### Step 3: Testing (TFE Cost Minimization)

Instead of 10+ test cases, write 3 focused ones:
```javascript
test('applies subscription discount', async () => {
  const customer = { subscription: { active: true } };
  const discount = await applyDiscounts({}, customer);
  expect(discount).toBe(0.05);
});

test('does not apply if subscription inactive', async () => {
  const customer = { subscription: { active: false } };
  const discount = await applyDiscounts({}, customer);
  expect(discount).toBe(0);
});

test('subscription discount prioritized correctly', async () => {
  const customer = { 
    subscription: { active: true },
    orders_count: 100  // Also qualifies for returning customer
  };
  const discount = await applyDiscounts({}, customer);
  expect(discount).toBe(0.05);  // subscription (priority 8) beats returning (priority 9)
});
```

**Cost**: 400 tokens (TFE: focused tests, not exhaustive)

#### Step 4: Documentation (ANPE + TFE)

**Update** `src/order/README.md` to document new field:
```markdown
## Input
```json
{
  ...
  "customer": {
    "id": "uuid",
    "subscription": {
      "active": true,
      "plan": "pro"
    }
  }
}
```

**Update** `knowledge/architecture.md` to note new rule:
- See config/discount-rules.yaml for all discount rules
- Subscription discount priority: 8
```

**Cost**: 200 tokens

### Feature Summary
- **Total tokens**: 3.8K
- **Time**: 45 minutes
- **Deployment**: Update config/discount-rules.yaml (no code recompile)
- **Risk**: Extremely low (configuration change only)

**Benefit of ANPE + TFE**: Feature deployment without touching core code.

---

## Part 3: Legacy Takeover - MRA + TFE Process

### Scenario
Taking over 5-year-old payment service (1800 lines, constantly breaking).

### Phase 1: System Mapping (MRA)

Use git history, not code reading:

```bash
# Find most-modified files
git log --oneline --all -- src/payment/ | \
  sed 's/.*src\/payment\/\([^ ]*\).*/\1/' | \
  sort | uniq -c | sort -rn | head -20

# Result:
# 42 processor.js
# 31 gateway.js
# 18 transaction.js
# 12 refund.js
```

**Hotspot identified**: processor.js (42 recent commits)

**Dependencies**:
```bash
grep -r "require.*processor\|import.*processor" src/ | wc -l
# Result: 7 files depend on processor.js
```

**Token cost**: 300 tokens (git history, no code reading)

### Phase 2: Hotspot Analysis (MRA)

```bash
# Bug frequency
git log --oneline --all --grep="payment.*fix\|bug.*payment" | wc -l
# Result: 12 bugs in last 12 months

# Modification frequency per month
git log --since="12 months ago" --oneline --all -- src/payment/processor.js | wc -l
# Result: 42 commits / 12 months = 3.5 per month
```

**Decision**: 🔴 CRITICAL hotspot (high change + high bugs)

**Token cost**: 200 tokens (git analysis)

### Phase 3: Core Path Identification

```
Payment flow (critical):
Order → Payment submission → Stripe API → Payment recorded → Fulfillment

Current failures:
- Duplicate charges (race condition)
- Timeout on Stripe → lost transaction record
- Refund processing hangs

Impact: $50K/month lost revenue when broken
```

**Token cost**: 300 tokens (business stakeholder conversation)

### Phase 4: Refactoring Strategy (MRA + TFE)

**Decision**: Use strangler pattern (not full rewrite)

```
Week 1: Build PaymentProcessorV2 parallel
  - New code: 400 lines (clean implementation)
  - Using TFE: minimize scope

Week 2: Feature flag, canary rollout
  - 5% traffic to V2
  - Monitor for 3 days

Week 3: Full migration
  - 100% traffic to V2
  - Keep V1 as fallback

Week 4: Decommission
  - Archive V1
  - Remove from production
```

**Token cost estimation** (TFE):
```
Analysis: 2K tokens
Build V2: 8K tokens
Testing: 4K tokens
Canary deployment: 2K tokens
─────────────────
Total: 16K tokens

Alternative (rewrite entire service): 120K tokens
Savings: 104K tokens (87% reduction)
```

### Phase 5: Compatibility Guarantee

**Old API** (`src/payment/processor.js`):
```javascript
function processPayment(order, callback) {
  // 1800 lines of messy code
  // Callback with (error, result)
}
```

**New implementation** maintains exact interface:
```javascript
// src/payment/processorV2/processor.js (clean, 400 lines)
async function processPaymentAsync(order) {
  // Clean implementation
  return { transactionId, status, amount };
}

// Compatibility wrapper (keep old API working)
function processPayment(order, callback) {
  processPaymentAsync(order)
    .then(result => callback(null, result))
    .catch(error => callback(error));
}
```

**Result**: All existing code keeps working while new code is clean.

**Token cost**: 1.2K tokens (compatibility layer)

### Legacy Takeover Summary

**Total MRA cost**: 800 tokens (mapping + analysis)
**Total TFE cost**: 16K tokens (implementation)
**Total refactor cost**: 16.8K tokens

**Compare to**:
- Full rewrite: 120K tokens + 4 weeks + high risk
- Minimal refactor: 16.8K tokens + 3 weeks + low risk

**Savings**: 103K tokens (87% reduction)

---

## Part 4: Large System Optimization - CCE Implementation

### Scenario
Mature platform: 8 microservices, 150K lines total, 15+ engineers, slow modifications.

### Problem
New engineer joins → doesn't know system → spends 2 weeks reading code → still gets architecture wrong.
AI agent joins → reads entire codebase (100K+ tokens) → makes mistakes because misunderstands relationships.

### Solution: Create CCE Maps (One-time, 50K tokens)

#### Step 1: Architecture Map
Create `knowledge/architecture-map.md` (5K tokens):
- 8 microservices and their responsibilities
- Dependencies between services
- Data layer (3 databases, 2 caches)
- Critical paths (login, payment, order)
- Failure modes
- Scaling strategy

**Takes**: 4-6 hours
**Benefit**: New person reads this → understands entire system in 20 min

#### Step 2: Interface Map
Create `knowledge/interface-map.md` (10K tokens):
- All 200+ API endpoints
- Request/response schemas
- Error codes and meanings
- Database schema for 50+ tables
- Authentication flow
- Rate limiting rules

**Takes**: 6-8 hours
**Benefit**: Developer knows API contract without reading 15 microservices

#### Step 3: Workflow Map
Create `knowledge/workflow-map.md` (7K tokens):
- 12 critical business workflows
- State machines for each
- Queue/event relationships
- Code location references
- Async/sync decision points

**Takes**: 4-5 hours
**Benefit**: New feature implementation is 3x faster

### CCE ROI Analysis

**One-time cost**: 50K tokens + 15 hours
**Per new engineer**: Read maps (30 min) + onboarding (2 days) = instead of 2 weeks
**Per modification**: 
- Without CCE: Read codebase (15K tokens) + implement (10K) = 25K tokens
- With CCE: Reference maps (2K tokens) + implement (10K) = 12K tokens
- Savings per modification: 13K tokens

**Break-even**: After 4 modifications (52K tokens saved)
**Team of 15 engineers, 10 modifications/year**: 15 × 10 × 13K = 1.95M tokens saved/year

---

## Part 5: Integrated Workflow - All Four Skills Together

### Scenario
Building a new SaaS product with 10-person team, expecting to scale to 100K+ LOC in 12 months.

### Timeline

**Month 1: Foundation (ANPE + TFE)**
- Create project.yaml, config/, prompts/, skills/, knowledge/ (ANPE)
- Build first 3 features with TFE token budgeting
- Establish development practices

**Cost**: 30K tokens
**Result**: Foundation for scale

**Months 2-6: Growth (ANPE + TFE + MRA light)**
- Add 20+ features following ANPE + TFE
- Maintain config-driven architecture
- When bugs appear: Quick MRA hotspot analysis before fixing

**Cost**: 80K tokens (20 features × 4K avg, TFE optimized)
**Result**: Clean, configurable system

**Months 7-9: Scale (Add CCE)**
- Codebase approaches 80K LOC
- Create Architecture/Interface/Workflow maps (50K tokens)
- On-board 3 new engineers (each reads maps in 30 min)
- Modifications now 50% cheaper (CCE reference instead of code reading)

**Cost**: 50K tokens (one-time CCE setup)
**Benefit**: Productivity increase, new engineers ramped faster

**Months 10-12: Optimize**
- Maintain ANPE structure (config-driven)
- Leverage CCE maps for quick decisions
- Apply MRA if any legacy issues appear
- Cost per modification: ~5K tokens (TFE + CCE optimization)

**Total project cost**: 30K + 80K + 50K + 30K = 190K tokens
**Traditional approach cost** (without skills): 800K+ tokens
**Savings**: 610K tokens (76% reduction)

---

## Skill Selection Flowchart for Different Scenarios

```
┌─ START ─┐
│         │
├─ Is this a NEW PROJECT?
│  ├─ YES → ANPE (setup) + TFE (every feature)
│  └─ NO → Continue
│
├─ Is this a LEGACY TAKEOVER?
│  ├─ YES → MRA (map + hotspots) + TFE (refactoring)
│  └─ NO → Continue
│
├─ Is this a BUG FIX?
│  ├─ YES → TFE (estimate) + MRA if legacy (identify hotspot)
│  └─ NO → Continue
│
├─ Is codebase >100K LOC?
│  ├─ YES → CCE (use maps) + TFE (implement)
│  └─ NO → TFE only
│
├─ Am I optimizing AI agents?
│  ├─ YES → ANPE (config-driven) + TFE (efficient) + CCE (for scale)
│  └─ NO → Use selected skill(s)
│
└─ PROCEED with skill(s)
```

---

## Measurement & Success Metrics

Track these metrics to validate skill effectiveness:

| Metric | Before Skills | After Skills | Goal |
|--------|--------------|-------------|------|
| **Tokens per feature** | 15K | 5K | <5K |
| **Feature time to code** | 8 hours | 3 hours | <3h |
| **Bug fix time** | 6 hours | 2 hours | <2h |
| **New engineer onboarding** | 2 weeks | 2 days | 1 day |
| **Architecture misunderstanding** | 40% | 5% | <5% |
| **Code review cycles** | 4 rounds | 1 round | <1 round |
| **Refactoring scope creep** | 50% | 10% | <10% |
| **Production incidents** | 3/month | 1/month | <1/month |

---

## Conclusion

The four skills work together to create a comprehensive optimization system:

1. **TFE** = Foundation (minimize costs per task)
2. **ANPE** = Structure (prepare for scale)
3. **MRA** = Handle legacy (surgical fixes)
4. **CCE** = Manage scale (keep costs low at 100K+ LOC)

Apply them incrementally, measure results, and watch your development costs decrease while team productivity and code quality increase.

**The goal: Sustainable software that gets cheaper to maintain over time, not more expensive.**
