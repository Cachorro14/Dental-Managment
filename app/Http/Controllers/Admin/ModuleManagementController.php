<?php

namespace App\Http\Controllers\Admin;

use App\Core\Modules\ModuleCatalog;
use App\Core\Modules\ModuleManager;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateModuleStateRequest;
use App\Http\Requests\Admin\UpdateRoleModulesRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class ModuleManagementController extends Controller
{
    public function __construct(
        private ModuleCatalog $catalog,
        private ModuleManager $manager,
    ) {}

    public function index(): Response
    {
        $states = DB::table('module_states')->pluck('enabled', 'code');
        $assignments = DB::table('module_role')->get()->groupBy('role_id')->map(
            fn ($items): array => $items->pluck('module_code')->values()->all(),
        );

        return Inertia::render('Admin/Modules/Index', [
            'modules' => collect($this->catalog->modules())->map(
                fn (array $module, string $code): array => [
                    'code' => $code,
                    'label' => $module['label'],
                    'dependencies' => $module['dependencies'],
                    'enabled' => (bool) $states->get($code, false),
                ],
            )->values()->all(),
            'roles' => Role::query()->orderBy('name')->get(['id', 'name']),
            'assignments' => $assignments->all(),
        ]);
    }

    public function update(UpdateModuleStateRequest $request, string $module): RedirectResponse
    {
        try {
            if ($request->boolean('enabled')) {
                $this->manager->enable($module);
            } else {
                $this->manager->disable($module);
            }
        } catch (\LogicException $exception) {
            throw ValidationException::withMessages(['enabled' => $exception->getMessage()]);
        }

        return back()->with('success', 'Module state updated.');
    }

    public function updateRoleModules(UpdateRoleModulesRequest $request): RedirectResponse
    {
        $modules = array_values(array_intersect(
            $request->validated('modules', []),
            array_keys($this->catalog->modules()),
        ));

        DB::transaction(function () use ($request, $modules): void {
            $roleId = $request->integer('role_id');
            DB::table('module_role')->where('role_id', $roleId)->delete();

            if ($modules !== []) {
                DB::table('module_role')->insert(array_map(
                    fn (string $module): array => [
                        'role_id' => $roleId,
                        'module_code' => $module,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    $modules,
                ));
            }
        });

        return back()->with('success', 'Role modules updated.');
    }
}
