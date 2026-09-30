<?php

namespace App\Http\Middleware;

use App\Core\Modules\ModuleManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleEnabled
{
    public function __construct(private ModuleManager $modules) {}

    public function handle(Request $request, Closure $next, string $module): Response
    {
        abort_unless($this->modules->isEnabled($module), 404);

        if ($request->user() !== null) {
            abort_unless($this->modules->isAccessibleBy($request->user(), $module), 403);
        }

        return $next($request);
    }
}
