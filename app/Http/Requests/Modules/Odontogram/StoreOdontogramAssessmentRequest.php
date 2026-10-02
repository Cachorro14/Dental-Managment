<?php

namespace App\Http\Requests\Modules\Odontogram;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreOdontogramAssessmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('odontogram.update')
            && $this->user()?->can('view', $this->route('patient'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:5000'],
            'entries' => ['required', 'array', 'size:32'],
            'entries.*.tooth_number' => ['required', 'integer', 'distinct', 'in:11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48'],
            'entries.*.status' => ['required', 'string', 'in:not_assessed,healthy,caries,filled,crown,missing,extraction,other'],
            'entries.*.notes' => ['nullable', 'string', 'max:1000'],
            'entries.*.findings' => ['present', 'array', 'max:30'],
            'entries.*.findings.*.surface' => ['required', 'string', 'in:mesial,distal,vestibular,lingual,occlusal,incisal'],
            'entries.*.findings.*.condition' => ['required', 'string', 'in:caries,restoration,fracture,wear,lesion,sealant,other'],
            'entries.*.findings.*.severity' => ['required', 'string', 'in:mild,moderate,severe'],
            'entries.*.findings.*.notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $entries = $this->input('entries', []);

            if (! is_array($entries)) {
                return;
            }

            foreach ($entries as $index => $entry) {
                if (! is_array($entry)) {
                    continue;
                }

                $toothNumber = (int) ($entry['tooth_number'] ?? 0);
                $isAnterior = in_array($toothNumber % 10, [1, 2, 3], true);

                foreach (is_array($entry['findings'] ?? null) ? $entry['findings'] : [] as $findingIndex => $finding) {
                    if (! is_array($finding)) {
                        continue;
                    }

                    $surface = $finding['surface'] ?? null;

                    if (($isAnterior && $surface === 'occlusal') || (! $isAnterior && $surface === 'incisal')) {
                        $validator->errors()->add("entries.{$index}.findings.{$findingIndex}.surface", 'La superficie seleccionada no corresponde a esta pieza dental.');
                    }
                }
            }
        }];
    }
}
