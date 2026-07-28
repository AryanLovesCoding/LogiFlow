# LogiFlow Backend — Schema Design

## Overview
LogiFlow is a MERN-stack Enterprise Logistics & Warehouse Management platform. This document describes the MongoDB/Mongoose schema design for the backend.

## Design Decisions

- **Role** is not implemented as a separate model. Instead, it is stored as an `enum` field (`role`) directly on the `User` schema, since roles are a fixed, small set of values (5 total) tightly coupled to user accounts, with no independent attributes of their own.
- **OrderItem** and **ShipmentEvent** are not separate top-level collections. They are implemented as **subdocument arrays** nested inside `Order` (`orderItems`) and `Shipment` (`trackingHistory`) respectively, since they only ever exist in the context of their parent document and are always fetched/updated together with it.

## Models

| Model | Key Fields | Notes |
|---|---|---|
| **User** | `name`, `email` (unique), `password`, `role` (enum: Administrator, Warehouse Manager, Warehouse Executive, Logistics Coordinator, Customer Support Executive) | Core auth/identity model |
| **Warehouse** | `name`, `location`, `city`, `totalCapacity`, `status` (enum: Active/Inactive, default Active), `managerId` (ref: User) | |
| **Product** | `name`, `sku` (unique), `category`, `unit`, `description`, `status` (enum: Active/Inactive, default Active) | |
| **Inventory** | `warehouseId` (ref: Warehouse), `productId` (ref: Product), `quantity` (min 0, default 0), `reorderThreshold`, `unit`, `lowStockAlert` (default false) | Links Warehouse + Product; tracks stock levels |
| **Customer** | `companyName`, `contactPersonName`, `email` (unique), `phone`, `address`, `creditLimit`, `accountStatus` (enum: Active/Inactive, default Active) | B2B client records |
| **Order** | `customerId` (ref: Customer), `warehouseId` (ref: Warehouse), `orderItems` (subdocument array: productId, quantity, unitPrice), `totalAmount`, `status` (enum: Draft/Confirmed/Processing/Dispatched/Delivered/Cancelled, default Draft) | |
| **Shipment** | `orderId` (ref: Order), `originWarehouseId` (ref: Warehouse), `destinationAddress`, `trackingId` (unique), `status` (enum: Created/Assigned/In-Transit/Out-for-Delivery/Delivered/Failed, default Created), `trackingHistory` (subdocument array: location, description, timestamp) | |
| **Vehicle** | `licensePlate` (unique), `type`, `capacityKg`, `status` (enum: Available/In-Use/Maintenance, default Available) | |
| **Driver** | `name`, `licenseNumber` (unique), `phone`, `available` (default true), `assignedVehicleId` (ref: Vehicle) | |
| **Dispatch** | `shipmentId` (ref: Shipment), `vehicleId` (ref: Vehicle), `driverId` (ref: Driver), `scheduledDate`, `routeNotes` | Links Shipment + Vehicle + Driver |
| **Ticket** | `title`, `description`, `priority` (enum: Low/Medium/High/Critical, default Medium), `linkedOrderId` (ref: Order, optional), `status` (enum: Open/In-Progress/Resolved/Closed, default Open), `comments` (subdocument array: content, userId, timestamp) | |
| **Notification** | `receiverId` (ref: User), `content`, `read` (default false), `type` | |
| **ActivityLog** | `userId` (ref: User), `action` (enum: Create/Update/Delete), `entity`, `entityId` (no ref — generic ObjectId) | Immutable audit trail |

All models use Mongoose's `{ timestamps: true }` option to automatically track `createdAt`/`updatedAt`.

## Tech Stack (Backend)
- Node.js + Express.js
- MongoDB Atlas + Mongoose (ODM)
- JWT + bcrypt (authentication)
- Express Validator (input validation)
- Multer (file uploads)

## Environment Variables
See `.env` (gitignored) for `MONGODB_URI`, `PORT`, and other secrets — never committed to version control.