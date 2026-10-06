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
        Schema::table('clinical_histories', function (Blueprint $table): void {
            $table->json('intake_responses')->nullable();
            $table->json('assessment_data')->nullable();
            $table->foreignId('intake_updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assessment_updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('responsible_dentist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('intake_updated_at')->nullable();
            $table->timestamp('assessment_updated_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
        });

        DB::table('patients')
            ->whereNotNull('medical_notes')
            ->where('medical_notes', '<>', '')
            ->orderBy('id')
            ->eachById(function (object $patient): void {
                DB::table('clinical_histories')
                    ->where('patient_id', $patient->id)
                    ->whereNull('clinical_notes')
                    ->update(['clinical_notes' => $patient->medical_notes]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clinical_histories', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('intake_updated_by');
            $table->dropConstrainedForeignId('assessment_updated_by');
            $table->dropConstrainedForeignId('responsible_dentist_id');
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn(['intake_responses', 'assessment_data', 'intake_updated_at', 'assessment_updated_at', 'reviewed_at']);
        });
    }
};
