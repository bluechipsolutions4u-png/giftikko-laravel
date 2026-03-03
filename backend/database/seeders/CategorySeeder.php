<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Only product categories - Home, About, Contact are static in frontend
        $categories = [
            ['name' => 'Premium Acrylic Photo', 'icon' => 'Image', 'link' => '/category/premium-acrylic-photo', 'order' => 1, 'is_active' => true],
            ['name' => 'Transparent Acrylic Photo', 'icon' => 'Image', 'link' => '/category/transparent-acrylic-photo', 'order' => 2, 'is_active' => true],
            ['name' => 'Framed Acrylic Wall Photo', 'icon' => 'Frame', 'link' => '/category/framed-acrylic-wall-photo', 'order' => 3, 'is_active' => true],
            ['name' => 'Acrylic Photo Cutout', 'icon' => 'Users', 'link' => '/category/acrylic-photo-cutout', 'order' => 4, 'is_active' => true],
            ['name' => 'Acrylic Wall Clock', 'icon' => 'Clock', 'link' => '/category/acrylic-wall-clock', 'order' => 5, 'is_active' => true],
            ['name' => 'Acrylic Photo Collage', 'icon' => 'Grid', 'link' => '/category/acrylic-photo-collage', 'order' => 6, 'is_active' => true],
            ['name' => 'Acrylic Nameplate', 'icon' => 'FileText', 'link' => '/category/acrylic-nameplate', 'order' => 7, 'is_active' => true],
            ['name' => 'Remove Photo Background', 'icon' => 'Eraser', 'link' => '/services/remove-background', 'order' => 8, 'is_active' => true],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
