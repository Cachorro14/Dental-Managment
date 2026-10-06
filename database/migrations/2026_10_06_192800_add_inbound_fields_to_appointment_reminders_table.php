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
        Schema::table('appointment_reminders', function (Blueprint $table): void {
            $table->boolean('automatic')->default(false);
            $table->string('inbound_message_id')->nullable()->unique();
            $table->timestamp('reply_received_at')->nullable();
            $table->string('reply_text', 255)->nullable();
            $table->string('confirmation_token', 64)->nullable()->unique();
            $table->timestamp('confirmation_token_expires_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointment_reminders', function (Blueprint $table): void {
            $table->dropUnique(['inbound_message_id']);
            $table->dropUnique(['confirmation_token']);
            $table->dropColumn(['inbound_message_id', 'reply_received_at', 'reply_text', 'confirmation_token', 'confirmation_token_expires_at']);
        });
    }
};
