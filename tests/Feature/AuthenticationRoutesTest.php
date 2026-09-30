<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_authentication_routes_are_registered(): void
    {
        $this->assertSame('/login', route('login', absolute: false));
        $this->assertSame('/register', route('register', absolute: false));
        $this->assertSame('/forgot-password', route('password.request', absolute: false));
        $this->assertSame('/verify-email', route('verification.notice', absolute: false));
        $this->assertSame('/email/verification-notification', route('verification.send', absolute: false));
    }

    public function test_guest_is_redirected_from_dashboard(): void
    {
        $this->get(route('dashboard'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_access_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk();
    }
}
