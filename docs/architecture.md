# Architecture

## Core And Modules

The product is a modular monolith. Core code is shared across all capabilities. Each business module owns its model, requests, policy, controller, actions, and React pages.

```text
app/
  Core/
    Modules/
    Features/
    Settings/
    Audit/
    Authorization/
  Modules/
    Patients/
    Appointments/
    ClinicalHistory/
    Odontogram/
    Treatments/
    Inventory/
    Billing/
    Reports/
```

```text
resources/js/
  core/
  components/
  layouts/
  modules/
    patients/
    appointments/
```

## Module, Feature, And Permission

- A module is a commercial capability, such as `PATIENTS` or `APPOINTMENTS`.
- A feature is an optional behavior within a module, such as `APPOINTMENTS_REMINDERS`.
- A permission grants an action, such as `patients.create`.

The backend must check module state and permissions. Hiding navigation in React is not authorization.

## Module Dependencies

Dependencies are declared in application code with stable module codes, not database IDs.

```text
APPOINTMENTS -> PATIENTS
CLINICAL_HISTORY -> PATIENTS
ODONTOGRAM -> PATIENTS, CLINICAL_HISTORY
```

Enabling a module validates its dependencies. Disabling a module is rejected when another enabled module depends on it.

## Authorization Flow

```text
request
  -> auth middleware
  -> module middleware
  -> permission middleware
  -> policy for resource-level ownership and scope
  -> controller/action
```

A permission alone does not imply access to every record. Future appointment policies will distinguish a doctor's own appointments from administrators with `appointments.view_all`.

## Installation Model

Each clinic has an isolated deployment, database, and storage. Never create shared-database tenancy or client-specific code paths.

## Shared Inertia Props

Authenticated requests will centrally share:

```text
auth.user
auth.roles
auth.permissions
system.modules
system.features
clinic.name
clinic.logo
clinic.timezone
clinic.locale
clinic.currency
```
