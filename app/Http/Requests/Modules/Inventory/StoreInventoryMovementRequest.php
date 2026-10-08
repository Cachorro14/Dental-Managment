<?php

namespace App\Http\Requests\Modules\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('inventory.adjust') ?? false;
    }

    public function rules(): array
    {
        return ['type' => ['required', Rule::in(['in', 'out'])], 'quantity' => ['required', 'numeric', 'gt:0'], 'reason' => ['required', 'string', 'max:200']];
    }
}
