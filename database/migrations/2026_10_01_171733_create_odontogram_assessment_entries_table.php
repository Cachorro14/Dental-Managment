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
        if (Schema::hasTable('odontogram_assessment_entries')) {
            Schema::table('odontogram_assessment_entries', function (Blueprint $table) {
                $table->unique(['odontogram_assessment_id', 'tooth_number'], 'od_assessment_tooth_unique');
            });

            return;
        }

        Schema::create('odontogram_assessment_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odontogram_assessment_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('tooth_number');
            $table->string('status', 30)->default('not_assessed');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['odontogram_assessment_id', 'tooth_number'], 'od_assessment_tooth_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('odontogram_assessment_entries');
    }
};
