# CCE Five Absolute Rules - The Non-Negotiable Constraints

**Context Compression Engineering** is built on five ironclad rules. Violating ANY ONE defeats the entire system.

---

## Rule 1: Never Load the Entire Project

**The Violation**:
```
Agent: "Let me read the entire src/ folder to understand the system"
Result: 50K-100K tokens consumed in one go
Outcome: Still doesn't understand, can't proceed, tokens wasted
```

**The Correct Way**:
```
Agent: "Let me read the Architecture Map"
Result: 5K tokens, complete understanding of system structure
Outcome: Knows all components, dependencies, data layer, critical paths
```

**When This Rule Applies**: ALWAYS. 100% of the time.

**Exception**: There are NO exceptions. If you're loading entire project, you've failed CCE from the start.

**How to Enforce**:
- Before reading ANY code, ask: "Can I answer this from a map?"
- If YES → Read map instead
- If NO → Maps are incomplete, BUILD more maps first

---

## Rule 2: Never Analyze the Entire Project

**The Violation**:
```
Agent: "Let me analyze how this payment system works"
Reads: payment.js, payment.test.js, payment-types.ts, refund.js, transaction.js, ...
Result: Reading 2000+ lines of code to understand one piece
Outcome: 15K tokens, brain overload, misses key relationships
```

**The Correct Way**:
```
Agent: "Let me check the Workflow Map for payment processing"
Result: Sees state diagram: Order → Payment → Confirmation
Then reads: Only payment/processor.js (the core logic, ~200 lines)
Outcome: Precise understanding with 1/10th the tokens
```

**When This Rule Applies**: ALWAYS. When you need to understand something.

**Exception**: None. Analysis ALWAYS starts with maps, never with code.

**How to Enforce**:
- Question 1: "Is this in a map?" → Read map
- Question 2: "Which map covers this?" → Go to that map
- Question 3: "Do I need code now?" → Read ONLY the specific file

---

## Rule 3: Never Generate the Entire Solution

**The Violation**:
```
Prompt: "Generate a complete payment processing system"
Result: 20K tokens generating 500 lines of code
Problem: 80% already exists in the codebase!
Outcome: Duplication, conflicts, incorrect contracts, token waste
```

**The Correct Way**:
```
Step 1: Check Interface Map → "Payment API has processPayment(order, config)"
Step 2: Check Workflow Map → "Payment flow: Validate → Call Stripe → Record"
Step 3: Check specific file → "processor.js exists, add logic to line 142"
Step 4: Generate ONLY the missing piece (50 lines, 1K tokens)
Outcome: Fits existing system, correct contracts, minimal generation
```

**When This Rule Applies**: ALWAYS. When writing new code.

**Exception**: None. Every solution builds on existing contracts, never blank slate.

**How to Enforce**:
- Before any generation, consult: Architecture Map → Interface Map → Workflow Map
- Ask: "Does this contract already exist?"
- Ask: "Where does this fit in the workflow?"
- Generate ONLY the new logic, reuse everything else

---

## Rule 4: Never Run Full Test Suite

**The Violation**:
```
Command: "Run all tests on the system"
Action: Runs 500 test cases on 100K LOC project
Time: 30+ minutes
Tokens: 3000+ tokens for test output analysis
Result: Learned only what you needed to know about payment module
Outcome: Massive token waste for tiny bit of information
```

**The Correct Way**:
```
Modified: payment/processor.js
Query: Interface Map → "What tests cover payment processing?"
Run: tests/payment.test.js only (5 test cases, 30 seconds)
Tokens: 500 tokens for targeted test results
Outcome: Exact knowledge needed, 6x faster, 85% fewer tokens
```

**When This Rule Applies**: ALWAYS. When testing.

**Exception**: Before production deployment (but keep scope narrow with dependency map)

**How to Enforce**:
- Modified which file? → Find in Dependency Map → Run only tests for that module
- Need broader testing? → Consult Interface Map for all dependents → Run only those tests
- Question: "Do I need full test suite?" Answer: "No, 99.9% of time you don't"

---

## Rule 5: Always Build Maps First

**The Violation**:
```
Agent joins new project: "I'll start modifying code to understand it"
Result: Makes changes without understanding system
Outcome: Breaks things, creates bugs, wastes time
```

**The Correct Way**:
```
Agent joins new project: "I'll build maps first"
Step 1 (4-6 hours): Create Architecture Map
Step 2 (6-8 hours): Create Interface Map
Step 3 (4-5 hours): Create Workflow Map  
Step 4 (2-3 hours): Create Dependency Map
Result: Now can modify anything correctly
Outcome: 20 hours investment pays back in first week (saved 100K+ tokens)
```

**When This Rule Applies**: ALWAYS. On every new project.

**Exception**: None. Maps are prerequisite to everything.

**How to Enforce**:
- New project? Check for maps first
- No maps? Build them immediately
- Existing maps? Update them when system changes
- Code changes without map updates? Red flag—don't do it

