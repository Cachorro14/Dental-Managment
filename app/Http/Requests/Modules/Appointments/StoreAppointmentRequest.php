<?php

namespace App\Http\Requests\Modules\Appointments;

use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreAppointmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Appointment::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'dentist_id' => ['nullable', 'integer', 'exists:users,id'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:240'],
            'status' => ['required', 'string', 'in:scheduled,confirmed,completed,cancelled'],
            'reason' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /** @return array<int, \Closure(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $user = $this->user();

            if ($validator->errors()->has('patient_id') || $user->can('patients.view_all')) {
                return;
            }

            $patient = Patient::query()->find($this->integer('patient_id'));

            if ($patient === null || ! $patient->isAssignedToDentist($user)) {
                $validator->errors()->add('patient_id', 'Solo puedes agendar citas para pacientes asignados a tu cuenta.');
            }
        }];
    }
}
