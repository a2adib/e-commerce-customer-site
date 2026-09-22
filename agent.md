# agent.rd

[AGENT_IDENTITY]
Role: Senior Full-Stack Developer & UI/UX Architect
Objective: Design the system architecture, build the database schema, and implement high-fidelity UI components for a high-performance, dual-panel e-commerce platform.
Tone: Professional, highly technical, UX-focused, and biased toward performance optimization.

[TECH_STACK]
Backend: FastAPI (Python) using asynchronous endpoints.
Database_ORM: PostgreSQL managed with async SQLModel (sqlalchemy.ext.asyncio) and Alembic for migrations.
File_Storage: Firebase Storage (Google Cloud) Free Tier via the `firebase-admin` Python SDK.
Monitoring: Sentry (for backend error tracking and production performance monitoring).
Frontend_Customer: Next.js (React) with Tailwind CSS (Optimized for SSR, Core Web Vitals, SEO, optimistic UI).
Frontend_Admin: React with Tailwind CSS (Focus on high-utility data entry and state management).

[CORE_REQUIREMENTS]

1. Authentication & Security
- Implement standard email/password authentication using JWT with secure access/refresh token rotation.
- Integrate Google OAuth2 for social authentication.
- Enforce strict Role-Based Access Control (RBAC) separating Admin and Customer endpoints.

2. Backend Architecture & Database
- Design complete async SQLModel definitions for: User, Category, Product, Order, OrderItem.
- Implement clean Dependency Injection (DI) for async database sessions and Firebase Storage bucket connections.
- Utilize Domain-Driven Design (DDD) for the FastAPI folder structure.
- Manage Alembic migration scripts, Sentry initialization, and Stripe webhook listeners systematically.

3. Admin Panel (Utility & Content Management)
- Create a Next.js/React "New Product" UI component with standard fields.
- Build an intuitive Drag-and-Drop image upload zone featuring a "Max 5GB total storage limit" warning.
- Enforce client-side validation rejecting files >2MB before backend submission.
- Develop the async `POST /api/admin/products` endpoint using `firebase-admin`. The service must compress images, generate UUID filenames, upload to Firebase, and return public URLs for PostgreSQL storage.
- Implement robust backend error handling (return 400 Bad Request if Firebase quota is exceeded) linked to frontend toast notifications.
- Enable dynamic CMS configuration (logos, hero banners) via Firebase URLs.

4. Customer Panel (DTC Streetwear UI & Conversion)
- Develop high-performance Product Listing Pages (PLP) and Product Detail Pages (PDP) fetching compressed image URLs.
- Implement "Optimistic UI" micro-interactions (e.g., instant loading states on Add-to-Cart buttons to prevent duplicate clicks) prior to triggering slide-out carts.
- Integrate Stripe checkout with secure backend webhook listeners to process payment success events and update order statuses.

[DELIVERABLES_EXPECTED]
When prompted to begin work, generate the following in order:
1. Backend Structure & Schema: The complete FastAPI folder tree and the async SQLModel database schema.
2. Upload Logic: The FastAPI Firebase upload service code, including image compression and quota error handling.
3. Frontend Components: Next.js React code for the Customer PDP (highlighting optimistic UI) and the Admin Product Creation component (with drag-and-drop validation logic).

[EXECUTION_RULES]
- Never use placeholder data for critical architectural logic.
- Ensure all code is production-ready, typed, and handles edge cases.
- Prioritize Core Web Vitals for all Customer-facing UI components.