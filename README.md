# Clínica Dental

Plataforma administrativa para clínicas dentales. Reúne la operación diaria de la clínica en una aplicación web con acceso por roles y permisos, módulos configurables y registro de actividad.

Cada clínica se instala de forma independiente, con su propia aplicación, base de datos, almacenamiento, dominio y configuración. El sistema está construido como un monolito modular: Laravel y React/Inertia forman parte del mismo proyecto.

## Funcionalidades

- **Pacientes:** expediente demográfico, datos médicos relevantes, asignación de dentistas y consentimiento para recordatorios.
- **Citas:** agenda, asignación de pacientes y dentistas, estados de cita y seguimiento.
- **Historia clínica:** antecedentes, alergias, medicamentos, cuestionario y evaluación clínica.
- **Odontograma:** registro dental por paciente, evaluaciones y hallazgos por pieza.
- **Tratamientos:** planificación y seguimiento de tratamientos, conservando el historial clínico.
- **Facturación histórica:** registro de cargos, pagos, métodos de pago y saldos por paciente. No procesa pagos ni transacciones.
- **Inventario:** artículos, existencias, mínimos y movimientos de entrada y salida.
- **Reportes y panel:** indicadores operativos de pacientes, citas, tratamientos, inventario y facturación.
- **Administración:** usuarios, roles, permisos, módulos, configuración y personalización visual de la clínica.
- **Auditoría:** historial de actividad para operaciones relevantes.
- **Recordatorios por WhatsApp:** envío manual o automático y confirmación de citas mediante Meta Cloud API, una vez configurada la integración.

El acceso a información clínica y acciones administrativas se controla en el servidor mediante permisos. Los módulos pueden habilitarse según las necesidades de cada instalación.

## Tecnologías

- PHP 8.4 y Laravel 13
- React 18, TypeScript, Inertia 2 y Vite 8
- Tailwind CSS 4
- MySQL 8 recomendado para instalaciones objetivo
- Spatie Laravel Permission

## Requisitos

- PHP 8.4 con las extensiones requeridas por Laravel
- Composer
- Node.js y npm
- MySQL 8 para una instalación con base de datos MySQL (también puede usarse SQLite para desarrollo local)

## Instalación local

1. Clona el repositorio y entra al directorio del proyecto.

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd dental-clinic
   ```

2. Instala las dependencias PHP y JavaScript.

   ```bash
   composer install
   npm install
   ```

3. Crea el archivo de entorno y genera la clave de la aplicación.

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   En Windows PowerShell, si `npm` o `npx` bloquea la ejecución del script, usa `npm.cmd` y `npx.cmd`.

4. Configura la conexión a la base de datos en `.env`.

   Para MySQL, ajusta estas variables según tu entorno:

   ```dotenv
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=dental_clinic
   DB_USERNAME=root
   DB_PASSWORD=
   ```

   Crea previamente la base de datos. Para usar SQLite, configura `DB_CONNECTION=sqlite` y crea el archivo `database/database.sqlite` antes de migrar.

5. Ejecuta las migraciones y los seeders de desarrollo.

   ```bash
   php artisan migrate --seed
   ```

   El seeder principal agrega usuarios y registros de demostración para probar los módulos.

6. Compila los recursos y arranca la aplicación.

   ```bash
   npm run build
   composer run dev
   ```

   La aplicación estará disponible en la URL local que indique Laravel. Para trabajar con recarga en caliente de frontend, ejecuta `npm run dev` en otra terminal mientras desarrollas.

### Cuentas de demostración

Después de ejecutar `php artisan migrate --seed`, los seeders crean estas cuentas. La contraseña inicial de todas es `password`:

| Rol | Correo |
| --- | --- |
| Administrador de sistema (`SUPER_ADMIN`) | `test@example.com` |
| Administrador de clínica (`CLINIC_ADMIN`) | `demo.admin@example.com` |
| Dentista (`DENTIST`) | `demo.dentist@example.com` |
| Recepción (`RECEPTIONIST`) | `demo.reception@example.com` |

Estas credenciales y los datos asociados son exclusivamente para desarrollo y demostración. Cambia o elimina las cuentas de prueba antes de exponer una instalación y no uses los seeders de demostración para inicializar datos reales.

## Configuración de WhatsApp (opcional)

La integración inicia en modo de registro (`log`) y no requiere credenciales para desarrollo. Para enviar recordatorios reales, configura en `.env` las credenciales y opciones correspondientes:

```dotenv
WHATSAPP_ENABLED=true
WHATSAPP_MODE=meta
WHATSAPP_AUTOMATIC_REMINDERS_ENABLED=false
WHATSAPP_API_VERSION=v23.0
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_TEMPLATE_LANGUAGE=es_MX
WHATSAPP_PATIENT_REMINDER_TEMPLATE=appointment_reminder
WHATSAPP_DENTIST_CONFIRMATION_TEMPLATE=appointment_confirmed_doctor
```

También se requiere configurar en Meta las plantillas aprobadas y el webhook de la aplicación. Los recordatorios automáticos están deshabilitados por defecto; habilítalos únicamente después de validar la integración y el consentimiento de los pacientes.

## Preparación para producción

1. Configura un servidor compatible con PHP 8.4, Composer, Node.js y MySQL 8; crea una base de datos y un usuario con permisos limitados para la aplicación.
2. Configura las variables del entorno de producción en `.env`, incluyendo `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, credenciales de base de datos y el resto de servicios que se vayan a usar. No publiques ni compartas este archivo.
3. Instala dependencias y compila los recursos:

   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci
   npm run build
   ```

4. Genera una clave de aplicación si es una instalación nueva y aplica las migraciones:

   ```bash
   php artisan key:generate
   php artisan migrate --force
   ```

   Conserva la misma `APP_KEY` después de empezar a usar la aplicación. No ejecutes `php artisan migrate --seed` en producción: `DatabaseSeeder` agrega usuarios y datos de demostración.

5. Configura el servidor web para apuntar al directorio `public/`, habilita HTTPS, asegúrate de que `storage/` y `bootstrap/cache/` sean escribibles por el proceso de PHP y establece copias de seguridad de la base de datos y archivos.
6. Configura el programador de Laravel para ejecutar `php artisan schedule:run` cada minuto. Es necesario para los recordatorios automáticos de citas; además, configura las credenciales, plantillas y webhook de WhatsApp si activarás esa integración.
7. Si cambiaste configuración durante la instalación, limpia o reconstruye la caché correspondiente antes de poner el sitio en servicio.

Cada clínica debe disponer de una instalación y base de datos aisladas. Las diferencias entre instalaciones se realizan mediante módulos, permisos, configuración, marca e integraciones, no mediante datos compartidos entre clínicas.

## Comandos útiles

```bash
php artisan migrate          # Ejecutar migraciones pendientes
php artisan migrate --seed   # Migrar y cargar datos de demostración (desarrollo)
php artisan test             # Ejecutar pruebas
npx tsc --noEmit             # Verificar tipos de TypeScript
npm run build                # Compilar recursos frontend
```

## Documentación del proyecto

- [Contexto y estado del proyecto](docs/project-context.md)
- [Arquitectura](docs/architecture.md)
- [Decisiones de arquitectura](docs/decisions.md)
