<?php

namespace App\Core\Modules;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use LogicException;

final class ModuleManager
{
    public function __construct(private ModuleCatalog $catalog) {}

    public function isEnabled(string $code): bool
    {
        $this->catalog->module($code);

        return (bool) ModuleState::query()
            ->where('code', $code)
            ->value('enabled');
    }

    public function isAccessibleBy(User $user, string $code): bool
    {
        return DB::table('module_role')
            ->whereIn('role_id', $user->roles()->pluck('roles.id'))
            ->where('module_code', $code)
            ->exists();
    }

    public function enable(string $code): ModuleState
    {
        $module = $this->catalog->module($code);

        foreach ($module['dependencies'] as $dependency) {
            if (! $this->isEnabled($dependency)) {
                throw new LogicException("Module [{$code}] requires [{$dependency}] to be enabled.");
            }
        }

        return ModuleState::query()->updateOrCreate(
            ['code' => $code],
            ['enabled' => true],
        );
    }

    public function disable(string $code): ModuleState
    {
        $this->catalog->module($code);

        $dependent = collect($this->catalog->modules())
            ->filter(fn (array $module): bool => in_array($code, $module['dependencies'], true))
            ->keys()
            ->first(fn (string $dependentCode): bool => $this->isEnabled($dependentCode));

        if ($dependent !== null) {
            throw new LogicException("Module [{$code}] is required by enabled module [{$dependent}].");
        }

        return ModuleState::query()->updateOrCreate(
            ['code' => $code],
            ['enabled' => false],
        );
    }
}
