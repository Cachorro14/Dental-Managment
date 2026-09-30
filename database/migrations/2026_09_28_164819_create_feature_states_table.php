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
        Schema::create('feature_states', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('module_code');
            $table->boolean('enabled')->default(false);
            $table->timestamps();

            $table->index('module_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feature_states');
    }
};
