<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'file_path',
        'file_type',
        'file_size',
        'category_id'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Accessor to get full URL for the file
    public function getFileUrlAttribute()
    {
        return $this->file_path ? url('storage/' . $this->file_path) : null;
    }
}
