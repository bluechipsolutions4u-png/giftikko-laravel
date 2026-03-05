<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Get all active categories for web (public)
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    public function productsBySlug($slug)
    {
        // Try to find category by link containing the slug
        $category = Category::where('link', 'LIKE', "%$slug%")->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        $products = \App\Models\Product::where('category_id', $category->id)->latest()->get()->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'file_url' => $product->file_url,
                'file_type' => $product->file_type,
                'created_at' => $product->created_at,
            ];
        });

        $frames = \App\Models\Frame::where('category_id', $category->id)->latest()->get()->map(function ($frame) {
            return [
                'id' => $frame->id,
                'name' => $frame->name,
                'frame_file' => $frame->frame_file ? url('storage/' . $frame->frame_file) : null,
                'sample_photos' => array_values(array_filter([
                    $frame->sample_photo_1 ? url('storage/' . $frame->sample_photo_1) : null,
                    $frame->sample_photo_2 ? url('storage/' . $frame->sample_photo_2) : null,
                    $frame->sample_photo_3 ? url('storage/' . $frame->sample_photo_3) : null,
                ])),
            ];
        });

        return response()->json([
            'success' => true,
            'category' => $category,
            'products' => $products,
            'frames' => $frames
        ]);
    }

    // Get all categories for admin
    public function adminIndex()
    {
        $categories = Category::orderBy('order')->get();

        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    // Create new category
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'link' => 'required|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'category' => $category
        ], 201);
    }

    // Update category
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'icon' => 'nullable|string|max:255',
            'link' => 'sometimes|required|string|max:255',
            'order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'category' => $category
        ]);
    }

    // Delete category
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }
}

