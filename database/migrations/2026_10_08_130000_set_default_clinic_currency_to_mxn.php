<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('clinic_settings')
            ->where('key', 'clinic.currency')
            ->where('value', 'USD')
            ->update(['value' => 'MXN', 'updated_at' => now()]);
    }

    public function down(): void
    {
        DB::table('clinic_settings')
            ->where('key', 'clinic.currency')
            ->where('value', 'MXN')
            ->update(['value' => 'USD', 'updated_at' => now()]);
    }
};
