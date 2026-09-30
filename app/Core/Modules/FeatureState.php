<?php

namespace App\Core\Modules;

use Illuminate\Database\Eloquent\Model;

class FeatureState extends Model
{
    protected $fillable = ['code', 'module_code', 'enabled'];

    protected function casts(): array
    {
        return ['enabled' => 'boolean'];
    }
}
