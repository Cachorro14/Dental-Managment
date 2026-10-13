<?php

namespace App\Http\Controllers\Admin;

use App\Core\Modules\ModuleCatalog;
use App\Core\Modules\ModuleManager;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateModuleStateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ModuleManagementController extends Controller
{
    public function __construct(
        private ModuleCatalog $catalog,
        private ModuleManager $manager,
    ) {}

    public function index(): Response
    {
        $states = DB::table('module_states')->pluck('enabled', 'code');

        return Inertia::render('Admin/Modules/Index', [
            'modules' => collect($this->catalog->modules())->map(
                fn (array $module, string $code): array => [
                    'code' => $code,
                    'label' => $module['label'],
                    'dependencies' => $module['dependencies'],
                    'enabled' => (bool) $states->get($code, false),
                ],
            )->values()->all(),
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
}
