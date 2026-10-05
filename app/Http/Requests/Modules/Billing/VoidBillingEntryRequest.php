<?php

namespace App\Http\Requests\Modules\Billing;

use App\Models\Modules\Billing\BillingEntry;
use Illuminate\Foundation\Http\FormRequest;

class VoidBillingEntryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $entry = $this->route('billingEntry');

        return $entry instanceof BillingEntry
            && ($this->user()?->can('void', $entry) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'void_reason' => ['required', 'string', 'max:255'],
        ];
    }
}