**Impact**:
```
First project: 20 hours to build maps
Immediate benefit: New developer understands system in 1 hour vs 2 weeks
Per-modification benefit: 10K tokens saved per task × 100 tasks/year = 1M tokens saved
Annual ROI: (1M tokens × $0.003) ÷ 20 hours ≈ $150/hour value creation
```

---

## The Five Rules in Practice

### Scenario 1: New AI Agent Joins Project

**WRONG WAY** (violates all 5 rules):
```
Agent: "I'll start reading the codebase"
Day 1: Reads src/ folder
Time: 8 hours
Tokens: 50K consumed
Understanding: Fragmented, confused
Ready to work? No
```

**RIGHT WAY** (follows all 5 rules):
```
Agent: "I'll read the maps"
Step 1: Read Architecture Map (20 min)
  Rule 1: Never load entire project ✓ (read map instead)
Step 2: Read Interface Map (30 min)
  Rule 2: Never analyze entire project ✓ (specific contracts, not code)
Step 3: Read Workflow Map (30 min)
  Rule 3: Never generate entire solution ✓ (knows what exists)
Step 4: Ready to work (90 min total)
  Rule 4: Run only relevant tests ✓ (when modifying)
  Rule 5: Maps were complete ✓ (prerequisite met)
Time: 1.5 hours
Tokens: 22K consumed
Understanding: Complete, ready
Ready to work? Yes
```

---

### Scenario 2: Fix a Bug in Large System

**WRONG WAY** (violates rules):
```
"I'll trace through the entire system to find the bug"

Read:
  - Payment service (500 lines)
  - Order service (400 lines)
  - Database layer (300 lines)
  - Queue handlers (200 lines)
  
Time spent: 4 hours
Tokens: 15K consumed
Bug found? Eventually
Confidence level: Medium (might have missed something)
```

**RIGHT WAY** (follows 5 rules):
```
Step 1: Read Workflow Map
  Rule 1: Never load entire project ✓ (use map)
  Finds: "Payment timeout after 30 seconds"

Step 2: Check Interface Map
  Rule 2: Never analyze entire project ✓ (specific contract)
  Finds: "Payment config has timeout: 30000"

Step 3: Look at Dependency Map
  Rule 5: Maps were complete ✓
  Finds: "Config applies only to payment service"

Step 4: Read ONLY payment config
  Rule 3: Don't generate, understand existing ✓
  Rule 4: Run only payment tests ✓

Bug: "Timeout should be 60000, currently 30000"
Fix: Edit config/payment.yaml, line 12
Verify: Run tests/payment.test.js

Time spent: 15 minutes
Tokens: 2K consumed
Bug found? Immediately, with confidence
```

---

### Scenario 3: Add New Feature to System

**WRONG WAY** (violates rules):
```
"I need to add subscription discounts"

Step 1: Read entire order service to understand it
Step 2: Read entire discount module
Step 3: Generate new code from scratch
Step 4: Run all tests to verify nothing broke
Step 5: Pray it works

Tokens: 20K
Time: 4 hours
Result: Works (but fragile, might break something)
```

**RIGHT WAY** (follows 5 rules):
```
Step 1: Read Architecture Map
  Rule 1: ✓ Never load entire project
  Finds: "Order Service → Discount Engine"

Step 2: Read Interface Map
  Rule 3: ✓ Never generate entire solution
  Finds: "Discount API: calculateDiscount(order, customer)"

Step 3: Read Workflow Map
  Rule 2: ✓ Never analyze entire project
  Finds: "Order created → Calculate discount → Apply → Confirm"

Step 4: Check Dependency Map
  Rule 5: ✓ Maps were complete
  Finds: "Discount Engine has 3 dependents"

Step 5: Read ONLY discount/engine.js (where logic lives)
  Understand: Existing discount rules structure

Step 6: Generate ONLY the new feature (subscription discount rule)
  Use: Existing pattern from other discount rules
  Tokens: 2K

Step 7: Run ONLY discount tests
  Rule 4: ✓ Never run full test suite

Tokens: 5K total
Time: 1 hour
Result: Works perfectly, follows patterns, won't break anything
```

---

## Rule Violations Matrix

```
RULE 1: Never Load Entire Project
├─ VIOLATION: Read src/ folder
├─ COST: 50K tokens
├─ CONSEQUENCE: Confusion, no understanding
└─ PREVENTION: Start with Architecture Map

RULE 2: Never Analyze Entire Project
├─ VIOLATION: Trace code through all modules
├─ COST: 15K tokens per analysis
├─ CONSEQUENCE: Misses key details, wastes time
└─ PREVENTION: Use Interface Map + Workflow Map

RULE 3: Never Generate Entire Solution
├─ VIOLATION: "Generate payment system from scratch"
├─ COST: 20K tokens generating duplicates
├─ CONSEQUENCE: Conflicts with existing code, rework
└─ PREVENTION: Consult Interface Map first, generate only gaps

RULE 4: Never Run Full Test Suite
├─ VIOLATION: "Run all 500 tests"
├─ COST: 3K tokens, 30+ minutes
├─ CONSEQUENCE: 98% of test results irrelevant to change
└─ PREVENTION: Use Dependency Map, run only affected tests

RULE 5: Always Build Maps First
├─ VIOLATION: Start coding without maps
├─ COST: 100K+ tokens over time, constant rework
├─ CONSEQUENCE: Architectural mistakes, duplicated work
└─ PREVENTION: Invest 20 hours upfront, save millions of tokens
```

