<?php

namespace App\Http\Requests\Modules\Billing;

use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\Patients\Patient;
use Illuminate\Foundation\Http\FormRequest;

class StoreChargeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $patient = $this->route('patient');

        return $patient instanceof Patient
            && ($this->user()?->can('charge', [BillingEntry::class, $patient]) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'gt:0', 'max:99999999.99'],
            'description' => ['required', 'string', 'max:255'],
            'occurred_at' => ['required', 'date', 'before_or_equal:now'],
        ];
    }
}
