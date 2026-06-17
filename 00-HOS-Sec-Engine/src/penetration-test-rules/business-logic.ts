/**
 * PT-004: Business Logic Flaws
 * 
 * Detects business logic vulnerabilities that automated scanners miss.
 * Simulates attacker perspective for exploiting workflow and state management.
 */

import { AuditRule, EvidenceType, SeverityLevel, LanguageType } from '../schemas/types';

export const BusinessLogicFlawsRule: AuditRule = {
  id: 'PT-004',
  name: 'Business Logic Flaws',
  description: 'Detect business logic vulnerabilities that automated scanners typically miss.',
  detail: 'Checks for race conditions, state machine bypass, negative quantity/amount manipulation, coupon/discount abuse, concurrent request handling, and workflow step skipping.',

  triggers: {
    patterns: [
      'Balance update: user.balance = user.balance - amount',
      'State transition: order.status = "paid"',
      'Coupon validation: if (coupon.valid) applyDiscount()',
      'Quantity check: if (quantity > 0) processOrder()',
      'Transaction without locking: UPDATE accounts SET balance = balance - ?',
      'Payment processing: await processPayment(amount)',
      'Workflow step: if (step === "confirm") finalizeOrder()',
    ],
    languages: [LanguageType.Java, LanguageType.JavaScript, LanguageType.TypeScript, LanguageType.Python, LanguageType.CSharp, LanguageType.PHP, LanguageType.Go],
    frameworks: ['express', 'spring', 'django', 'laravel', 'rails'],
    keywords: ['transaction', 'balance', 'payment', 'order', 'state', 'workflow', 'coupon', 'discount'],
  },

  checks: [
    {
      order: 1,
      name: 'Race Condition Detection',
      condition: 'Check if concurrent requests can cause inconsistent state or double operations',
      questions: [
        'Are financial operations (transfers, purchases) protected by locks or atomic operations?',
        'Can the same coupon be applied multiple times via concurrent requests?',
        'Is there a mechanism to prevent double-spending or duplicate processing?'
      ],
      failureIndicators: [
        'user.balance -= amount without database transaction',
        'No optimistic/pessimistic locking on shared resources',
        'Coupon code can be applied multiple times in parallel requests'
      ],
      successIndicators: [
        'Database transactions with proper isolation level',
        'Optimistic locking with version field',
        'Idempotency keys for financial operations'
      ],
      criticality: 'must-have'
    },
    {
      order: 2,
      name: 'Negative Amount/Quantity Manipulation',
      condition: 'Check if negative values can be used to exploit financial or inventory logic',
      questions: [
        'Are negative amounts validated and rejected?',
        'Can a negative quantity result in credit instead of debit?',
        'Is the absolute value enforced for financial operations?'
      ],
      failureIndicators: [
        'amount < 0 not checked before processing',
        'balance = balance - (-100) results in adding 100',
        'quantity can be negative in order processing'
      ],
      successIndicators: [
        'if (amount <= 0) throw new Error("Invalid amount")',
        'Absolute value enforced for financial calculations',
        'Input validation rejects negative numbers for quantities'
      ],
      criticality: 'must-have'
    },
    {
      order: 3,
      name: 'State Machine Bypass',
      condition: 'Check if workflow states can be skipped or manipulated out of order',
      questions: [
        'Can a user skip required steps in a multi-step workflow?',
        'Can an order status be changed directly from "pending" to "shipped"?',
        'Are state transitions validated against allowed transitions?'
      ],
      failureIndicators: [
        'order.status = req.body.status (direct assignment from user input)',
        'No state machine validation for status transitions',
        'Workflow steps not enforced server-side'
      ],
      successIndicators: [
        'State machine library used (e.g., xstate, stateless)',
        'Explicit transition validation: allowedTransitions[currentState].includes(nextState)',
        'Server-side enforcement of step order'
      ],
      criticality: 'must-have'
    },
    {
      order: 4,
      name: 'Coupon and Discount Abuse',
      condition: 'Check if coupon/discount logic can be exploited for unintended benefits',
      questions: [
        'Can a coupon be applied multiple times to the same order?',
        'Can expired coupons still be used?',
        'Can discount percentages result in negative totals?',
        'Can multiple coupons be stacked when only one should be allowed?'
      ],
      failureIndicators: [
        'No coupon usage tracking per user',
        'Expired date not checked before applying coupon',
        'total = total - (total * 0.5) can result in negative with multiple coupons'
      ],
      successIndicators: [
        'Coupon usage tracked and limited per user/order',
        'Expiration validation: if (coupon.expiry < Date.now()) reject',
        'Maximum discount cap enforced'
      ],
      criticality: 'important'
    },
    {
      order: 5,
      name: 'Precision and Rounding Exploitation',
      condition: 'Check if floating-point precision issues can be exploited',
      questions: [
        'Are financial calculations using floating-point numbers?',
        'Can rounding differences be exploited for profit?',
        'Is decimal/fixed-point arithmetic used for money?'
      ],
      failureIndicators: [
        'float/double used for currency values',
        'No rounding strategy defined',
        'total = price * quantity (with floating-point)'
      ],
      successIndicators: [
        'Decimal or integer cents used for money',
        'Explicit rounding strategy (e.g., banker\'s rounding)',
        'Currency library used (e.g., Dinero.js, money.js)'
      ],
      criticality: 'important'
    },
    {
      order: 6,
      name: 'Time-Based Logic Manipulation',
      condition: 'Check if time-dependent logic can be manipulated by changing request timing',
      questions: [
        'Can flash sale items be purchased before the sale starts or after it ends?',
        'Can time-limited offers be exploited by manipulating request timing?',
        'Is server-side time used for validation (not client-provided time)?'
      ],
      failureIndicators: [
        'if (req.body.timestamp < saleEnd) uses client-provided time',
        'No server-side time validation for time-sensitive operations',
        'Race between sale start time and early purchase requests'
      ],
      successIndicators: [
        'Server-side time used: if (Date.now() < saleStart)',
        'Time validation on all time-dependent operations',
        'Graceful handling of concurrent sale-start requests'
      ],
      criticality: 'important'
    }
  ],

  evidence_requirements: [
    {
      type: EvidenceType.SourceCode,
      required: true,
      description: 'Business logic code location with financial/state operations',
      example: 'File: src/services/payment.ts:45 - user.balance -= amount (no transaction lock)',
      collection_guidance: 'Identify all financial operations, state transitions, and workflow steps'
    },
    {
      type: EvidenceType.DataFlow,
      required: true,
      description: 'Data flow for financial operations and state changes',
      example: 'Request amount → balance calculation → database update (no atomicity)',
      collection_guidance: 'Trace the complete flow of financial data from input to persistence'
    },
    {
      type: 'blackbox-evidence' as any,
      required: true,
      description: 'HTTP request/response showing business logic exploitation',
      example: 'Two concurrent POST /api/transfer requests both succeed, resulting in double deduction',
      collection_guidance: 'Send concurrent requests to test race conditions, negative amounts, and state bypass'
    }
  ],

  remediations: [
    {
      priority: SeverityLevel.Critical,
      action: 'Use database transactions with proper isolation for financial operations',
      code: `await db.transaction(async (trx) => {
  const account = await trx.accounts.forUpdate().where({ id }).first();
  if (account.balance < amount) throw new Error('Insufficient funds');
  await trx.accounts.where({ id }).decrement('balance', amount);
});`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.High,
      action: 'Implement idempotency keys for financial operations',
      code: `const idempotencyKey = req.headers['idempotency-key'];
const existing = await IdempotencyLog.findOne({ key: idempotencyKey });
if (existing) return existing.response; // Return cached result`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.High,
      action: 'Implement state machine validation for workflow transitions',
      code: `const validTransitions = { pending: ['confirmed', 'cancelled'], confirmed: ['shipped'] };
if (!validTransitions[order.status]?.includes(newStatus)) {
  throw new Error('Invalid state transition');
}`,
      difficulty: 'Medium'
    }
  ],

  pentestValidation: {
    description: 'How to validate business logic flaws during penetration testing',
    attackSteps: [
      'Race condition testing: Send 10 concurrent requests to apply the same coupon or transfer funds',
      'Negative amount testing: Send POST /api/transfer with {"amount": -100} to test if it credits instead of debits',
      'State bypass testing: Send PATCH /api/orders/:id with {"status": "delivered"} skipping intermediate steps',
      'Coupon stacking: Try to apply multiple discount codes to a single order',
      'Time manipulation: Try to purchase flash sale items before the sale starts by manipulating request timing',
      'Precision exploitation: Test if floating-point calculations can be exploited (e.g., 0.1 + 0.2 = 0.30000000000000004)',
      'Quantity manipulation: Send order with negative quantity to test if it results in refund instead of charge'
    ],
    tools: [
      'Turbo Intruder (Burp extension) for race condition testing',
      'curl with xargs for concurrent request testing',
      'Postman Runner for workflow step bypass testing',
      'Custom Python scripts for precision testing'
    ],
    expectedFindings: [
      'Race condition: Same coupon applied multiple times via concurrent requests',
      'Negative amount: POST /api/transfer with -100 credits the account instead of debiting',
      'State bypass: Order can be set directly to "shipped" from "pending"',
      'Coupon stacking: Multiple discount codes can be applied for cumulative discounts',
      'Precision exploitation: Calculations result in penny-level discrepancies exploitable at scale'
    ]
  },

  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-362', 'CWE-840', 'CWE-841', 'CWE-682'],
  owasp_categories: ['A04:2021 - Insecure Design', 'A01:2021 - Broken Access Control'],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
