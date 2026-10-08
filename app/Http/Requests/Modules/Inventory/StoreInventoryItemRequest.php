<?php

namespace App\Http\Requests\Modules\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('inventory.create') ?? false;
    }

    public function rules(): array
    {
        return ['name' => ['required', 'string', 'max:150'], 'sku' => ['nullable', 'string', 'max:80', 'unique:inventory_items,sku'], 'category' => ['nullable', 'string', 'max:100'], 'unit' => ['required', 'string', 'max:30'], 'minimum_stock' => ['required', 'numeric', 'min:0'], 'unit_cost' => ['nullable', 'numeric', 'min:0']];
    }
}
