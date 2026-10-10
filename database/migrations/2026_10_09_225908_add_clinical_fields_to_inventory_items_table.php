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
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->text('description')->nullable()->after('category');
            $table->string('image_path')->nullable()->after('description');
            $table->string('supplier')->nullable()->after('unit_cost');
            $table->string('lot')->nullable()->after('supplier');
            $table->date('expires_at')->nullable()->after('lot');
            $table->text('notes')->nullable()->after('expires_at');
            $table->index(['active', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropIndex(['active', 'expires_at']);
            $table->dropColumn(['description', 'image_path', 'supplier', 'lot', 'expires_at', 'notes']);
        });
    }
};
