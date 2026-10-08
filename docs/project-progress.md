# Project Progress

Este archivo conserva el avance del proyecto entre conversaciones. El todo list del panel derecho refleja el seguimiento de la sesión actual; este documento conserva el historial persistente.

## Estado Actual

- Fase actual: Fase 8
- Estado: En progreso
- Siguiente objetivo: completar Reports y validar el documento clínico imprimible en el flujo de pruebas.
- Última actualización: 2026-10-05

## Fases

| Fase | Descripción | Estado |
| --- | --- | --- |
| 1 | Arquitectura y decisiones del sistema | Completada |
| 2 | Laravel, React, Inertia, TypeScript, Tailwind, Pest, Spatie Permission, drivers de base de datos y verificación base | Completada |
| 3 | Autenticación, roles, permisos, seeders y autorización | Completada |
| 4 | Catálogo de módulos, features y dependencias | Completada |
| 5 | Settings, branding y props globales de Inertia | Completada |
| 6 | Módulo Patients | Completada |
| 7 | Audit log | Completada |
| 8 | Módulos posteriores: appointments, clinical history, odontogram, treatments, inventory, billing y reports | En progreso |

## Fase 3: Avance

- Rutas de autenticación, dashboard y perfil: completadas y verificadas.
- Integración de roles y permisos de Spatie en `User`: completada.
- Seeders de roles y permisos, incluyendo `SUPER_ADMIN` administrativo: completada.
- Props globales de Inertia para roles y permisos: completadas.
- Pruebas de autenticación y autorización: completadas.

## Fase 4: Avance

- Catálogo estable de módulos y features en código: completado.
- Estado habilitado de módulos y validación de dependencias: completado.
- Protección de módulos deshabilitados y pruebas de dependencias: completado.

## Fase 5: Avance

- Settings editables de clínica persistidos: completado.
- Branding, timezone, locale y moneda: completado.
- Props globales de settings de clínica: completado.

## Fase 6: Avance

- Patients con soft deletes, factory y seeder: completado.
- CRUD de patients con Form Request y policy: completado.
- Páginas React y autorización por permisos: completado.
- Validación, CRUD, soft deletes y autorización: completado.

## Fase 7: Avance

- Diseño del audit log y migración persistente: completado.
- Registro de creación, actualización, eliminación, restauración y eliminación forzada de Patients: completado.
- Consulta administrativa del audit log: completado.

## Fase 8: Avance

- Appointments: backend, permisos, CRUD Inertia, pruebas y seed inicial completados.
- Personalización inicial: branding, variantes visuales, carga de logo/icono y asignación de módulos por rol completados.
- Dashboard operativo y shell visual responsive iniciales: completados.
- Módulo `USER_MANAGEMENT`: CRUD de usuarios, gestión de roles y permisos, acceso exclusivo de `SUPER_ADMIN` y protecciones de cuentas críticas completados.
- Interfaz visible traducida al español y sin branding visible de Laravel: completado.
- Acceso de `SUPER_ADMIN` a todos los módulos: completado.
- Clinical History: ficha clínica por paciente, permisos, migración, preservación de notas médicas, interfaz Inertia y pruebas completados.
- Odontogram: registro de estado y notas para las 32 piezas permanentes, permisos, migración, interfaz Inertia y pruebas completados.
- Treatments: registro, edición, seguimiento de estado y auditoría completados. No se ofrecerá eliminación para preservar el historial clínico de lo realizado al paciente.
- Billing: estado de cuenta por paciente implementado con cargos, pagos parciales, métodos de pago, saldo calculado, auditoría y anulación administrativa conservando el historial. La aplicación no procesa transacciones.
- El dashboard muestra hasta los 10 adeudos más altos en rojo y negritas a usuarios con acceso financiero.
- Inventory: artículos, existencias, mínimos, movimientos de entrada/salida, permisos, auditoría y pantalla operativa implementados.
- Reports: panel inicial de indicadores de pacientes, citas, tratamientos, inventario y facturación implementado.
- Recordatorios de citas por WhatsApp: integración implementada con Meta Cloud API, envíos manuales y automáticos configurables, gestión y auditoría de consentimiento, webhook verificado, confirmación de citas y pruebas. Pendiente configurar credenciales, plantillas aprobadas y webhook en el entorno de producción, y habilitar/validar el scheduler operativo.
- Odontogram: pendiente revisar si se retira o se completa el flujo legado de entradas individuales que coexiste con las evaluaciones actuales.
- Datos iniciales de Clinical History y Odontogram: pendientes de definir; no son bloqueantes para el flujo funcional actual.
- Documento clínico: la vista de impresión incluye la historia clínica y la última evaluación del odontograma; el navegador permite guardarla como PDF. Falta validar el formato con usuarios clínicos.

