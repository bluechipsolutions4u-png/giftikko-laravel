<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index()
    {
        $products = \App\Models\Product::latest()->get();

        // Add file_url to each product
        $products = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'file_path' => $product->file_path,
                'file_type' => $product->file_type,
                'file_size' => $product->file_size,
                'file_url' => $product->file_url,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,mp4|max:20480', // max 20MB
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('products', $fileName, 'public');

            $product = \App\Models\Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'file_path' => $filePath,
                'file_type' => $file->getClientOriginalExtension(),
                'file_size' => $file->getSize(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'file_path' => $product->file_path,
                    'file_type' => $product->file_type,
                    'file_size' => $product->file_size,
                    'file_url' => $product->file_url,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ]
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'File upload failed'
        ], 400);
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = \App\Models\Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'file_path' => $product->file_path,
                'file_type' => $product->file_type,
                'file_size' => $product->file_size,
                'file_url' => $product->file_url,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ]
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, $id)
    {
        $product = \App\Models\Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,webp,mp4|max:20480', // max 20MB
        ]);

        // Update basic fields
        if ($request->has('name')) {
            $product->name = $request->name;
        }
        if ($request->has('description')) {
            $product->description = $request->description;
        }

        // Handle file upload if new file is provided
        if ($request->hasFile('file')) {
            // Delete old file
            if ($product->file_path) {
                \Storage::disk('public')->delete($product->file_path);
            }

            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('products', $fileName, 'public');

            $product->file_path = $filePath;
            $product->file_type = $file->getClientOriginalExtension();
            $product->file_size = $file->getSize();
        }

        $product->save();

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'file_path' => $product->file_path,
                'file_type' => $product->file_type,
                'file_size' => $product->file_size,
                'file_url' => $product->file_url,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ]
        ]);
    }

    /**
     * Remove the specified product.
     */
    public function destroy($id)
    {
        $product = \App\Models\Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Delete file from storage
        if ($product->file_path) {
            \Storage::disk('public')->delete($product->file_path);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}
