<?php

namespace App\Http\Controllers;

use App\Models\Frame;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FrameController extends Controller
{
    // Get all frames (for admin)
    public function index()
    {
        $frames = Frame::with('category')->orderBy('order')->get()->map(function ($frame) {
            return [
                'id' => $frame->id,
                'name' => $frame->name,
                'frame_file' => $frame->frame_file ? url('storage/' . $frame->frame_file) : null,
                'sample_photo_1' => $frame->sample_photo_1 ? url('storage/' . $frame->sample_photo_1) : null,
                'sample_photo_2' => $frame->sample_photo_2 ? url('storage/' . $frame->sample_photo_2) : null,
                'sample_photo_3' => $frame->sample_photo_3 ? url('storage/' . $frame->sample_photo_3) : null,
                'category_id' => $frame->category_id,
                'category' => $frame->category,
                'order' => $frame->order,
                'is_active' => $frame->is_active,
                'created_at' => $frame->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'frames' => $frames
        ]);
    }

    // Create new frame
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'frame_file' => 'required|file|mimes:png|max:5120', // PNG only, 5MB max
            'sample_photo_1' => 'nullable|file|image|max:5120',
            'sample_photo_2' => 'nullable|file|image|max:5120',
            'sample_photo_3' => 'nullable|file|image|max:5120',
            'category_id' => 'nullable|exists:categories,id',
            'order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        // Store frame PNG file
        if ($request->hasFile('frame_file')) {
            $validated['frame_file'] = $request->file('frame_file')->store('frames', 'public');
        }

        // Store sample photos
        if ($request->hasFile('sample_photo_1')) {
            $validated['sample_photo_1'] = $request->file('sample_photo_1')->store('frames/samples', 'public');
        }
        if ($request->hasFile('sample_photo_2')) {
            $validated['sample_photo_2'] = $request->file('sample_photo_2')->store('frames/samples', 'public');
        }
        if ($request->hasFile('sample_photo_3')) {
            $validated['sample_photo_3'] = $request->file('sample_photo_3')->store('frames/samples', 'public');
        }

        $frame = Frame::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Frame created successfully',
            'frame' => $frame
        ], 201);
    }

    // Update frame
    public function update(Request $request, $id)
    {
        $frame = Frame::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'frame_file' => 'nullable|file|mimes:png|max:5120',
            'sample_photo_1' => 'nullable|file|image|max:5120',
            'sample_photo_2' => 'nullable|file|image|max:5120',
            'sample_photo_3' => 'nullable|file|image|max:5120',
            'delete_sample_photo_1' => 'nullable|boolean',
            'delete_sample_photo_2' => 'nullable|boolean',
            'delete_sample_photo_3' => 'nullable|boolean',
            'category_id' => 'nullable|exists:categories,id',
            'order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        // Update frame PNG if new file uploaded
        if ($request->hasFile('frame_file')) {
            if ($frame->frame_file) {
                Storage::disk('public')->delete($frame->frame_file);
            }
            $validated['frame_file'] = $request->file('frame_file')->store('frames', 'public');
        }

        // Handle sample photo deletions
        if ($request->input('delete_sample_photo_1')) {
            if ($frame->sample_photo_1) {
                Storage::disk('public')->delete($frame->sample_photo_1);
            }
            $validated['sample_photo_1'] = null;
        } elseif ($request->hasFile('sample_photo_1')) {
            if ($frame->sample_photo_1) {
                Storage::disk('public')->delete($frame->sample_photo_1);
            }
            $validated['sample_photo_1'] = $request->file('sample_photo_1')->store('frames/samples', 'public');
        }

        if ($request->input('delete_sample_photo_2')) {
            if ($frame->sample_photo_2) {
                Storage::disk('public')->delete($frame->sample_photo_2);
            }
            $validated['sample_photo_2'] = null;
        } elseif ($request->hasFile('sample_photo_2')) {
            if ($frame->sample_photo_2) {
                Storage::disk('public')->delete($frame->sample_photo_2);
            }
            $validated['sample_photo_2'] = $request->file('sample_photo_2')->store('frames/samples', 'public');
        }

        if ($request->input('delete_sample_photo_3')) {
            if ($frame->sample_photo_3) {
                Storage::disk('public')->delete($frame->sample_photo_3);
            }
            $validated['sample_photo_3'] = null;
        } elseif ($request->hasFile('sample_photo_3')) {
            if ($frame->sample_photo_3) {
                Storage::disk('public')->delete($frame->sample_photo_3);
            }
            $validated['sample_photo_3'] = $request->file('sample_photo_3')->store('frames/samples', 'public');
        }

        $frame->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Frame updated successfully',
            'frame' => $frame
        ]);
    }

    // Delete frame
    public function destroy($id)
    {
        $frame = Frame::findOrFail($id);

        // Delete files
        if ($frame->frame_file) {
            Storage::disk('public')->delete($frame->frame_file);
        }
        if ($frame->sample_photo_1) {
            Storage::disk('public')->delete($frame->sample_photo_1);
        }
        if ($frame->sample_photo_2) {
            Storage::disk('public')->delete($frame->sample_photo_2);
        }
        if ($frame->sample_photo_3) {
            Storage::disk('public')->delete($frame->sample_photo_3);
        }

        $frame->delete();

        return response()->json([
            'success' => true,
            'message' => 'Frame deleted successfully'
        ]);
    }

    // Get active frames for web (public)
    public function getActiveFrames()
    {
        $frames = Frame::where('is_active', true)
            ->with('category')
            ->orderBy('order')
            ->get()
            ->map(function ($frame) {
                return [
                    'id' => $frame->id,
                    'name' => $frame->name,
                    'frame_file' => $frame->frame_file ? url('storage/' . $frame->frame_file) : null,
                    'sample_photos' => array_values(array_filter([
                        $frame->sample_photo_1 ? url('storage/' . $frame->sample_photo_1) : null,
                        $frame->sample_photo_2 ? url('storage/' . $frame->sample_photo_2) : null,
                        $frame->sample_photo_3 ? url('storage/' . $frame->sample_photo_3) : null,
                    ])),
                    'category_id' => $frame->category_id,
                    'category' => $frame->category,
                ];
            });

        return response()->json([
            'success' => true,
            'frames' => $frames
        ]);
    }
}