## Historial

### 2026-09-28

- Se validó el contexto documentado contra el código existente.
- Se confirmó que las Fases 1 y 2 están completadas.
- Se confirmó que la Fase 3 es el siguiente trabajo pendiente.
- Se inicializó el seguimiento del todo list del panel derecho.
- Se registraron las rutas de autenticación, dashboard y perfil.
- La prueba de rutas de autenticación pasó.
- TypeScript y el build de Vite pasaron.
- Se desglosaron las tareas restantes de la Fase 3 en el todo list.
- Se completó la Fase 3 y se verificó el seeder contra la base local.
- Se inició la Fase 4.
- Se completó la Fase 4 y se verificó la conexión MySQL.
- Se ejecutaron migraciones y seeders en la base `dental-clinic`.
- Se inició la Fase 5.
- Se completó la Fase 5 y se verificaron settings persistentes en MySQL.
- Se inició la Fase 6.
- Se completó la Fase 6 con el módulo Patients, sus pruebas y datos iniciales en MySQL.
- TypeScript, la suite completa de 21 pruebas y el build de producción pasaron.
- Se inició la Fase 7.
- Se implementó la base del audit log con modelo, servicio y observer de Patients.
- Se migró `audit_logs` en MySQL y la suite completa pasó con 21 pruebas y 50 assertions.
- Se completó la Fase 7 con consulta administrativa protegida por `audit.view`, navegación React y build verificado.
- Se inició la Fase 8.
- Se implementó Appointments con agenda filtrable por fecha, pacientes, dentistas, estados y autorización por permisos.
- Se aplicó la migración de Appointments en MySQL y se agregaron datos iniciales al seeder.
- Se tradujeron las vistas visibles de citas, auditoría, administración, perfil y pacientes al español.
- Se corrigieron las expectativas de branding de `Laravel` a `Clinica Dental`.
- Se agregó acceso inicial de `SUPER_ADMIN` a todos los módulos.
- Verificación final: 28 pruebas, 69 assertions, TypeScript y build de producción pasaron; Pint pasó.
- Se implementó Clinical History con ficha clínica única por paciente, permisos explícitos para consulta/edición y migración de notas médicas existentes.
- Verificación de Clinical History: 37 pruebas, 88 assertions, TypeScript, build de producción y Pint pasaron.
- Se implementó Odontogram con 32 piezas FDI, estados dentales, notas por pieza, permisos diferenciados y vista de consulta para recepción.
- Verificación de Odontogram: 42 pruebas, 99 assertions, TypeScript, build de producción y Pint pasaron.
- Se implementó Treatments con registro y edición de tratamientos, seguimiento de estado, permisos, auditoría, pruebas y datos iniciales.

### 2026-10-05

- Se confirmó que Treatments no debe permitir eliminación para conservar el historial de lo realizado a cada paciente.
- Se definió Billing como registro histórico de pagos y adeudos del paciente, incluyendo el método de pago; no procesará transacciones.
- Se priorizó Billing como siguiente módulo funcional.
- Se añadió a pendientes investigar recordatorios de citas mediante WhatsApp antes de seleccionar proveedor o implementar la integración.
- Se implementó Billing como historial de cargos y pagos por paciente, con cargo opcional desde Treatments, saldo general sin sobrepagos, anulación auditada para administradores y lista de deudores en el dashboard.
- Verificación de Billing: 89 pruebas, 627 assertions, TypeScript, Pint y build de producción completados.
