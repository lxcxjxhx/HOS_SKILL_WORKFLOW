## Layer 1: Architecture Map

**File**: `knowledge/architecture-map.md`

Purpose: Complete system topology in one view.

Format:
```markdown
# System Architecture Map

## Overview
[One paragraph: what does the system do?]

## Component Topology

### Tier 1: API Gateway (entry point)
- **Port**: 443 (HTTPS)
- **Tech**: Express.js + nginx
- **Responsibilities**:
  - Request routing
  - Rate limiting
  - Authentication check
- **Depends on**: Auth Service, all microservices
- **Location**: `src/gateway/`
- **Key files**: `gateway.js` (entry), `router.js` (routes)

### Tier 2: Microservices

#### Auth Service
- **Port**: 3001 (internal)
- **Tech**: Node.js + Express
- **Responsibilities**:
  - User authentication
  - Token generation & refresh
  - Permission checking
- **Depends on**: Database, Redis
- **Used by**: API Gateway, Payment Service, User Service
- **Location**: `src/auth/`
- **Critical paths**: LOGIN, TOKEN_REFRESH, VERIFY_PERMISSION

#### Payment Service
- **Port**: 3002 (internal)
- **Tech**: Node.js + Express
- **Responsibilities**:
  - Payment processing
  - Transaction tracking
  - Refund handling
- **Depends on**: Auth, Database, Stripe API
- **Used by**: Order Service
- **Location**: `src/payment/`
- **Critical paths**: PROCESS_PAYMENT, VERIFY_TRANSACTION, ISSUE_REFUND

#### User Service
- **Port**: 3003 (internal)
- **Tech**: Node.js + Express
- **Responsibilities**:
  - User profile management
  - Preferences storage
  - User deletion (GDPR)
- **Depends on**: Auth, Database
- **Used by**: API Gateway, Profile Service
- **Location**: `src/user/`

### Tier 3: Data Layer

#### PostgreSQL Database
- **Host**: db.internal
- **Schemas**:
  - `public.users` (users table)
  - `public.orders` (orders table)
  - `public.payments` (payment records)
  - `public.sessions` (session tokens)
- **Replication**: Primary + 2 replicas (read-only)
- **Backup**: Daily snapshots

#### Redis Cache
- **Host**: cache.internal
- **Usage**:
  - Session storage (2hr TTL)
  - Rate limit counters (1hr TTL)
  - Refresh token blacklist (7d TTL)
- **Eviction**: LRU, 2GB max

#### Message Queue
- **Tech**: RabbitMQ
- **Queues**:
  - `payment.processed` → consumed by billing service
  - `user.created` → consumed by email service
  - `order.confirmed` → consumed by fulfillment

### Tier 4: External Services

#### Stripe API
- **Endpoint**: https://api.stripe.com
- **Used by**: Payment Service
- **Endpoints**: POST /charges, GET /charges/:id

#### Email Service
- **Provider**: SendGrid
- **Used by**: Auth (welcome email), User (notifications)

## Dependency Graph

```
API Gateway
├─ Auth Service
│  ├─ Database
│  └─ Redis
├─ Payment Service
│  ├─ Auth Service (verify)
│  ├─ Database
│  └─ Stripe API
├─ User Service
│  ├─ Auth Service (verify)
│  └─ Database
└─ Notification Service
   ├─ Queue (consumer)
   └─ Email Service
```

## Data Flow Diagrams

### Login Flow
```
User
  ↓ POST /login
API Gateway (authenticate)
  ↓ verify credentials
Auth Service
  ↓ query
Database
  ↓ return user
Auth Service
  ↓ generate JWT
API Gateway
  ↓ response with token
User
```

### Payment Flow
```
User
  ↓ POST /order
Order Service
  ↓ create order
Database
  ↓ emit event
Queue
  ↓ publish payment.requested
Payment Service (consumer)
  ↓ validate with Auth
Auth Service
  ↓ verify permission
Payment Service
  ↓ call Stripe
Stripe API
  ↓ charge card
