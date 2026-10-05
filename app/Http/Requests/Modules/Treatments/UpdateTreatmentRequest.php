<?php

namespace App\Http\Requests\Modules\Treatments;

use App\Models\Modules\Treatments\Treatment;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTreatmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $treatment = $this->route('treatment');

        return $treatment instanceof Treatment
            && ($this->user()?->can('update', $treatment) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'tooth_number' => ['nullable', 'integer', 'in:11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'cost' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'status' => ['required', 'string', 'in:planned,in_progress,completed,cancelled'],
            'scheduled_for' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date', 'required_if:status,completed'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
