<?php

namespace App\Core\Modules;

use Illuminate\Database\Eloquent\Model;

class ModuleState extends Model
{
    protected $fillable = ['code', 'enabled'];

    protected function casts(): array
    {
        return ['enabled' => 'boolean'];
    }
}
