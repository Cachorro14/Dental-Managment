<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);
        $this->call(ModuleCatalogSeeder::class);
        $this->call(ClinicSettingsSeeder::class);
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