Payment Service
  ↓ emit payment.processed
Queue
  ↓ publish to fulfillment
Fulfillment Service (consumer)
```

## Critical Paths (Must Not Break)

1. **LOGIN**: User → API → Auth → Database → Token returned
   - SLA: <200ms
   - Impact if down: Complete system inaccessible

2. **PAYMENT**: Order → Payment → Stripe → Confirmation
   - SLA: <5s
   - Impact if down: Revenue stops

3. **TOKEN_REFRESH**: Client → Auth → JWT validation → New token
   - SLA: <100ms
   - Impact if down: Sessions expire, users logout

## Scaling Architecture

### Horizontal Scaling

**Stateless services** (can scale freely):
- API Gateway (load balanced)
- Auth Service (state in Redis)
- Payment Service (idempotent calls)
- User Service (read replicas)

**Stateful services** (scaling considerations):
- Database (read replicas, sharding)
- Redis (clustering or sentinel)
- Queue (multiple workers)

### Current Capacity

- API Gateway: 10K req/s
- Database: 50K connections max
- Redis: 1GB/s throughput
- Message Queue: 100K messages/s

**Next scale bottleneck**: Database (upgrade to sharding at 50K req/s)

## Failure Modes & Recovery

### If Auth Service goes down
- **Impact**: No new logins, tokens still valid (cached)
- **Recovery**: Restart service, tokens cached in Redis
- **TTL before lockout**: 2 hours (token TTL)

### If Database goes down
- **Impact**: All reads fail (cache only helps for hits)
- **Recovery**: Failover to replica (manual, 5 min)
- **Data loss**: None (replication is synchronous)

### If Stripe API fails
- **Impact**: Payments fail immediately
- **Recovery**: Queue payments, retry with exponential backoff
- **Data loss**: Queued payments not lost

## Deployment Architecture

```
Production Environment:
  ├─ API Gateway Cluster (3 instances, us-east-1)
  ├─ Auth Service (2 instances, us-east-1)
  ├─ Payment Service (2 instances, us-east-1)
  ├─ User Service (1 instance, us-east-1)
  ├─ Database Cluster (Primary + 2 replicas)
  ├─ Redis Cluster (3 nodes)
  └─ Queue Cluster (3 nodes)

Staging Environment:
  └─ Single instance of each service
```

## Key Decisions & Trade-offs

1. **Why microservices?** → Independent scaling, isolation of failures
2. **Why Redis?** → Sub-ms session lookup, distributed cache
3. **Why synchronous replication?** → Data consistency over availability
4. **Why message queue?** → Async processing, decoupling services

---

This map replaces reading 100K lines of code.
An AI agent can understand the entire system in 10 minutes.
```

## Layer 2: Interface Map

**File**: `knowledge/interface-map.md`

Purpose: All public APIs and contracts in one place.

Format:
```markdown
# Interface Map (API Contracts)

## Auth Service Interface

### Endpoint: POST /auth/login

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response (200)**:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "ref_...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Errors**:
- 400: Invalid credentials format
- 401: Wrong password (email found but password wrong)
- 404: User not found
- 429: Too many attempts (rate limited)

**Side effects**:
- Logs authentication attempt to audit log
- Increments failed login counter in Redis
- Generates session in database

---

### Endpoint: POST /auth/refresh

**Request**:
```json
{
  "refreshToken": "ref_..."
}
```

**Response (200)**:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "ref_..." // may be new
}
```

**Errors**:
- 401: Invalid or expired refresh token
- 403: Token revoked

---

## Payment Service Interface

### Endpoint: POST /payment/charge

**Request**:
```json
{
  "orderId": "order-123",
  "amount": 99.99,
  "currency": "USD",
  "cardToken": "tok_visa",
  "idempotencyKey": "uuid" // prevents duplicate charges
}
```

**Response (200)**:
```json
{
  "transactionId": "txn-abc123",
  "status": "success",
  "amount": 99.99,
  "timestamp": "2026-06-13T14:30:00Z"
}
```

