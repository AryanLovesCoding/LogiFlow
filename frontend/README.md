# LogiFlow — Enterprise Logistics & Warehouse Management Platform

LogiFlow is a full-stack MERN application that digitizes end-to-end logistics and warehouse operations: warehouse and inventory management, customer and order management, shipment lifecycle tracking, fleet/dispatch planning, support ticketing, analytics, and reporting — all behind a five-role RBAC layer.

Built as part of the NextGen Forge Technologies Advanced Full Stack Software Development Internship (Ref: NFGT/HR/INT/2026/160).

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Roles & Access Control](#roles--access-control)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Folder Structure](#folder-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Design Notes & Known Limitations](#design-notes--known-limitations)
- [Deployment](#deployment)

---

## Architecture

LogiFlow follows a decoupled three-tier architecture:

```
┌─────────────────┐      HTTPS/REST      ┌──────────────────┐      Mongoose ODM      ┌─────────────────┐
│   React (Vite)   │ ───────────────────► │  Express.js API   │ ─────────────────────► │  MongoDB Atlas   │
│   Frontend SPA    │ ◄─────────────────── │  (Node.js)         │ ◄───────────────────── │  (M0 free tier)  │
│   Hosted: Vercel  │      JSON + JWT      │  Hosted: Render     │                        │                  │
└─────────────────┘                        └──────────────────┘                        └─────────────────┘
```

- **Frontend**: React 18 SPA (Vite build tooling), React Router v6 for client-side routing, Axios for API calls with a request interceptor (attaches JWT) and a response interceptor (handles 401 → forced logout/redirect).
- **Backend**: Express.js REST API. Stateless authentication via JWT. Role-based authorization enforced via middleware on every protected route.
- **Database**: MongoDB Atlas, accessed via Mongoose ODM. Documents reference each other via `ObjectId` (no embedded sub-collections for core entities), approximating relational structure inside a document database.
- **Frontend route protection**: two layers — `ProtectedRoute` (authentication check) wraps `RoleProtectedRoute` (authorization check per route group), mirroring backend `verifyToken` + `authorizeRoles` middleware.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 (Vite) |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| HTTP client | Axios |
| Form handling | React Hook Form |
| Charts | Recharts |
| PDF export (client) | jsPDF + html2canvas |
| Backend runtime | Node.js |
| Backend framework | Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | express-validator |
| File uploads | Multer |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Roles & Access Control

Five roles, enforced identically on both frontend (sidebar visibility + route guarding) and backend (middleware):

| Role | Primary Responsibilities | Module Access |
|---|---|---|
| **Administrator** | Full system oversight, user provisioning, activity log review | All modules |
| **Warehouse Manager** | Warehouse/Product CRUD, inventory restock, low-stock review, fleet & dispatch oversight | Warehouses, Products, Inventory, Vehicles, Drivers, Dispatches, Reports |
| **Warehouse Executive** | Inventory deduction, shipment tracking | Inventory (view/deduct) |
| **Logistics Coordinator** | Order creation & confirmation, shipment creation, dispatch assignment | Customers, Orders, Shipments |
| **Customer Support Executive** | Ticket intake, assignment, resolution | Tickets |

User provisioning is currently performed by an Administrator directly via `POST /api/auth/register` (e.g. via Postman), by design — there is no public self-service registration screen. An Admin-only "Create User" screen (`/users/new`) exists in the codebase but is intentionally not wired into routing/navigation pending confirmation from the Industry Guide, per a security/confidentiality discussion in a biweekly review.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string, including target database name | `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/<db>?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret used to sign/verify JWTs | any strong random string |
| `JWT_EXPIRES_IN` | Token expiry duration | `8h` |
| `NODE_ENV` | Environment flag | `development` \| `production` |
| `CORS_ORIGIN` | Allowed origin for CORS (production frontend URL) | `https://logi-flow-gamma.vercel.app` |
| `PORT` | Port the Express server listens on | `8000` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL the frontend targets for all API calls | `http://localhost:8000/api` (local) / `https://logiflow-backend.onrender.com/api` (prod) |

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas cluster (or local MongoDB instance)
- npm

### Backend

```bash
cd backend
npm install
# create .env with the variables listed above
npm start
```

Backend runs on `http://localhost:8000` by default (or your configured `PORT`).

### Frontend

```bash
cd frontend
npm install
# create .env with VITE_API_BASE_URL pointing at your local backend
npm run dev
```

Frontend runs on Vite's default dev port (typically `http://localhost:5173`).

### Creating initial users

No public registration exists. Create at least one user per role via Postman:

```
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@logiflow.com",
  "password": "YourPassword123!",
  "role": "Administrator"
}
```

Repeat for `Warehouse Manager`, `Warehouse Executive`, `Logistics Coordinator`, and `Customer Support Executive`.

## Folder Structure

```
LogiFlow/
├── backend/
│   ├── config/          # DB connection config
│   ├── controllers/     # Business logic per resource
│   ├── middleware/       # verifyToken, authorizeRoles
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   ├── utils/             # Shared helpers (e.g. notification triggers)
│   └── server.js / index.js
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance + interceptors
│   │   ├── components/      # Reusable UI (modals, Sidebar, TopNav, form components)
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── hooks/              # useToast, etc.
│   │   ├── pages/               # Route-level page components
│   │   └── App.jsx                # Route definitions + role guarding
│   └── vercel.json                 # SPA rewrite config for Vercel
└── Reports/                          # Weekly progress reports, bug log, bug report
```

## Data Models

Twelve core Mongoose schemas, referencing each other via `ObjectId`:

| Model | Key Fields | References |
|---|---|---|
| `User` | name, email, password (hashed), role | — |
| `Warehouse` | name, location, city, totalCapacity, managerId, status | `managerId` → User |
| `Product` | name, sku (unique), category, unit, description, status | — |
| `Inventory` | warehouseId, productId, quantity, reorderThreshold, unit, lowStockAlert | `warehouseId` → Warehouse, `productId` → Product |
| `Customer` | companyName, contactPersonName, email, phone, address, creditLimit, accountStatus | — |
| `Order` | customerId, warehouseId, orderItems[], totalAmount, status | `customerId` → Customer, `warehouseId` → Warehouse |
| `Shipment` | orderId, originWarehouseId, destinationAddress, trackingId, status, trackingHistory[] | `orderId` → Order, `originWarehouseId` → Warehouse |
| `Vehicle` | licensePlate, type, capacityKg, status | — |
| `Driver` | name, licenceNumber, phone, available, assignedVehicleId | `assignedVehicleId` → Vehicle (system-managed, see Design Notes) |
| `Dispatch` | shipmentId, vehicleId, driverId, scheduledDate, routeNotes | `shipmentId` → Shipment, `vehicleId` → Vehicle, `driverId` → Driver |
| `Ticket` | title, description, priority, status, linkedOrderId, assigneeId, comments[] | `linkedOrderId` → Order, `assigneeId` → User |
| `ActivityLog` | entity, action, userId, timestamp | `userId` → User |
| `Notification` | receiverId, content, type, read | `receiverId` → User |

Order status flow: `Draft → Confirmed → Processing → Dispatched → Delivered` (or `Cancelled`, from any non-terminal state).
Shipment status flow: `Created → Assigned → In-Transit → Out-for-Delivery → Delivered` (or `Failed`, from any non-terminal state). `Delivered` is only reachable through Dispatch completion in the frontend, not via manual status update, to keep vehicle/driver availability in sync.
Ticket status flow: `Open → In-Progress → Resolved → Closed`.

## API Reference

All endpoints (except `/auth/register` and `/auth/login`) require a `Bearer <token>` header. "Roles" lists which roles pass `authorizeRoles`; endpoints with no roles listed are accessible to any authenticated user.

### Auth (`/api/auth`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/register` | Create a user | — (public; used by Admin via Postman) |
| POST | `/login` | Authenticate, returns JWT + user info | — |
| GET | `/me` | Restore session on app load | any |
| GET | `/users` | List all users (for assignee/manager pickers) | Administrator |

### Warehouses (`/api/warehouses`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create warehouse | Administrator, Warehouse Manager |
| GET | `/` | List (filters: `city`, `status`, pagination) | any |
| GET | `/:id` | Get by ID | any |
| PUT | `/:id` | Update (incl. `managerId`) | Administrator, Warehouse Manager |
| DELETE | `/:id` | Soft delete (status → Inactive) | Administrator, Warehouse Manager |

### Products (`/api/products`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create product | Administrator, Warehouse Manager |
| GET | `/` | List (filters: `category`, name/SKU search, pagination) | any |
| GET | `/:id` | Get by ID | any |
| PUT | `/:id` | Update | Administrator, Warehouse Manager |
| DELETE | `/:id` | Soft delete | Administrator, Warehouse Manager |

### Inventory (`/api/inventory`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create inventory record | Administrator, Warehouse Manager |
| GET | `/` | List (filters: `warehouseId`, `productId`, `lowStockAlert`, pagination) | any |
| GET | `/low-stock` | List only low-stock flagged records | Administrator, Warehouse Manager |
| GET | `/:id` | Get by ID | any |
| PUT | `/:id/restock` | Increment quantity | Administrator, Warehouse Manager |
| PUT | `/:id/deduct` | Decrement quantity (blocks negative stock, sets `lowStockAlert`) | Administrator, Warehouse Manager |

### Customers (`/api/customers`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create customer | Administrator, Logistics Coordinator |
| GET | `/` | List (filters: `companyName`, `email`, `accountStatus`, pagination) | Administrator, Logistics Coordinator |
| GET | `/:id` | Get by ID | Administrator, Logistics Coordinator |
| PUT | `/:id` | Update | Administrator, Logistics Coordinator |
| DELETE | `/:id` | Soft delete (accountStatus → Inactive) | Administrator, Logistics Coordinator |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create order (validates stock, reserves inventory) | Administrator, Logistics Coordinator |
| GET | `/` | List (filters: `status`, `customerId`, date range, pagination) | Administrator, Logistics Coordinator |
| GET | `/:id` | Get by ID | Administrator, Logistics Coordinator |
| PUT | `/:id/status` | Update status (forward-only state machine; cancellation returns stock) | Administrator, Logistics Coordinator |

### Shipments (`/api/shipments`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create shipment from a Confirmed order | Administrator, Logistics Coordinator |
| GET | `/` | List (filters: `status`, `originWarehouseId`, date range, pagination) | Administrator, Logistics Coordinator |
| GET | `/:id` | Get by ID (incl. tracking history) | Administrator, Logistics Coordinator |
| PUT | `/:id/status` | Update status (syncs linked Order on Delivered; notifies on Failed) | Administrator, Logistics Coordinator |
| POST | `/:id/tracking` | Append a tracking event | Administrator, Logistics Coordinator |

### Vehicles (`/api/vehicles`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create vehicle | Administrator, Warehouse Manager |
| GET | `/` | List (filters: `status`, `type`, pagination) | any |
| GET | `/available` | List only Available vehicles | any |
| PUT | `/:id` | Update | Administrator, Warehouse Manager |
| DELETE | `/:id` | Soft delete (status → Maintenance) | Administrator, Warehouse Manager |

### Drivers (`/api/drivers`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create driver | Administrator, Warehouse Manager |
| GET | `/` | List (filter: `available`, pagination) | any |
| PUT | `/:id` | Update core details (name/licence/phone only — see Design Notes) | Administrator, Warehouse Manager |
| PUT | `/:id/availability` | Toggle availability | any |
| DELETE | `/:id` | Delete | Administrator, Warehouse Manager |

### Dispatches (`/api/dispatches`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create dispatch (assigns vehicle/driver, sets shipment → Assigned) | Administrator, Warehouse Manager |
| GET | `/` | List (filters: `date`, pagination) | any |
| GET | `/:id` | Get by ID | any |
| PUT | `/:id/complete` | Complete (frees vehicle/driver; sets Shipment + Order → Delivered) | Administrator, Warehouse Manager |

### Tickets (`/api/tickets`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| POST | `/` | Create ticket | any |
| GET | `/` | List (filters: `status`, `priority`, pagination) | any |
| PUT | `/:id/assign` | Assign to a user | Administrator |
| PUT | `/:id/status` | Update status | any |
| POST | `/:id/comment` | Append a comment | any |

### Analytics (`/api/analytics`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/summary` | Dashboard KPIs: active orders, shipments by status, warehouse utilisation, top products, dispatches this week | any |
| GET | `/orders-by-day` | Order counts for the last 30 days | any |

### Activity Logs (`/api/logs`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/` | List (filters: `entity`, `userId`, `startDate`, `endDate`, pagination) | Administrator |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| GET | `/me` | Current user's unread notifications | any |
| PATCH | `/:id/read` | Mark one as read | any |
| PATCH | `/read-all` | Mark all as read | any |

## Design Notes & Known Limitations

- **Driver–Vehicle assignment is fully automatic.** `Driver.assignedVehicleId` is set only by `POST /dispatches` and cleared only by `PUT /dispatches/:id/complete` — there is no manual assignment path in the UI. This was a deliberate fix after an earlier version allowed manual assignment via the Driver form, which could disagree with a driver's actual active dispatch.
- **`Dispatch` has no `status` field.** Whether a dispatch is "complete" is inferred on the frontend from its linked Shipment's status (`Delivered`/`Failed`).
- **Manually progressing a Shipment to `Delivered` is intentionally blocked** past `Out-for-Delivery` on the Shipment Detail page; `Delivered` is only reachable via Dispatch completion, so vehicle/driver availability stays in sync with shipment completion.
- **No `GET /tickets/:id` endpoint exists.** The Ticket Detail page fetches the full ticket list and finds the matching record client-side. Acceptable at current data volumes; a candidate for a dedicated endpoint if ticket volume grows significantly.
- **`GET /vehicles/available` returns its array under the key `vehicle`** (singular), inconsistent with other list endpoints which use plural keys. Frontend code accounts for this; flagged here for future API consistency cleanup.
- **Notification triggers are implemented for low-stock and shipment-failure only** (per the graded task list); dispatch-confirmation and ticket-assignment notifications are not implemented, as they were outside the explicit deliverable scope.
- **User provisioning has no self-service UI**, and a built Admin-only Create User page is intentionally left unwired pending a decision from the Industry Guide on whether to enable it, for confidentiality/security reasons.
- **Inventory has no unique constraint on `{warehouseId, productId}`**, so duplicate inventory records for the same product/warehouse pair are technically possible via the Add Inventory form.
- **Product has no price field**; order line-item unit price is captured manually per order during creation rather than defaulted from the product record.

A full structured bug log (37 issues tracked across all 8 weeks, with severity, root cause, and resolution) is maintained separately in `Reports/`.

## Deployment

| Layer | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Root directory: `frontend`. Requires `frontend/vercel.json` SPA rewrite config for React Router to work on direct/refreshed routes. |
| Backend | Render | Root directory: `backend`. Free tier — cold starts after ~15 min of inactivity. |
| Database | MongoDB Atlas | M0 free tier. Network access whitelisted to `0.0.0.0/0` (required since Render does not expose a fixed outbound IP on the free tier). |

**Live URLs:**
- Frontend: _(insert live Vercel URL)_
- Backend API: _(insert live Render URL)_

**Test credentials:** one user per role, created via `POST /api/auth/register` — see submission email / internal documentation for current credentials.