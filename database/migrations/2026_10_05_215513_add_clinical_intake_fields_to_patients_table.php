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
            $table->string('insurance_provider')->nullable();
            $table->string('insurance_member_number')->nullable();
            $table->string('marital_status', 40)->nullable();
            $table->string('nationality', 100)->nullable();
            $table->string('document_type', 40)->nullable();
            $table->string('document_number', 80)->nullable();
            $table->string('mobile_phone', 40)->nullable();
            $table->string('occupation')->nullable();
            $table->string('insurance_holder')->nullable();
            $table->string('workplace')->nullable();
            $table->string('job_title')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table): void {
            $table->dropColumn([
                'insurance_provider', 'insurance_member_number', 'marital_status', 'nationality',
                'document_type', 'document_number', 'mobile_phone', 'occupation', 'insurance_holder',
                'workplace', 'job_title',
            ]);
        });
    }
};
