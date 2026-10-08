<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\Modules\Inventory\InventoryItem;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);
        ModuleState::query()->where('code', 'INVENTORY')->update(['enabled' => true]);
    }

    public function test_clinic_admin_can_create_item_and_register_stock_movements(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');

        $this->actingAs($user)->post(route('inventory.store'), [
            'name' => 'Guantes',
            'sku' => 'G-001',
            'category' => 'Protección',
            'unit' => 'caja',
            'minimum_stock' => '2',
            'unit_cost' => '150.00',
        ])->assertRedirect();

        $item = InventoryItem::query()->firstOrFail();
        $this->actingAs($user)->post(route('inventory.movements.store', $item), [
            'type' => 'in', 'quantity' => '5', 'reason' => 'Compra inicial',
        ])->assertRedirect();

        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'current_stock' => '5.000']);
        $this->assertDatabaseHas('inventory_movements', ['inventory_item_id' => $item->id, 'type' => 'in', 'stock_after' => '5.000']);
        $this->assertDatabaseHas('audit_logs', ['auditable_type' => InventoryItem::class, 'event' => 'updated']);
    }

    public function test_inventory_cannot_register_output_above_current_stock(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $item = InventoryItem::factory()->create(['created_by' => $user->id, 'current_stock' => 2]);

        $this->actingAs($user)->post(route('inventory.movements.store', $item), [
            'type' => 'out', 'quantity' => '2.001', 'reason' => 'Uso clínico',
        ])->assertSessionHasErrors('quantity');

        $this->assertDatabaseCount('inventory_movements', 0);
        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'current_stock' => '2.000']);
    }

    public function test_inventory_is_rejected_when_module_is_disabled(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        ModuleState::query()->where('code', 'INVENTORY')->update(['enabled' => false]);

        $this->actingAs($user)->get(route('inventory.index'))->assertNotFound();
    }

    public function test_inventory_index_exposes_items_and_capabilities(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        InventoryItem::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user)->get(route('inventory.index'))
            ->assertInertia(fn (Assert $page) => $page->has('items', 1)->where('canCreate', true)->where('canAdjust', true));
    }
}
