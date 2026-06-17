/**
 * PD-006: Business Logic Defects Diagnostic Guide
 *
 * Systematic diagnosis of business logic vulnerabilities including race conditions,
 * state machine bypass, amount manipulation, and workflow abuse patterns.
 */

import {
  DiagnosticGuide,
  ProblemCategoryType,
  SeverityLevel,
  LanguageType
} from '../schemas/types';

export const BusinessLogicDefectsRule: DiagnosticGuide = {
  id: 'PD-006',
  category: ProblemCategoryType.BusinessLogic,
  name: 'Business Logic Defects',
  description:
    'Systematic diagnosis of business logic vulnerabilities including race conditions, state machine bypass, amount manipulation, and workflow abuse patterns.',
  triggers: {
    patterns: [
      'payment.*process',
      'order.*workflow',
      'state.*transition',
      'concurrent.*operation',
      'checkout',
      'refund',
      'invoice',
      'balance.*update',
      'stock.*update'
    ],
    languages: [
      LanguageType.Java,
      LanguageType.JavaScript,
      LanguageType.TypeScript,
      LanguageType.Python,
      LanguageType.CSharp,
      LanguageType.PHP,
      LanguageType.Go,
      LanguageType.Rust
    ],
    keywords: [
      'payment',
      'order',
      'workflow',
      'state',
      'transaction',
      'balance',
      'coupon',
      'discount',
      'race',
      'concurrent',
      'quantity',
      'amount'
    ]
  },
  diagnostic_steps: [
    {
      order: 1,
      name: 'Business Process Mapping',
      description:
        'Identify all critical business workflows and state transitions. Map the complete lifecycle of key entities such as orders, payments, and inventory.',
      questions: [
        'What are the complete state machines for orders, payments, and inventory?',
        'Are all state transitions explicitly defined and enforced?',
        'Can an entity reach an invalid state through any code path?',
        'Are there undocumented or implicit state transitions?'
      ],
      defect_indicators: [
        'State transitions controlled only by client-side values',
        'Missing validation between workflow steps',
        'State fields directly writable from user input without server validation',
        'No centralized state machine or workflow engine for critical processes'
      ],
      secure_indicators: [
        'Explicit state machine definitions with allowed transitions',
        'Server-side enforcement of all state changes',
        'Audit logging for all critical state transitions'
      ]
    },
    {
      order: 2,
      name: 'Exception Path Analysis',
      description:
        'Check how the system handles invalid states, edge cases, and error conditions. Analyze whether error handling introduces security bypasses.',
      questions: [
        'What happens when a payment fails midway through an order?',
        'Are error paths properly guarded with the same security controls as happy paths?',
        'Can an attacker trigger error conditions to skip validation steps?',
        'Does the system properly rollback state on failures?'
      ],
      defect_indicators: [
        'Error responses that reveal partial processing state',
        'Validation skipped in catch blocks or error handlers',
        'Inconsistent state after partial failures (e.g., stock deducted but order not created)',
        'No idempotency handling for retryable operations'
      ],
      secure_indicators: [
        'Consistent error handling with proper rollback mechanisms',
        'Error paths enforce the same validation as success paths',
        'Idempotency keys for critical operations'
      ]
    },
    {
      order: 3,
      name: 'Race Condition Detection',
      description:
        'Identify TOCTOU (Time-of-Check to Time-of-Use) vulnerabilities, concurrent request handling issues, and atomicity problems in business operations.',
      questions: [
        'Can the same coupon be applied multiple times via concurrent requests?',
        'Is inventory checked and deducted atomically?',
        'Can a balance be double-spent through parallel requests?',
        'Are there read-then-write sequences without proper locking?'
      ],
      defect_indicators: [
        'Separate read and write operations on shared state without locking',
        'No database-level constraints (e.g., CHECK constraints, unique indexes) for business rules',
        'Optimistic concurrency without retry logic',
        'No rate limiting or request serialization for critical operations'
      ],
      secure_indicators: [
        'Database transactions with appropriate isolation levels',
        'Optimistic or pessimistic locking for concurrent access to shared resources',
        'Idempotent operations with deduplication',
        'Row-level or record-level locking instead of application-level flags'
      ],
      tools: [
        'Concurrent request testing (e.g., sending parallel identical requests)',
        'Database transaction log analysis',
        'Load testing to trigger race windows'
      ]
    },
    {
      order: 4,
      name: 'Amount & Parameter Manipulation Check',
      description:
        'Verify handling of negative amounts, overflow/underflow, precision attacks, and coupon abuse patterns. Check whether all monetary calculations are secure.',
      questions: [
        'Can negative quantities or amounts be submitted and processed?',
        'Are monetary calculations using floating-point types instead of decimal?',
        'Can coupons or discounts be stacked beyond intended limits?',
        'Is there proper validation on all numeric parameters from user input?'
      ],
      defect_indicators: [
        'Floating-point types (float, double) used for monetary values',
        'No server-side validation on quantity, amount, or discount parameters',
        'Missing range checks allowing negative values where only positive is valid',
        'Price or discount values trusted from client-side without server recalculation',
        'No upper bound checks allowing overflow attacks'
      ],
      secure_indicators: [
        'Decimal/BigDecimal types used for all monetary calculations',
        'Server-side validation with explicit range and type checks for all numeric inputs',
        'Prices and discounts recalculated server-side from base data',
        'Coupon/discount application rules enforced server-side with usage limits'
      ]
    }
  ],
  common_root_causes: [
    {
      cause:
        'No server-side validation of business rules (e.g., negative quantity)',
      explanation:
        'Business rules such as minimum/maximum quantities, valid price ranges, or allowed discount combinations are only validated on the client side, allowing attackers to bypass them by crafting direct API requests.',
      frequency: 'common'
    },
    {
      cause:
        'Missing transaction isolation enabling race conditions',
      explanation:
        'Concurrent requests can exploit the gap between reading a value (e.g., inventory count, account balance) and writing the updated value, leading to double-spending, over-selling, or duplicate coupon usage.',
      frequency: 'common'
    },
    {
      cause:
        'State machine allows invalid transitions without validation',
      explanation:
        'The system does not enforce valid state transitions, allowing an attacker to skip required steps (e.g., jumping directly from "pending" to "completed" without payment) or reverse states inappropriately.',
      frequency: 'occasional'
    },
    {
      cause:
        'Floating point arithmetic used for monetary calculations causing precision issues',
      explanation:
        'Using float or double for currency values introduces rounding errors that can be exploited to manipulate prices, or simply cause incorrect financial calculations. Monetary values require exact decimal arithmetic.',
      frequency: 'occasional'
    }
  ],
  remediations: [
    {
      priority: SeverityLevel.Critical,
      action:
        'Implement server-side business rule validation for all critical parameters',
      description:
        'Validate all business-critical parameters (quantity, amount, discount, state) on the server side with explicit range checks, type validation, and business rule enforcement. Never trust client-supplied prices or computed values.',
      code: `// Example: Server-side validation for order creation (TypeScript)
function validateOrder(order: CreateOrderRequest): void {
  // Validate quantity
  if (order.quantity <= 0 || !Number.isInteger(order.quantity)) {
    throw new ValidationError('Quantity must be a positive integer');
  }
  
  // Validate amount range
  if (order.amount <= 0 || order.amount > MAX_ORDER_AMOUNT) {
    throw new ValidationError('Invalid order amount');
  }
  
  // Recalculate price server-side, never trust client price
  const product = await getProduct(order.productId);
  const expectedTotal = product.price * order.quantity;
  if (Math.abs(expectedTotal - order.amount) > TOLERANCE) {
    throw new ValidationError('Amount mismatch - possible tampering');
  }
}`,
      difficulty: 'Easy'
    },
    {
      priority: SeverityLevel.Critical,
      action:
        'Use database transactions with proper isolation levels for critical operations',
      description:
        'Wrap operations that read-then-write shared state (inventory, balance, coupon usage) in database transactions with appropriate isolation levels (e.g., SERIALIZABLE or REPEATABLE READ) or use explicit locking.',
      code: `// Example: Atomic inventory deduction with transaction (Java/JPA)
@Transactional(isolation = Isolation.SERIALIZABLE)
public boolean deductInventory(Long productId, int quantity) {
    Product product = entityManager.find(Product.class, productId);
    if (product == null || product.getStock() < quantity) {
        return false; // Not enough stock
    }
    product.setStock(product.getStock() - quantity);
    entityManager.merge(product);
    return true;
}

// Alternative: Use optimistic locking with @Version
@Entity
public class Product {
    @Version
    private Long version;
}`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.High,
      action: 'Enforce state machine transitions with explicit validation',
      description:
        'Implement a state machine that defines all valid transitions and rejects any transition not explicitly allowed. Centralize state transition logic and prevent direct state field modification.',
      code: `// Example: State machine enforcement (Python)
from enum import Enum
from typing import Dict, Set

class OrderState(Enum):
    PENDING = 'pending'
    PAID = 'paid'
    SHIPPED = 'shipped'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'

# Define valid transitions
VALID_TRANSITIONS: Dict[OrderState, Set[OrderState]] = {
    OrderState.PENDING: {OrderState.PAID, OrderState.CANCELLED},
    OrderState.PAID: {OrderState.SHIPPED, OrderState.REFUNDED},
    OrderState.SHIPPED: {OrderState.DELIVERED},
    OrderState.DELIVERED: set(),  # Terminal state
    OrderState.CANCELLED: set(),  # Terminal state
}

def transition_order(order: Order, new_state: OrderState) -> None:
    if new_state not in VALID_TRANSITIONS.get(order.state, set()):
        raise InvalidTransitionError(
            f"Cannot transition from {order.state.value} to {new_state.value}"
        )
    order.state = new_state
    order.save()`,
      difficulty: 'Medium'
    },
    {
      priority: SeverityLevel.High,
      action:
        'Use Decimal/BigDecimal types for all monetary calculations',
      description:
        'Replace floating-point types with language-specific decimal types (BigDecimal in Java, Decimal in Python, decimal.js in JavaScript) for all currency-related calculations to avoid precision loss.',
      code: `// Example: Decimal arithmetic for payments (TypeScript with decimal.js)
import Decimal from 'decimal.js';

function calculateOrderTotal(items: CartItem[], discount: Discount): Decimal {
  let subtotal = new Decimal(0);
  
  for (const item of items) {
    const itemPrice = new Decimal(item.price);
    const quantity = new Decimal(item.quantity);
    subtotal = subtotal.plus(itemPrice.mul(quantity));
  }
  
  // Apply discount safely
  const discountAmount = subtotal.mul(new Decimal(discount.percentage).div(100));
  const total = subtotal.minus(discountAmount);
  
  // Ensure non-negative
  return total.max(0);
}

// In the payment handler
const total = calculateOrderTotal(cartItems, discount);
if (total.comparedTo(requestedAmount) !== 0) {
  throw new Error('Payment amount mismatch');
}`,
      difficulty: 'Easy'
    }
  ],
  verification_steps: [
    'Verify that all business-critical parameters (quantity, amount, price, discount) are validated server-side with explicit range and type checks before processing.',
    'Execute concurrent requests (e.g., 10+ parallel identical requests) against the same resource (e.g., apply coupon, purchase last item) and confirm no double-processing occurs.',
    'Attempt to submit negative quantities, negative amounts, and extremely large values to confirm they are rejected with appropriate error messages.',
    'Attempt to skip workflow steps by directly requesting state transitions (e.g., jump from pending to delivered) and verify the system rejects invalid transitions.',
    'Review all monetary calculations to confirm decimal types (BigDecimal, Decimal, decimal.js) are used instead of floating-point types, and verify precision is preserved throughout calculations.'
  ],
  related_audit_rules: ['AR-001', 'AR-002'],
  related_pentest_rules: ['PT-004'],
  default_severity: SeverityLevel.High,
  cwe_ids: ['CWE-362', 'CWE-367', 'CWE-840', 'CWE-1336'],
  owasp_categories: [
    'A04:2021 - Insecure Design',
    'A01:2021 - Broken Access Control'
  ],
  created_date: '2026-06-17',
  last_updated: '2026-06-17'
};
