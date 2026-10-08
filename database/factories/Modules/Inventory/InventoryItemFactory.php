<?php

namespace Database\Factories\Modules\Inventory;

use App\Models\Modules\Inventory\InventoryItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<InventoryItem> */
class InventoryItemFactory extends Factory
{
    protected $model = InventoryItem::class;

    public function definition(): array
    {
        return ['created_by' => User::factory(), 'name' => fake()->words(2, true), 'sku' => fake()->unique()->bothify('SKU-####'), 'category' => 'Insumos', 'unit' => 'pieza', 'current_stock' => 0, 'minimum_stock' => 1, 'unit_cost' => fake()->randomFloat(2, 1, 500), 'active' => true];
    }
}