---

## Implementation Checklist

- [ ] **Rule 1**: Architecture Map exists and is current
- [ ] **Rule 1**: Before reading any code, consult Architecture Map
- [ ] **Rule 2**: Interface Map exists and documents all contracts
- [ ] **Rule 2**: When understanding flow, use Workflow Map not code
- [ ] **Rule 3**: Consult maps before writing any new code
- [ ] **Rule 3**: Reuse existing patterns from Interface Map
- [ ] **Rule 4**: Have Dependency Map that shows which tests to run
- [ ] **Rule 4**: Never run full test suite (find affected tests first)
- [ ] **Rule 5**: All four maps created and maintained
- [ ] **Rule 5**: Maps updated when architecture changes
- [ ] **Rule 5**: Team trained on map-first workflow
- [ ] **Rule 5**: No code modifications without consulting maps

---

## Metrics: Prove the Five Rules Work

Track these to validate the rules:

```
Without Five Rules (traditional approach):
  ├─ Time to understand new component: 8 hours
  ├─ Tokens per modification: 15K
  ├─ New team member onboarding: 2 weeks
  ├─ Architecture mistakes per month: 3-5
  └─ Production incidents: 2-3/month

With Five Rules (CCE approach):
  ├─ Time to understand new component: 30 min (27x faster)
  ├─ Tokens per modification: 2K (87% savings)
  ├─ New team member onboarding: 1 day (14x faster)
  ├─ Architecture mistakes per month: 0
  └─ Production incidents: <1/month

Team of 10 engineers, 100 modifications/year:
  ├─ Without rules: 1.5M tokens × $0.003 = $4,500/year
  └─ With rules: 200K tokens × $0.003 = $600/year
  
Annual Token Savings: $3,900 (plus productivity gains)
```

---

## When Rules Conflict with Practicality

**Q: But what if I absolutely need to understand the whole system?**
A: You don't. Maps were built for exactly this. If maps don't answer your question, **the maps are incomplete**. Fix them instead of reading code.

**Q: Isn't it better to just read the code and understand directly?**
A: No. Direct code reading breaks Rules 1-4 and costs 10x more tokens. Maps are the direct path.

**Q: What if there are no maps yet?**
A: Build them. This is Rule 5. It's not optional.

**Q: How do I know if my maps are complete?**
A: You can answer these questions without reading code:
- Where is this feature?
- What does this API contract look like?
- How does this workflow progress?
- Which tests do I need to run?

If you can't answer any of these, maps are incomplete. **Extend them instead of reading code.**

---

## The Five Rules Guarantee

**If you follow all five rules:**
- ✓ Never exceed 3K tokens per routine modification
- ✓ Understand any system component in <1 hour
- ✓ Onboard new team members in 1 day
- ✓ Introduce 80% fewer architecture mistakes
- ✓ Reduce production incidents by 75%+

**If you violate even one rule:**
- ✗ Token consumption explodes
- ✗ Constant rework and mistakes
- ✗ Slow onboarding remains slow
- ✗ System becomes harder to change, not easier

---

## Poster Version (Print This)

```
╔════════════════════════════════════════════════════════════╗
║         CCE FIVE ABSOLUTE RULES - NEVER VIOLATE           ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  RULE 1: NEVER load the entire project                   ║
║          Use: Architecture Map (5K tokens)                ║
║                                                            ║
║  RULE 2: NEVER analyze the entire project                ║
║          Use: Interface Map + Workflow Map                ║
║                                                            ║
║  RULE 3: NEVER generate the entire solution              ║
║          Use: Check contracts first, generate only gaps   ║
║                                                            ║
║  RULE 4: NEVER run full test suite                        ║
║          Use: Dependency Map to find affected tests only  ║
║                                                            ║
║  RULE 5: ALWAYS build maps first                          ║
║          Cost: 20 hours | Benefit: 1M+ tokens saved/year  ║
║                                                            ║
║  AI ACCESS ORDER:                                         ║
║    Architecture Map → Dependency Map → Interface Map     ║
║    → Workflow Map → Specific File → Function              ║
║                                                            ║
║  NOT: Code → Code → Code → Code                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## Next Steps

1. **Print this document**
2. **Share with your team**
3. **Verify your project has all four maps**
4. **Build missing maps first**
5. **Follow the five rules religiously**
6. **Track token savings**
7. **Never violate the rules**

---

*Version 1.0.0 - The Five Rules are non-negotiable.*
*Violating them means you've stopped using CCE and are back to traditional context explosion.*
*Stick to the rules. Your tokens will thank you.*
