# Architecture Decisions

## 001: Isolated Deployments Per Clinic

Each clinic receives its own application instance, database, files, and infrastructure configuration. The product is not multi-tenant and does not use `tenant_id`.

## 002: Modular Monolith

Laravel and React/Inertia remain in one repository and deployment unit. Modules are organized application areas, not microservices or Composer packages.

## 003: Module Catalog In Code

Module codes and dependencies are stable application concepts. The database records enabled state and installation configuration, while code defines valid dependencies.

## 004: Explicit Clinical Authorization

`SUPER_ADMIN` has administrative permissions only. Clinical permissions remain explicit to avoid accidental access to sensitive data.

## 005: Database-Backed Operational Drivers

Sessions, cache, and queues use database drivers initially. Services must not depend on Redis so Redis can be adopted later without module redesign.

## 006: TypeScript Frontend Entry Point

The Inertia React frontend uses `resources/js/app.tsx`, TypeScript pages, a strict `tsconfig.json`, and the `@` alias. Do not reintroduce parallel JavaScript entry points.
