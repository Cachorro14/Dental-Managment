<?php

namespace App\Http\Requests\Modules\Odontogram;

use App\Models\Modules\Odontogram\OdontogramEntry;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOdontogramRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $patient = $this->route('patient');
        $entry = new OdontogramEntry(['patient_id' => $patient->id]);

        return $this->user()?->can('view', $patient)
            && $this->user()?->can('update', $entry);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'entries' => ['required', 'array', 'size:32'],
            'entries.*.tooth_number' => ['required', 'integer', 'distinct', 'in:11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48'],
            'entries.*.status' => ['required', 'string', 'in:healthy,caries,filled,crown,missing,extraction,other'],
            'entries.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
