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
        Schema::create('odontogram_findings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assessment_entry_id')->constrained('odontogram_assessment_entries')->cascadeOnDelete();
            $table->string('surface', 20);
            $table->string('condition', 40);
            $table->string('severity', 20);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['assessment_entry_id', 'surface']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('odontogram_findings');
    }
};
