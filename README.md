# LogiFlow

Enterprise logistics and warehouse management platform. MERN stack, five-role RBAC, fifteen operational modules covering the full chain from inventory to delivery.

Built for NextGen Forge Technologies' Advanced Full Stack Software Development Internship (Ref: NFGT/HR/INT/2026/160).

## Contents

- [What this is](#what-this-is)
- [Architecture](#architecture)
- [Stack](#stack)
- [Roles](#roles)
- [Setup](#setup)
- [Repo layout](#repo-layout)
- [Data models](#data-models)
- [API](#api)
- [Things worth knowing before you touch this](#things-worth-knowing-before-you-touch-this)
- [Deployment](#deployment)

## What this is

A company running warehouses, taking orders, and shipping product needs somewhere to track: what's in stock, who's allowed to touch what, where an order is in its lifecycle, which truck and driver are free, and what's on fire (support tickets). LogiFlow is that system — one backend, one frontend, five roles that each see a different slice of it.

It's not multi-tenant. It's not meant to run more than one company's operations. It assumes a small internal team, which is why user accounts are provisioned by an admin rather than through self-signup — see the Roles section.

## Architecture

Three tiers, deployed separately:

```
React SPA (Vercel)  --HTTPS/JSON+JWT-->  Express API (Render)  --Mongoose-->  MongoDB Atlas
```

Frontend and backend don't share a runtime — they're two separate deployments that only talk over REST. The frontend has no server-side rendering; it's a pure client-side SPA that hits the API for everything, including the initial "am I logged in" check on page load.

Auth is stateless. Login returns a JWT; every subsequent request carries it as a `Bearer` token. The backend has no session store — `verifyToken` middleware decodes the JWT on every request, `authorizeRoles(...)` checks the decoded role against a route's allowlist. Nothing is cached server-side about who's logged in.

The frontend mirrors this with two nested route guards: `ProtectedRoute` (are you logged in at all) wraps `RoleProtectedRoute` (does your role match this route group's allowlist). Both exist because hiding a link in the sidebar isn't access control — a user can still type the URL directly, so the actual gate has to live in the route tree, not just the nav.

Two things worth calling out about how state moves through the app, because they trip people up:

- The dashboard's cross-module aggregates (`totalActiveOrders`, `shipmentsByStatus`, `warehouseUtilisation`, etc.) are computed live via Mongo aggregation pipelines on every request to `/api/analytics/summary`. There's no caching layer, no scheduled job pre-computing anything. Fine at current scale; would need revisiting if this ever handled meaningfully more data.
- Status transitions that cascade across models (an order going Confirmed reserves inventory, a shipment going Delivered flips its linked order, a dispatch completing frees a vehicle and driver) are handled by explicit code in the relevant controller, not database triggers or hooks. This means the cascade logic lives with whichever endpoint happens to trigger it, and if two different endpoints can both cause the same downstream effect, the cascade has to be duplicated in both places. This came up for real — see the Dispatch completion note below.

## Stack

Frontend: React (Vite), Tailwind, React Router v6, Axios, React Hook Form, Recharts, jsPDF + html2canvas for client-side PDF export.

Backend: Node/Express, Mongoose, JWT + bcrypt, express-validator, Multer.

Hosting: Vercel (frontend), Render (backend, free tier), MongoDB Atlas (M0 free tier).

## Roles

| Role | What they actually do in this app |
|---|---|
| Administrator | Everything. User provisioning, activity log review, full module access. |
| Warehouse Manager | Warehouse/Product CRUD, inventory restock, low-stock review, fleet and dispatch management, reports. |
| Warehouse Executive | Inventory view and deduction. Narrower than Warehouse Manager on purpose — they can move stock, not restructure the warehouse. |
| Logistics Coordinator | Customers, orders, shipments — the sales-to-delivery pipeline. |
| Customer Support Executive | Tickets only. |

There's no signup page. Accounts are created by an Administrator via `POST /api/auth/register`, currently done through Postman rather than a UI — this was a deliberate call after a security review with the project's Industry Guide, not an oversight. A `CreateUser.jsx` page exists in the codebase (admin-gated, functional) but is intentionally left out of the route tree pending sign-off on whether to expose it in-app at all.

## Setup

Needs Node 18+, a MongoDB instance (Atlas or local), npm.

Backend:
```bash
cd backend
npm install
```
`.env` in `backend/`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/<db>?retryWrites=true&w=majority
JWT_SECRET=<anything long and random>
JWT_EXPIRES_IN=8h
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
PORT=8000
```
```bash
npm start
```

Frontend:
```bash
cd frontend
npm install
```
`.env` in `frontend/`:
```
VITE_API_BASE_URL=http://localhost:8000/api
```
```bash
npm run dev
```

No users exist on a fresh database. Create at least one per role manually:
```
POST http://localhost:8000/api/auth/register
{
  "name": "...",
  "email": "...",
  "password": "...",
  "role": "Administrator"
}
```

## Repo layout

```
backend/
  config/       Mongo connection
  controllers/  business logic, one file per resource
  middleware/   verifyToken, authorizeRoles
  models/       Mongoose schemas
  routes/       route definitions, wire controllers to middleware
  utils/        shared helpers (notification triggers etc.)
frontend/src/
  api/          Axios instance + interceptors
  components/   modals, Sidebar, TopNav, route guards, reusable pieces
  context/      AuthContext, ToastContext
  hooks/        useToast
  pages/        one component per route
  App.jsx       route tree + role guarding
```

## Data models

Twelve Mongoose schemas. No embedded documents for the core entities — everything's a reference, so it reads more like a relational schema wearing a document database's clothes. That's a deliberate choice for a system this interconnected; a fully embedded document model would mean duplicating warehouse/product data across every inventory record.

| Model | Notable fields | References |
|---|---|---|
| User | name, email, password (bcrypt), role | — |
| Warehouse | name, location, city, totalCapacity, managerId, status | managerId → User |
| Product | name, sku (unique), category, unit, status | — |
| Inventory | warehouseId, productId, quantity, reorderThreshold, lowStockAlert | warehouseId → Warehouse, productId → Product |
| Customer | companyName, contactPersonName, creditLimit, accountStatus | — |
| Order | customerId, warehouseId, orderItems[], totalAmount, status | customerId → Customer, warehouseId → Warehouse |
| Shipment | orderId, originWarehouseId, trackingId, status, trackingHistory[] | orderId → Order, originWarehouseId → Warehouse |
| Vehicle | licensePlate, type, capacityKg, status | — |
| Driver | name, licenceNumber, available, assignedVehicleId | assignedVehicleId → Vehicle (system-managed only, see below) |
| Dispatch | shipmentId, vehicleId, driverId, scheduledDate, routeNotes | shipmentId → Shipment, vehicleId → Vehicle, driverId → Driver |
| Ticket | title, priority, status, assigneeId, comments[] | assigneeId → User, linkedOrderId → Order (optional) |
| ActivityLog | entity, action, userId, timestamp | userId → User |

Status machines, all forward-only with a terminal-state exception for cancellation/failure:

- **Order**: Draft → Confirmed → Processing → Dispatched → Delivered, or Cancelled from any non-terminal state.
- **Shipment**: Created → Assigned → In-Transit → Out-for-Delivery → Delivered, or Failed. The frontend deliberately caps manual progression at Out-for-Delivery — Delivered is only reachable by completing the linked Dispatch, not by clicking through the shipment page. See below for why.
- **Ticket**: Open → In-Progress → Resolved → Closed.

## API

Bearer token required on everything except register/login. "Roles" column is empty where any authenticated user can hit the endpoint.

**Auth** — `/api/auth`

| | | |
|---|---|---|
| POST /register | create user | public (used admin-side via Postman) |
| POST /login | returns JWT + user | public |
| GET /me | session restore on app load | any |
| GET /users | list all users | Administrator |

**Warehouses** — `/api/warehouses`

| | | |
|---|---|---|
| POST / | create | Admin, Warehouse Manager |
| GET / | list, filters: city (regex), status | any |
| GET /:id | detail | any |
| PUT /:id | update, incl. managerId | Admin, Warehouse Manager |
| DELETE /:id | soft delete → Inactive | Admin, Warehouse Manager |

**Products** — `/api/products`

| | | |
|---|---|---|
| POST / | create | Admin, Warehouse Manager |
| GET / | list, filters: category (regex), name/sku search | any |
| GET /:id | detail | any |
| PUT /:id | update | Admin, Warehouse Manager |
| DELETE /:id | soft delete | Admin, Warehouse Manager |

**Inventory** — `/api/inventory`

| | | |
|---|---|---|
| POST / | create record | Admin, Warehouse Manager |
| GET / | list, filters: warehouseId, productId, lowStockAlert | any |
| GET /low-stock | flagged records only | Admin, Warehouse Manager |
| GET /:id | detail | any |
| PUT /:id/restock | increment quantity | Admin, Warehouse Manager |
| PUT /:id/deduct | decrement, blocks negative, sets lowStockAlert | Admin, Warehouse Manager |

**Customers** — `/api/customers`

| | | |
|---|---|---|
| POST / | create | Admin, Logistics Coordinator |
| GET / | list, filters: companyName, accountStatus | Admin, Logistics Coordinator |
| GET /:id | detail | Admin, Logistics Coordinator |
| PUT /:id | update | Admin, Logistics Coordinator |
| DELETE /:id | soft delete | Admin, Logistics Coordinator |

**Orders** — `/api/orders`

| | | |
|---|---|---|
| POST / | create, validates + reserves stock | Admin, Logistics Coordinator |
| GET / | list, filters: status, customerId, date range | Admin, Logistics Coordinator |
| GET /:id | detail | Admin, Logistics Coordinator |
| PUT /:id/status | status transition, cancellation returns stock | Admin, Logistics Coordinator |

**Shipments** — `/api/shipments`

| | | |
|---|---|---|
| POST / | create from a Confirmed order | Admin, Logistics Coordinator |
| GET / | list, filters: status, originWarehouseId, date range | Admin, Logistics Coordinator |
| GET /:id | detail incl. tracking history | Admin, Logistics Coordinator |
| PUT /:id/status | status transition; Delivered syncs linked Order | Admin, Logistics Coordinator |
| POST /:id/tracking | append tracking event | Admin, Logistics Coordinator |

**Vehicles** — `/api/vehicles`

| | | |
|---|---|---|
| POST / | create | Admin, Warehouse Manager |
| GET / | list, filters: status, type | any |
| GET /available | Available-status vehicles only | any |
| PUT /:id | update | Admin, Warehouse Manager |
| DELETE /:id | soft delete → Maintenance | Admin, Warehouse Manager |

**Drivers** — `/api/drivers`

| | | |
|---|---|---|
| POST / | create | Admin, Warehouse Manager |
| GET / | list, filter: available | any |
| PUT /:id | update name/licence/phone only | Admin, Warehouse Manager |
| PUT /:id/availability | toggle | any |
| DELETE /:id | delete | Admin, Warehouse Manager |

**Dispatches** — `/api/dispatches`

| | | |
|---|---|---|
| POST / | create, assigns vehicle+driver, shipment → Assigned | Admin, Warehouse Manager |
| GET / | list, filter: date | any |
| GET /:id | detail | any |
| PUT /:id/complete | frees vehicle+driver, Shipment+Order → Delivered | Admin, Warehouse Manager |

**Tickets** — `/api/tickets`

| | | |
|---|---|---|
| POST / | create | any |
| GET / | list, filters: status, priority | any |
| PUT /:id/assign | assign to a user | Administrator |
| PUT /:id/status | status transition | any |
| POST /:id/comment | append comment | any |

**Analytics** — `/api/analytics`

| | | |
|---|---|---|
| GET /summary | dashboard KPIs, warehouse utilisation, top products | any |
| GET /orders-by-day | last 30 days, daily order counts | any |

**Logs** — `/api/logs`

| | | |
|---|---|---|
| GET / | activity log, filters: entity, userId, date range | Administrator |

**Notifications** — `/api/notifications`

| | | |
|---|---|---|
| GET /me | current user's unread | any |
| PATCH /:id/read | mark one read | any |
| PATCH /read-all | mark all read | any |

## Things worth knowing before you touch this

**Driver–vehicle assignment is fully automatic, on purpose.** `Driver.assignedVehicleId` used to be editable directly through the driver form, independent of whatever dispatch that driver was actually on. That let a driver's profile disagree with reality — assigned to Vehicle A on paper, actually out with Vehicle B on an active dispatch. Fixed by removing manual assignment entirely. The field is now written only by `POST /dispatches` (on assignment) and cleared only by `PUT /dispatches/:id/complete`. If you're tempted to add a manual override back in, don't — that's exactly the bug this fixes.

**`Dispatch` has no `status` field.** Whether one is "done" is inferred client-side from its linked shipment's status (`Delivered` or `Failed` means done). This is a schema gap, not a frontend workaround choice — it'd be cleaner with an explicit status field, just wasn't caught until the UI was already built around inferring it.

**Manually marking a shipment `Delivered` is capped one step short on the frontend.** The Shipment Detail page lets you walk a shipment through Created → Assigned → In-Transit → Out-for-Delivery, and stops there. Reaching Delivered requires completing the Dispatch instead. This exists because the two code paths that can set a shipment to Delivered — the manual status endpoint and dispatch completion — don't share logic, and only one of them frees up the vehicle/driver. Letting the manual path reach Delivered meant a shipment could complete while its vehicle and driver stayed permanently marked unavailable. Capping the manual path was the faster fix; the more correct fix would be consolidating both into one shared function, which hasn't been done yet.

**No `GET /tickets/:id`.** The ticket detail page fetches the full list and finds the match client-side. Works fine at current volume, won't scale indefinitely — flagging it here so it's not mistaken for an oversight if someone goes looking for the endpoint and doesn't find it.

**`GET /vehicles/available` returns its array under the key `vehicle`, singular** — every other list endpoint uses the plural. Frontend code already accounts for this. Left as-is rather than fixed, since fixing it means touching a working endpoint and everywhere that calls it for a purely cosmetic inconsistency.

**Notifications only fire for low-stock and shipment-failure.** Dispatch confirmation and ticket assignment don't trigger notifications — not missing by accident, just outside what was actually scoped as required.

**No unique index on `{warehouseId, productId}` in Inventory.** Nothing stops two inventory records existing for the same product in the same warehouse. Hasn't caused a problem in practice; would if inventory creation became a high-traffic path with concurrent writes.

**Product has no price field.** Order line items collect unit price manually at order-creation time rather than pulling a default from the product record. Fine for now, but means the same product can get entered at different prices across different orders with no record of which is "correct" — a real gap if pricing consistency ever matters here.

A full bug log — every issue hit across all eight weeks, severity, root cause, how it got fixed — lives in `Reports/` locally (excluded from the public repo).

## Deployment

| | | |
|---|---|---|
| Frontend | Vercel | root dir `frontend`. Needs `frontend/vercel.json` with a SPA rewrite (`/(.*) → /index.html`) or direct navigation to any route other than `/` 404s — Vercel has no idea `/login` is a valid path without being told. |
| Backend | Render | root dir `backend`. Free tier spins down after ~15 min idle; first request after that takes 30-60s to wake up. |
| Database | MongoDB Atlas | M0 free tier. Network access whitelisted to `0.0.0.0/0` — Render's free tier doesn't expose a fixed outbound IP, so there's nothing narrower to whitelist. |

Live:
- Frontend — https://logi-flow-gamma.vercel.app/dashboard
- Backend — https://logiflow-backend-id6g.onrender.com

Env vars that matter in production specifically: `VITE_API_BASE_URL` on Vercel has to point at the live Render URL with `/api` appended, and it's read via `import.meta.env` at build time — changing it after a deploy does nothing until you trigger a fresh build, since Vite bakes it into the bundle rather than reading it at runtime. `CORS_ORIGIN` on Render has to match the exact Vercel URL, no trailing slash, or every request from the live frontend gets blocked before it reaches any route.