**Response (202 - Async)**:
```json
{
  "transactionId": "txn-abc123",
  "status": "pending",
  "checkUrl": "/payment/status/txn-abc123"
}
```

**Errors**:
- 400: Invalid request format
- 402: Card declined by Stripe
- 409: Duplicate charge detected (idempotency)
- 500: Payment gateway error (queue for retry)

**Idempotency**: Same `idempotencyKey` returns same result for 24 hours.

---

### Endpoint: GET /payment/status/:transactionId

**Request**: None

**Response (200)**:
```json
{
  "transactionId": "txn-abc123",
  "status": "success|pending|failed|refunded",
  "amount": 99.99,
  "reason": "card_declined" // if failed
}
```

---

## User Service Interface

### Endpoint: GET /user/profile/:userId

**Request**: Header `Authorization: Bearer {token}`

**Response (200)**:
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "preferences": {
    "emailNotifications": true,
    "language": "en"
  },
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**Errors**:
- 401: Missing or invalid token
- 403: Not authorized (trying to read other user's profile)
- 404: User not found

---

## Database Schema Map

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### orders table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);
```

### payments table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  transaction_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);
```

---

This map replaces reading 200+ API files.
An AI modifying an endpoint knows exactly what contract to maintain.
```

## Layer 3: Workflow Map

**File**: `knowledge/workflow-map.md`

Purpose: All business processes and state machines.

Format:
```markdown
# Workflow Map (Business Processes)

## User Registration Workflow

State Machine:
```
INITIAL
  ↓ POST /auth/register
PENDING_VERIFICATION
  ├─ Timeout 24h → REGISTRATION_EXPIRED
  └─ GET /auth/verify?code=... → ACTIVE
ACTIVE (user can login)
```

Steps:
1. User submits email + password → PENDING_VERIFICATION
2. System sends verification email (async, via queue)
3. User clicks link within 24h → ACTIVE
4. User can now login

Code locations:
- Registration: `src/auth/register.js` (line 45)
- Email sender: `src/workers/emailWorker.js`
- Verification: `src/auth/verify.js` (line 78)

---

## Payment Processing Workflow

State Machine:
```
ORDER_CREATED
  ↓ Trigger payment.requested event
PAYMENT_PENDING
  ├─ Stripe succeeds → PAYMENT_SUCCESSFUL
  ├─ Stripe fails → PAYMENT_FAILED
  │   ├─ Auto-retry 3 times
  │   └─ Alert merchant
  └─ Timeout 30m → PAYMENT_ABANDONED
PAYMENT_SUCCESSFUL
  ↓ Trigger fulfillment.start event
FULFILLMENT_IN_PROGRESS
  ...
```

Steps:
1. Order created in database
2. Event published to queue → `payment.requested`
3. Payment service picks up event
4. Call Stripe API with card token
5. If success: publish `payment.successful` → fulfillment picks up
6. If failure: retry 3x, then publish `payment.failed`

Code locations:
- Order creation: `src/order/create.js`
- Payment processor: `src/payment/processor.js` (line 120)
- Event handlers: `src/workers/paymentWorker.js`

---

## Session Management Workflow

State Machine:
```
LOGIN_SUCCESS
  ├─ Access token (1h TTL)
  └─ Refresh token (7d TTL, in Redis)
USING_SERVICE
  ├─ Token expires
  ├─ Client sends refresh token
  └─ → NEW tokens issued
USER_LOGOUT
  ├─ Refresh token added to blacklist (Redis, 7d TTL)
  └─ Access token still valid until expiry
USER_IDLE_>7DAYS
  └─ Refresh token expires → automatic logout
```

Code locations:
- Token generation: `src/auth/tokenManager.js`
- Token refresh: `src/auth/refresh.js` (line 50)
- Logout: `src/auth/logout.js`
- Session validation middleware: `src/middleware/auth.js`

---

This map replaces reading 100+ workflow files.
An AI implementing a new workflow knows where to plug in.
```

