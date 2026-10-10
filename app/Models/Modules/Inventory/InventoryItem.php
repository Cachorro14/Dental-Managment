<?php

namespace App\Models\Modules\Inventory;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by', 'name', 'sku', 'category', 'description', 'image_path', 'unit', 'current_stock', 'minimum_stock', 'unit_cost', 'supplier', 'lot', 'expires_at', 'notes', 'active',
    ];

    protected function casts(): array
    {
        return ['current_stock' => 'decimal:3', 'minimum_stock' => 'decimal:3', 'unit_cost' => 'decimal:2', 'expires_at' => 'date', 'active' => 'boolean'];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }
}
