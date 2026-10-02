<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $event = $request->string('event')->trim()->toString();

        return Inertia::render('Audit/Index', [
            'auditLogs' => Inertia::defer(fn () => AuditLog::query()
                ->with('user:id,name')
                ->when($event !== '', fn ($query) => $query->where('event', $event))
                ->latest()
                ->paginate(25)
                ->withQueryString()),
            'filters' => ['event' => $event],
        ]);
    }
}
