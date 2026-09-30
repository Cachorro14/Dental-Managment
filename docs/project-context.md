# Project Context

## Product

Dental Clinic is a configurable administrative platform for dental clinics.

Each customer runs an independent installation with its own server, MySQL database, storage, domain, branding, settings, and enabled modules. This is not a shared multi-tenant application: do not add `tenant_id` columns or customer-specific conditionals.

All customers use the same repository and codebase. Differences are expressed through modules, features, settings, permissions, branding, and integrations.

## Technical Stack

- PHP 8.4
- Laravel 13
- React 18 with TypeScript
- Inertia 2 and Vite 8
- Tailwind CSS 4
- MySQL 8 in target environments
- Spatie Laravel Permission
- Pest
- Database drivers for sessions, cache, and queues initially

## Architecture

The application is a modular monolith. Laravel and React/Inertia live in the same repository. Do not create microservices or separate frontend repositories.

- Core capabilities: authentication, users, roles, permissions, modules, features, settings, audit log, and system administration.
- Business capabilities: Patients first; appointments, clinical history, odontogram, treatments, inventory, billing, and reports later.
- Backend authorization is authoritative. Frontend gates are UX only.
- Use Form Requests for validation, policies for resource authorization, and thin controllers.
- Do not add repositories, interfaces, or abstractions without a concrete need.

## Current Status

Completed:

- Phase 1: architecture design.
- Phase 2: Laravel, React, Inertia, TypeScript, Tailwind, Pest, Spatie Permission, database session/cache/queue configuration, and base verification.
- Phase 3: authentication, roles, permissions, seeders, and authorization tests.
- Phase 4: module, feature, and dependency catalog with persisted states and middleware protection.
- Phase 5: installation settings, branding, and shared Inertia props.
- Phase 6: Patients CRUD, soft deletes, policies, permissions, React pages, tests, and seed data.
- Phase 8: Appointments CRUD, patient/dentist relationships, permissions, React pages, tests, and seed data.
- Initial frontend foundation: branding settings, role-based module access, dashboard metrics, responsive navigation, and admin customization screens.

In progress:

- Phase 8: clinical modules after Patients, starting with Appointments.

## Confirmed Decisions

- `SUPER_ADMIN` manages system capabilities but has no implicit access to clinical data.
- Users may hold multiple Spatie roles. Never add a `role` column to `users`.
- Patients are not users and will live in a dedicated `patients` table.
- IDs are auto-incrementing BIGINT values unless a later requirement justifies another type.
- Patients will use soft deletes; clinical information must not be physically deleted in normal workflows.
- Environment variables are for infrastructure and secrets. Editable installation settings belong in the database.

## Commands

```bash
composer install
npm.cmd install
php artisan migrate --seed
composer run dev
npm.cmd run build
php artisan test
npx.cmd tsc --noEmit
```

On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution blocks `npm.ps1`.
