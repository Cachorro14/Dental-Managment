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
        Schema::create('billing_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->restrictOnDelete();
            $table->foreignId('treatment_id')->nullable()->constrained('treatments')->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->string('type', 20);
            $table->decimal('amount', 10, 2);
            $table->string('description');
            $table->string('payment_method', 30)->nullable();
            $table->dateTime('occurred_at');
            $table->foreignId('voided_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->dateTime('voided_at')->nullable();
            $table->string('void_reason')->nullable();
            $table->timestamps();

            $table->unique('treatment_id');
            $table->index(['patient_id', 'occurred_at']);
            $table->index(['patient_id', 'type', 'voided_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_entries');
    }
};
