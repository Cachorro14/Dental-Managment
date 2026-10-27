<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

#[Signature('app:create-admin {--role=SUPER_ADMIN : Rol a asignar (SUPER_ADMIN o CLINIC_ADMIN)}')]
#[Description('Crea una cuenta de administrador pidiendo los datos de forma interactiva.')]
class CreateAdmin extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $data = [
            'name' => $this->ask('Nombre completo'),
            'email' => $this->ask('Correo electrónico'),
            'password' => $this->secret('Contraseña (mínimo 12 caracteres, letras y números)'),
            'role' => $this->option('role'),
        ];

        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', Password::min(12)->letters()->numbers()],
            'role' => ['required', Rule::in(['SUPER_ADMIN', 'CLINIC_ADMIN'])],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        if (! Role::query()->where('name', $data['role'])->exists()) {
            $this->error('Los roles no existen todavía. Ejecuta primero: php artisan db:seed --force');

            return self::FAILURE;
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);
        $user->forceFill(['email_verified_at' => now()])->save();
        $user->assignRole($data['role']);

        $this->info("Administrador creado: {$user->email} ({$data['role']}).");

        return self::SUCCESS;
    }
}
