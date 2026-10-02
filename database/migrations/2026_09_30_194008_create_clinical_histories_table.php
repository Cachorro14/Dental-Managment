<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clinical_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->unique()->constrained('patients')->cascadeOnDelete();
            $table->text('allergies')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('current_medications')->nullable();
            $table->text('surgical_history')->nullable();
            $table->text('family_history')->nullable();
            $table->text('habits')->nullable();
            $table->text('clinical_notes')->nullable();
            $table->timestamps();
        });

        DB::table('patients')
            ->whereNotNull('medical_notes')
            ->where('medical_notes', '<>', '')
            ->orderBy('id')
            ->eachById(function (object $patient): void {
                DB::table('clinical_histories')->insert([
                    'patient_id' => $patient->id,
                    'clinical_notes' => $patient->medical_notes,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinical_histories');
    }
};
