<?php

namespace App\Http\Controllers\Modules\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Inventory\StoreInventoryItemRequest;
use App\Http\Requests\Modules\Inventory\StoreInventoryMovementRequest;
use App\Models\Modules\Inventory\InventoryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Inventory/Index', [
            'items' => InventoryItem::query()->with('movements.creator:id,name')->orderBy('name')->get(),
            'canCreate' => request()->user()->can('inventory.create'),
            'canAdjust' => request()->user()->can('inventory.adjust'),
        ]);
    }

    public function store(StoreInventoryItemRequest $request): RedirectResponse
    {
        InventoryItem::query()->create([...$request->validated(), 'created_by' => $request->user()->id]);

        return back()->with('status', 'Artículo de inventario creado.');
    }

    public function movement(StoreInventoryMovementRequest $request, InventoryItem $inventoryItem): RedirectResponse
    {
        DB::transaction(function () use ($request, $inventoryItem): void {
            $item = InventoryItem::query()->whereKey($inventoryItem->id)->lockForUpdate()->firstOrFail();
            $data = $request->validated();
            $quantity = (float) $data['quantity'];
            $stock = (float) $item->current_stock + ($data['type'] === 'in' ? $quantity : -$quantity);

            if ($stock < 0) {
                throw ValidationException::withMessages(['quantity' => 'La salida no puede superar las existencias actuales.']);
            }

            $item->update(['current_stock' => $stock]);
            $item->movements()->create([...$data, 'stock_after' => $stock, 'created_by' => $request->user()->id]);
        });

        return back()->with('status', 'Movimiento de inventario registrado.');
    }
}
