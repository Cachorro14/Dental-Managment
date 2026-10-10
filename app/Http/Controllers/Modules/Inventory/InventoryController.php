<?php

namespace App\Http\Controllers\Modules\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Inventory\StoreInventoryItemRequest;
use App\Http\Requests\Modules\Inventory\StoreInventoryMovementRequest;
use App\Http\Requests\Modules\Inventory\UpdateInventoryItemRequest;
use App\Models\Modules\Inventory\InventoryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:available,low,reorder,out_of_stock'],
        ]);

        $baseQuery = InventoryItem::query()->where('active', true);
        $summary = [
            'totalItems' => (clone $baseQuery)->count(),
            'lowStock' => (clone $baseQuery)->whereColumn('current_stock', '<=', 'minimum_stock')->where('current_stock', '>', 0)->count(),
            'reorder' => (clone $baseQuery)->whereColumn('current_stock', '<=', 'minimum_stock')->count(),
            'estimatedValue' => (float) (clone $baseQuery)->selectRaw('COALESCE(SUM(current_stock * unit_cost), 0) as value')->value('value'),
        ];

        $itemsQuery = InventoryItem::query()->where('active', true);
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $itemsQuery->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")->orWhere('sku', 'like', "%{$search}%");
            });
        }
        if (! empty($filters['category'])) {
            $itemsQuery->where('category', $filters['category']);
        }
        if (! empty($filters['status'])) {
            match ($filters['status']) {
                'available' => $itemsQuery->whereColumn('current_stock', '>', 'minimum_stock'),
                'low' => $itemsQuery->whereColumn('current_stock', '<=', 'minimum_stock')->where('current_stock', '>', 0),
                'reorder' => $itemsQuery->whereColumn('current_stock', '<=', 'minimum_stock')->where('current_stock', '>', 0),
                'out_of_stock' => $itemsQuery->where('current_stock', 0),
            };
        }

        return Inertia::render('Inventory/Index', [
            'items' => $itemsQuery->withCount('movements')->orderBy('name')->paginate(12)->withQueryString(),
            'summary' => $summary,
            'categories' => InventoryItem::query()->where('active', true)->whereNotNull('category')->distinct()->orderBy('category')->pluck('category')->values(),
            'filters' => ['search' => $filters['search'] ?? '', 'category' => $filters['category'] ?? '', 'status' => $filters['status'] ?? ''],
            'canCreate' => request()->user()->can('inventory.create'),
            'canUpdate' => request()->user()->can('inventory.update'),
            'canAdjust' => request()->user()->can('inventory.adjust'),
        ]);
    }

    public function store(StoreInventoryItemRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $data = $request->safe()->except('image', 'initial_stock');
            $initialStock = (float) $request->validated('initial_stock');

            if ($request->hasFile('image')) {
                $data['image_path'] = $request->file('image')->store('inventory', 'public');
            }

            $item = InventoryItem::query()->create([...$data, 'current_stock' => $initialStock, 'created_by' => $request->user()->id]);

            if ($initialStock > 0) {
                $item->movements()->create([
                    'type' => 'in',
                    'quantity' => $initialStock,
                    'stock_after' => $initialStock,
                    'reason' => 'Existencia inicial',
                    'created_by' => $request->user()->id,
                ]);
            }
        });

        return back()->with('status', 'Artículo de inventario creado.');
    }

    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventoryItem): RedirectResponse
    {
        $data = $request->safe()->except('image');
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('inventory', 'public');
            Storage::disk('public')->delete($inventoryItem->image_path);
            $data['image_path'] = $path;
        }

        $inventoryItem->update($data);

        return back()->with('status', 'Artículo de inventario actualizado.');
    }

    public function movement(StoreInventoryMovementRequest $request, InventoryItem $inventoryItem): RedirectResponse
    {
        DB::transaction(function () use ($request, $inventoryItem): void {
            $item = InventoryItem::query()->whereKey($inventoryItem->id)->lockForUpdate()->firstOrFail();
            $data = $request->validated();
            $quantity = (float) $data['quantity'];
            $stock = match ($data['type']) {
                'in', 'restock' => (float) $item->current_stock + $quantity,
                'out', 'waste' => (float) $item->current_stock - $quantity,
                'adjustment' => $quantity,
            };

            if ($stock < 0) {
                throw ValidationException::withMessages(['quantity' => 'La salida no puede superar las existencias actuales.']);
            }

            $item->update(['current_stock' => $stock]);
            $item->movements()->create([...$data, 'stock_after' => $stock, 'created_by' => $request->user()->id]);
        });

        return back()->with('status', 'Movimiento de inventario registrado.');
    }
}
