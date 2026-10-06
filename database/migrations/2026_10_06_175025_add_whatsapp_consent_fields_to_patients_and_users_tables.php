<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table): void {
            $table->boolean('whatsapp_reminder_consent')->default(false);
            $table->foreignId('whatsapp_reminder_consent_recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->index('whatsapp_reminder_consent');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->string('phone', 40)->nullable();
            $table->boolean('whatsapp_appointment_consent')->default(false);
            $table->foreignId('whatsapp_appointment_consent_recorded_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('whatsapp_appointment_consent_recorded_by');
            $table->dropColumn(['phone', 'whatsapp_appointment_consent']);
        });

        Schema::table('patients', function (Blueprint $table): void {
            $table->dropIndex(['whatsapp_reminder_consent']);
            $table->dropConstrainedForeignId('whatsapp_reminder_consent_recorded_by');
            $table->dropColumn('whatsapp_reminder_consent');
        });
    }
};
