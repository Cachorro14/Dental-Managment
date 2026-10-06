<?php

namespace App\Http\Middleware;

use App\Core\Modules\FeatureState;
use App\Core\Modules\ModuleCatalog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeatureEnabled
{
    public function __construct(private ModuleCatalog $catalog) {}

    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $definition = $this->catalog->features()[$feature] ?? null;

        abort_unless($definition !== null, 404);
        abort_unless((bool) FeatureState::query()->where('code', $feature)->value('enabled'), 404);

        return $next($request);
    }
}
