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
            'description' => 'Guantes de nitrilo',
            'initial_stock' => '2',
            'unit' => 'caja',
            'minimum_stock' => '2',
            'unit_cost' => '150.00',
        ])->assertRedirect();

        $item = InventoryItem::query()->firstOrFail();
        $this->actingAs($user)->post(route('inventory.movements.store', $item), [
            'type' => 'restock', 'quantity' => '5', 'reason' => 'Compra inicial',
        ])->assertRedirect();

        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'current_stock' => '7.000']);
        $this->assertDatabaseHas('inventory_movements', ['inventory_item_id' => $item->id, 'type' => 'restock', 'stock_after' => '7.000']);
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
            ->assertInertia(fn (Assert $page) => $page->has('items.data', 1)->has('summary')->where('canCreate', true)->where('canUpdate', true)->where('canAdjust', true));
    }

    public function test_inventory_adjustment_sets_the_physical_stock_count(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $item = InventoryItem::factory()->create(['created_by' => $user->id, 'current_stock' => 12]);

        $this->actingAs($user)->post(route('inventory.movements.store', $item), [
            'type' => 'adjustment', 'quantity' => '9', 'reason' => 'Conteo físico mensual',
        ])->assertRedirect();

        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'current_stock' => '9.000']);
        $this->assertDatabaseHas('inventory_movements', ['inventory_item_id' => $item->id, 'type' => 'adjustment', 'stock_after' => '9.000']);
    }

    public function test_inventory_can_be_filtered_by_name_and_category(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        InventoryItem::factory()->create(['created_by' => $user->id, 'name' => 'Guantes de nitrilo', 'category' => 'Protección']);
        InventoryItem::factory()->create(['created_by' => $user->id, 'name' => 'Resina dental', 'category' => 'Restauración']);

        $this->actingAs($user)->get(route('inventory.index', ['search' => 'Guantes', 'category' => 'Protección']))
            ->assertInertia(fn (Assert $page) => $page->has('items.data', 1)->where('items.data.0.name', 'Guantes de nitrilo'));
    }
}
