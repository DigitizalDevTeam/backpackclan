<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Support\Permissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::query()
            ->with('permissions')
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => RoleResource::collection($roles),
        ]);
    }

    public function show(Role $role): JsonResponse
    {
        $role->load('permissions')->loadCount('users');

        return response()->json([
            'success' => true,
            'data' => new RoleResource($role),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:roles,slug', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['string', Rule::in(Permissions::all())],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        if (Role::query()->where('slug', $slug)->exists()) {
            return response()->json([
                'success' => false,
                'errors' => ['slug' => 'A role with this slug already exists'],
            ], 422);
        }

        $role = Role::query()->create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'is_system' => false,
        ]);

        $role->syncPermissionSlugs($validated['permissions']);
        $role->load('permissions')->loadCount('users');

        return response()->json([
            'success' => true,
            'data' => new RoleResource($role),
        ], 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('roles', 'slug')->ignore($role->id), 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'description' => ['nullable', 'string', 'max:1000'],
            'permissions' => ['sometimes', 'array', 'min:1'],
            'permissions.*' => ['string', Rule::in(Permissions::all())],
        ]);

        if ($role->is_system && isset($validated['slug']) && $validated['slug'] !== $role->slug) {
            return response()->json([
                'success' => false,
                'errors' => ['slug' => 'System role slug cannot be changed'],
            ], 400);
        }

        if (array_key_exists('name', $validated)) {
            $role->name = $validated['name'];
        }
        if (array_key_exists('slug', $validated)) {
            $role->slug = $validated['slug'];
        }
        if (array_key_exists('description', $validated)) {
            $role->description = $validated['description'];
        }

        $role->save();

        if (array_key_exists('permissions', $validated)) {
            $role->syncPermissionSlugs($validated['permissions']);
        }

        $role->load('permissions')->loadCount('users');

        return response()->json([
            'success' => true,
            'data' => new RoleResource($role),
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->is_system) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'System roles cannot be deleted'],
            ], 400);
        }

        if ($role->users()->exists()) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Cannot delete a role that is assigned to users'],
            ], 400);
        }

        $role->permissions()->detach();
        $role->delete();

        return response()->json(['success' => true]);
    }
}
