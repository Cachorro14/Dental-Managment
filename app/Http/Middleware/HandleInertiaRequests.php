<?php

namespace App\Http\Middleware;

use App\Core\Modules\FeatureState;
use App\Core\Modules\ModuleCatalog;
use App\Core\Modules\ModuleState;
use App\Core\Settings\ClinicSettings;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function __construct(
        private ModuleCatalog $catalog,
        private ClinicSettings $settings,
    ) {}

    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'roles' => $user?->getRoleNames()->values()->all() ?? [],
                'permissions' => $user?->getAllPermissions()->pluck('name')->values()->all() ?? [],
            ],
            'system' => [
                'modules' => $this->moduleProps(),
                'features' => $this->featureProps(),
            ],
            'clinic' => $this->settings->all(),
            'branding' => $this->settings->branding(),
        ];
    }

    /**
     * @return list<array{code: string, label: string, dependencies: list<string>, enabled: bool}>
     */
    private function moduleProps(): array
    {
        $states = ModuleState::query()->pluck('enabled', 'code');

        return collect($this->catalog->modules())
            ->map(fn (array $module, string $code): array => [
                'code' => $code,
                'label' => $module['label'],
                'dependencies' => $module['dependencies'],
                'enabled' => (bool) $states->get($code, false),
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{code: string, label: string, module: string, enabled: bool}>
     */
    private function featureProps(): array
    {
        $states = FeatureState::query()->pluck('enabled', 'code');

        return collect($this->catalog->features())
            ->map(fn (array $feature, string $code): array => [
                'code' => $code,
                'label' => $feature['label'],
                'module' => $feature['module'],
                'enabled' => (bool) $states->get($code, false),
            ])
            ->values()
            ->all();
    }
}
