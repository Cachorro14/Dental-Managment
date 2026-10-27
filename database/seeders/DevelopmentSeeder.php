<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;
use RuntimeException;

class DevelopmentSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Fake patients, appointments and demo accounts (password: "password") for local work.
     */
    public function run(): void
    {
        if (App::isProduction()) {
            throw new RuntimeException('DevelopmentSeeder crea cuentas con contraseñas conocidas y no puede ejecutarse en producción.');
        }

        $this->call(DatabaseSeeder::class);
        $this->call(PatientSeeder::class);
        $this->call(AppointmentSeeder::class);

        $user = User::firstOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);

        if ($user->email_verified_at === null) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $user->assignRole('SUPER_ADMIN');

        $this->call(TreatmentSeeder::class);
        $this->call(BillingEntrySeeder::class);
        $this->call(DemoDataSeeder::class);
    }
}
