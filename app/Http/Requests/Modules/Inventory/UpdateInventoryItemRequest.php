<?php

namespace App\Http\Requests\Modules\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('inventory.update') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'], 'sku' => ['nullable', 'string', 'max:80', Rule::unique('inventory_items', 'sku')->ignore($this->route('inventoryItem'))], 'category' => ['nullable', 'string', 'max:100'], 'description' => ['nullable', 'string', 'max:2000'], 'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'], 'unit' => ['required', 'string', 'max:30'], 'minimum_stock' => ['required', 'numeric', 'min:0'], 'unit_cost' => ['nullable', 'numeric', 'min:0'], 'supplier' => ['nullable', 'string', 'max:150'], 'lot' => ['nullable', 'string', 'max:100'], 'expires_at' => ['nullable', 'date'], 'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
