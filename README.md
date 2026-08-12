# LogiFlow — Enterprise Logistics & Warehouse Management Platform

**Backend API Documentation — Week 4 Milestone**

LogiFlow is a MERN-stack enterprise logistics platform supporting five user roles across warehouse, inventory, order, shipment, fleet, and support-ticket operations. This README covers the complete backend built through Week 4 (Months 1 backend engineering phase).

---

## 1. System Architecture

```
                    ┌─────────────────────┐
                    │   React Frontend     │  (Month 2 — Vercel)
                    └──────────┬───────────┘
                               │ REST / JSON (JWT Bearer auth)
                    ┌──────────▼───────────┐
                    │   Express.js API      │  (Render)
                    │  routes → middleware  │
                    │       → controllers   │
                    └──────────┬───────────┘
                               │ Mongoose ODM
                    ┌──────────▼───────────┐
                    │   MongoDB Atlas       │
                    └────────────────────────┘
```

**Request flow for a protected route:**

```
Client Request
    │
    ▼
verifyToken middleware  ──► invalid/missing token ──► 401
    │ (valid)
    ▼
authorizeRoles middleware ──► role not permitted ──► 403
    │ (permitted)
    ▼
Controller function ──► Mongoose model ──► MongoDB
    │
    ▼
JSON Response
```

### Folder Structure
```
backend/
├── config/         # DB connection
├── controllers/    # Business logic per module
├── middleware/      # verifyToken, authorizeRoles, rolePermissions
├── models/          # Mongoose schemas
├── routes/          # Express routers per module
├── utils/            # Shared helpers
├── .env              # Environment variables (not committed)
└── server.js / app.js
```

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (8h expiry) + bcrypt |
| Validation | Express Validator (select endpoints) |
| API Testing | Postman |

---

## 3. Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (`8h`) |
| `PORT` | Server port (default 8000) |

---

## 4. User Roles

| Role |
|---|
| Administrator |
| Warehouse Manager |
| Warehouse Executive |
| Logistics Coordinator |
| Customer Support Executive |

Roles are encoded in the JWT payload (`userId`, `email`, `role`) at login and checked on every protected route via `verifyToken` → `authorizeRoles(...allowedRoles)` middleware. Routes without `authorizeRoles` are accessible to **any authenticated role**.

---

## 5. Local Development Setup

```bash
cd backend
npm install
cp .env.example .env    # fill in MONGODB_URI, JWT_SECRET, etc.
npm run dev              # starts server with nodemon on PORT (default 8000)
```

Test the connection: `GET http://localhost:8000/api/auth/me` (with a valid Bearer token) should return the logged-in user's profile.

---

## 6. Core Business Flows

### 6.1 Order → Shipment → Dispatch → Delivery

```
Order (Draft)
   │  POST /api/orders
   │  stock validated & reserved
   ▼
Order (Confirmed)  ── PUT /api/orders/:id/status ──┐
   │                                                 │ stock returned
   │  POST /api/shipments                            │ on Cancel
   ▼                                                 │
Shipment (Created)                                    ▼
   │  POST /api/dispatches                    Order (Cancelled)
   │  vehicle → In-Use, driver → unavailable
   ▼
Shipment (Assigned)
   │  PUT /api/shipments/:id/status → In-Transit → Out-for-Delivery
   ▼
Shipment (Delivered)  ──► auto-syncs ──► Order (Delivered)
   │
   │  PUT /api/dispatches/:id/complete
   ▼
Vehicle → Available, Driver → available
```

### 6.2 Inventory Low-Stock Notification

```
PUT /api/inventory/:id/deduct
   │
   ▼
quantity -= deductionAmount
   │
   ├─ quantity < 0 ?  ──► reject (400)
   │
   ├─ quantity < reorderThreshold ?
   │      │
   │      ▼
   │  lowStockAlert = true
   │      │
   │      ▼
   │  Notification created for relevant role
   ▼
200 OK
```

### 6.3 Dispatch Assignment (Availability Validation)

```
POST /api/dispatches { shipmentId, vehicleId, driverId, scheduledDate, routeNotes }
   │
   ▼
Fetch Vehicle, Driver, Shipment
   │
   ├─ Vehicle not found?     ──► 404
   ├─ Driver not found?      ──► 404
   ├─ Shipment not found?    ──► 404
   ├─ Vehicle.status ≠ Available? ──► 400 "Vehicle not available"
   ├─ Driver.available ≠ true?    ──► 400 "Driver not available"
   │
   ▼ (all pass)
Create Dispatch
Vehicle.status = 'In-Use'
Driver.available = false
Shipment.status = 'Assigned'
   │
   ▼
201 Created
```

---

## 7. API Reference

Base URL: `/api`. All routes except `register`/`login` require header `Authorization: Bearer <token>`.

### 7.1 Auth (`/api/auth`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/register` | Public | Create a user account |
| POST | `/login` | Public | Authenticate, returns JWT (8h expiry) |
| POST | `/logout` | Any | Logout |
| GET | `/me` | Any | Get current logged-in user's profile |
| GET | `/users` | Administrator | List all users |

### 7.2 Warehouses (`/api/warehouses`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Administrator, Warehouse Manager | Create warehouse |
| GET | `/` | Any | List warehouses (filter: `city`, `status`; paginated) |
| GET | `/:id` | Any | Get warehouse detail |
| PUT | `/:id` | Administrator, Warehouse Manager | Update warehouse |
| DELETE | `/:id` | Administrator, Warehouse Manager | Soft delete (status → Inactive) |

