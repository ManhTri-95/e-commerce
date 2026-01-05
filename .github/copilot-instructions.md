# AI Coding Agent Instructions - E-Commerce Platform

## Architecture Overview

This is a **3-layer Node.js/Express e-commerce backend** with MongoDB:

```
Routes (Express) → Controllers → Services → Models + Repositories → MongoDB
```

**Key structural pattern**: Feature-driven organization where each domain (cart, product, discount, access) has its own route, controller, and service.

## Critical Patterns & Conventions

### 1. **Error Handling Architecture**
- **Custom error classes** in [src/core/error.response.js](src/core/error.response.js): `BadRequestError`, `AuthFailureError`, `NotFoundError`, `ForbiddenError`, `ConflictRequestError`
- **Always throw** these custom errors from services; global error handler in [src/app.js](src/app.js) catches and formats them
- **asyncHandler wrapper** in [src/helpers/asyncHandler.js](src/helpers/asyncHandler.js) automatically catches promise rejections in route handlers

**Pattern**: Controllers wrap async functions with `asyncHandler(fn)` - this enables clean async/await without try-catch boilerplate.

### 2. **Response Format**
- All success responses use `SuccessResponse` class ([src/core/success.response.js](src/core/success.response.js)) with `send(res)` method
- Standard format: `{ status, code, message, metadata }`
- All errors return `{ status: 'error', code, message, error }`

**Example**: `new SuccessResponse({ message: '...', metadata: data }).send(res);`

### 3. **Authentication & Authorization**
- **API Key validation** ([src/auth/checkAuth.js](src/auth/checkAuth.js)): Middleware checks `x-api-key` header against MongoDB `apiKey` model
- **Role-based permissions** ([src/auth/checkAuth.js](src/auth/checkAuth.js)): `permission('0000')` middleware validates permissions array
- **JWT tokens** ([src/auth/authUtils.js](src/auth/authUtils.js)): Access + refresh token pairs with key rotation
- Routes are protected by global `apiKey` middleware; role checks use `permission()` middleware

### 4. **Database Layer Pattern**
- **Repositories** in [src/models/repositories/](src/models/repositories/) handle all MongoDB queries
  - Named exports: `findAllDraftForShop`, `publishProductByShop`, etc.
  - Methods return raw queries or document counts (lean() for read operations)
- **Models** in [src/models/](src/models/): Mongoose schemas with embedded repository methods
- **Services** orchestrate business logic by calling repository methods

**Key tool**: Utility functions in [src/utils/index.js](src/utils/index.js):
- `getSelectData(fields)` → converts array to MongoDB select projection `{ field: 1 }`
- `unSelectData(fields)` → inverted projection `{ field: 0 }`
- `removeUndefinedObject(obj)` → recursively strips null/undefined values before DB updates

### 5. **Service Layer Patterns**
- Services are **static class methods** (see [src/services/product.service.js](src/services/product.service.js), [src/services/access.service.js](src/services/access.service.js))
- **ProductFactory pattern** for polymorphic behavior across product types (`Electronic`, `Clothing`, `Furniture`)
- Services handle business logic; repositories handle queries

### 6. **Product Type System**
Products have `product_type` enum: `['Electronic', 'Clothing', 'Furniture']`
- Each type has attributes stored in `product_attributes` (Mixed schema field)
- Factory pattern in `ProductFactory` (servicev2 version) handles type-specific creation/updates

### 7. **Data State Management**
Products track state with flags:
- `isDraft: true` → shop working on it
- `isPublished: true` → visible to customers
- Controllers use `publishProductByShop` / `unPublishProductByShop` repository methods to toggle

## Key Files to Understand

| File | Purpose |
|------|---------|
| [src/app.js](src/app.js) | Express setup, middleware, global error handler |
| [src/routes/index.js](src/routes/index.js) | Route registration, API versioning |
| [src/helpers/asyncHandler.js](src/helpers/asyncHandler.js) | Async error wrapper |
| [src/core/error.response.js](src/core/error.response.js) | Error class hierarchy |
| [src/models/repositories/](src/models/repositories/) | All MongoDB operations |
| [src/utils/index.js](src/utils/index.js) | Projection helpers, object cleaning |

## Running the Project

```bash
npm install          # Install dependencies
npm run dev          # Watch mode (node --watch server.js)
npm start            # Production (node server.js)
```

**Environment**: Configure `DEV_APP_PORT` / `PROD_APP_PORT` and MongoDB connection in `.env`

## Common Implementation Tasks

### Adding a new endpoint:
1. Create route handler in `routes/[feature]/index.js`
2. Wire controller method → async handler wrapper required
3. Call service static method; catch/throw custom errors
4. Wrap response in `SuccessResponse`

### Adding a new feature (e.g., "Order"):
1. Create `models/order.model.js` with Mongoose schema
2. Create `models/repositories/order.repo.js` with query methods
3. Create `services/order.service.js` with business logic
4. Create `controllers/order.controller.js` with route handlers
5. Create `routes/order/index.js` and register in `routes/index.js`

### Querying with projections:
Use `getSelectData(['field1', 'field2'])` for inclusion or `unSelectData(['sensitive'])` for exclusion in `.select()`

## Gotchas & Non-Standard Patterns

- **No test framework** configured yet (`npm test` is a placeholder)
- **Versioning via URL**: `/v1/api/` indicates API v1; routes not parameterized by version
- **Graceful shutdown commented out**: See [server.js](server.js) line 14-16
- **Product schema uses Mixed type** for flexible attributes per product type
- **Token refresh mechanism** has two versions (`handleRefreshTokenUsed` vs `handleRefreshTokenUsedV2` in [src/services/access.service.js](src/services/access.service.js)) - use V2 for new code

## Dependencies

- **express** 5.2.1 - Framework
- **mongoose** 9.0.1 - MongoDB ODM
- **jsonwebtoken** - JWT auth
- **bcrypt** - Password hashing
- **lodash** - Utility functions
- **morgan** - Logging
- **helmet** - Security headers
- **compression** - Response compression
