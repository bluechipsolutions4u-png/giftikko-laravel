<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FrameController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public product viewing (no authentication required)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Public categories viewing (for web sidebar)
Route::get('/categories', [CategoryController::class, 'index']);

// Public frames viewing (for web)
Route::get('/frames', [FrameController::class, 'getActiveFrames']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Product management routes (admin only)
    Route::post('/products', [ProductController::class, 'store']);
    Route::post('/products/{id}', [ProductController::class, 'update']); // Using POST for form-data
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Category management routes (admin only)
    Route::get('/admin/categories', [CategoryController::class, 'adminIndex']);
    Route::post('/admin/categories', [CategoryController::class, 'store']);
    Route::put('/admin/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy']);

    // Frame management routes (admin only)
    Route::get('/admin/frames', [FrameController::class, 'index']);
    Route::post('/admin/frames', [FrameController::class, 'store']);
    Route::post('/admin/frames/{id}', [FrameController::class, 'update']); // Using POST for form-data
    Route::delete('/admin/frames/{id}', [FrameController::class, 'destroy']);
});
