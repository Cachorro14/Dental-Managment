<?php

namespace App\Http\Requests\Modules\Patients;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SyncPatientDentistsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $patient = $this->route('patient');

        return $this->user()?->can('patients.assign_dentists')
            && $this->user()?->can('view', $patient);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'dentists' => ['present', 'array', 'max:50'],
            'dentists.*' => ['required', 'integer', 'distinct', 'exists:users,id'],
        ];
    }

    /** @return array<int, \Closure(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $dentistIds = $this->input('dentists', []);

            if (! is_array($dentistIds) || $dentistIds === []) {
                return;
            }

            $validDentistCount = User::role('DENTIST')->whereKey($dentistIds)->count();

            if ($validDentistCount !== count($dentistIds)) {
                $validator->errors()->add('dentists', 'Solo puedes asignar usuarios que tengan el rol de dentista.');
            }
        }];
    }
}