### 7.3 Products (`/api/products`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Administrator, Warehouse Manager | Create product |
| GET | `/` | Any | List products (filter: `category`, search by name/SKU; paginated) |
| GET | `/:id` | Any | Get product detail |
| PUT | `/:id` | Administrator, Warehouse Manager | Update product |
| DELETE | `/:id` | Administrator, Warehouse Manager | Soft delete |

### 7.4 Inventory (`/api/inventory`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Administrator, Warehouse Manager | Create inventory record |
| GET | `/` | Any | List (filter: `warehouseId`, `productId`, low-stock flag; paginated) |
| GET | `/low-stock` | Administrator, Warehouse Manager | List all low-stock flagged records |
| GET | `/:id` | Any | Get inventory detail |
| PUT | `/:id/restock` | Administrator, Warehouse Manager | Increment quantity |
| PUT | `/:id/deduct` | Administrator, Warehouse Manager | Decrement quantity (blocks negative stock, auto-flags low stock) |

### 7.5 Customers (`/api/customers`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Administrator, Logistics Coordinator | Onboard customer |
| GET | `/` | Any | List customers (search name/email/phone, filter status; paginated) |
| GET | `/:id` | Any | Full customer profile + order summary |
| PUT | `/:id` | Any authenticated | Update customer |
| DELETE | `/:id` | Administrator, Logistics Coordinator | Deactivate customer |

### 7.6 Orders (`/api/orders`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Any authenticated | Create order (validates & reserves stock) |
| GET | `/` | Any | List orders (filter: status, customerId, date range; paginated) |
| GET | `/:id` | Any | Order detail with items |
| PUT | `/:id/status` | Any authenticated | Status transition (Draft → Confirmed → Processing → Dispatched → Delivered / Cancelled) |

### 7.7 Shipments (`/api/shipments`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Administrator, Logistics Coordinator | Create shipment from confirmed order |
| GET | `/` | Any | List shipments (filter status, warehouseId, date; paginated) |
| GET | `/:id` | Any | Shipment detail incl. tracking history |
| PUT | `/:id/status` | Any authenticated | Status transition (Created → Assigned → In-Transit → Out-for-Delivery → Delivered/Failed); auto-syncs linked Order on Delivered |
| POST | `/:id/tracking` | Any authenticated | Append a tracking event |

### 7.8 Vehicles (`/api/vehicles`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Administrator, Warehouse Manager | Register vehicle |
| GET | `/` | Any | List (filter: status, type; paginated) |
| GET | `/available` | Any | List vehicles with `status: Available` |
| PUT | `/:id` | Administrator, Warehouse Manager | Update vehicle |
| DELETE | `/:id` | Administrator, Warehouse Manager | Set status to Maintenance |

### 7.9 Drivers (`/api/drivers`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Administrator, Warehouse Manager | Register driver |
| GET | `/` | Any | List (filter by `available`; paginated) |
| PUT | `/:id/availability` | Any authenticated | Set driver availability |
| DELETE | `/:id` | Administrator, Warehouse Manager | Set `available: false` |

### 7.10 Dispatch Planning (`/api/dispatches`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Administrator, Warehouse Manager | Assign shipment to vehicle+driver (validates availability) |
| GET | `/` | Any | List (filter: date, status; paginated) |
| GET | `/:id` | Any | Dispatch detail |
| PUT | `/:id/complete` | Administrator, Warehouse Manager | Complete dispatch — releases vehicle/driver, marks shipment Delivered |

### 7.11 Analytics (`/api/analytics`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/summary` | Any authenticated | KPI summary: active orders, shipments by status, warehouse utilisation, top products, dispatches completed this week |
| GET | `/orders-by-day` | Any authenticated | Order count per day, last 30 days |

### 7.12 Activity Logs (`/api/logs`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/` | Administrator | Paginated audit trail (filter: entity, userId, date range) |

### 7.13 Notifications (`/api/notifications`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/me` | Any authenticated | Current user's unread notifications, newest first |
| PATCH | `/:id/read` | Any authenticated | Mark one notification read |
| PATCH | `/read-all` | Any authenticated | Mark all of current user's notifications read |

### 7.14 Support Tickets (`/api/tickets`)

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/` | Any authenticated | Create ticket |
| GET | `/` | Any (self-filtered for non-Admin) | List tickets — Admin sees all, others see only assigned |
| PUT | `/:id/assign` | Administrator | Assign ticket to a support executive |
| PUT | `/:id/status` | Any authenticated | Update ticket status |
| POST | `/:id/comment` | Any authenticated | Append comment to ticket timeline |

---

## 8. Status Enums Reference

| Model | Field | Values |
|---|---|---|
| Order | `status` | Draft, Confirmed, Processing, Dispatched, Delivered, Cancelled |
| Shipment | `status` | Created, Assigned, In-Transit, Out-for-Delivery, Delivered, Failed |
| Vehicle | `status` | Available, In-Use, Maintenance |
| Driver | `available` | Boolean |
| Dispatch | *(no status field — inferred via linked Shipment status)* | — |
| Ticket | `status` | Open, In-Progress, Resolved, Closed |
| Ticket | `priority` | Low, Medium, High, Critical |
| ActivityLog | `action` | Create, Update, Delete |

---

## 9. Known Gaps / Notes for Future Work

- `ActivityLog` writes are currently implemented for Inventory, Order, and Shipment controllers only — Vehicle, Driver, and Dispatch actions are not yet audit-logged.
- Order/Ticket status transitions are not currently enforced as forward-only state machines at the API level (unlike Shipment).
- Full 5-role permission matrix testing was scoped down to representative write-endpoint sampling rather than exhaustive per-module testing.

---

*Document prepared as part of Week 4 deliverables — NextGen Forge Technologies Internship, Ref: NFGT/HR/INT/2026/160*