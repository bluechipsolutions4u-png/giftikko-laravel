<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Frame extends Model
{
    protected $fillable = [
        'name',
        'frame_file',
        'sample_photo_1',
        'sample_photo_2',
        'sample_photo_3',
        'category_id',
        'order',
        'is_active'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
