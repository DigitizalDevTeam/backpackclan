<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Lead::query()->with('assignee')->orderByDesc('created_at');

        if ($type = $request->string('type')->trim()->toString()) {
            $query->where('type', $type);
        }
        if ($status = $request->string('status')->trim()->toString()) {
            $query->where('status', $status);
        }
        if ($search = $request->string('search')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->limit(200)->get()->map->toApiArray()->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(Lead::TYPES)],
            'status' => ['sometimes', Rule::in(Lead::STATUSES)],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'sourceUrl' => ['nullable', 'string', 'max:500'],
            'adminNotes' => ['nullable', 'string', 'max:5000'],
            'assignedTo' => ['nullable', 'exists:users,id'],
            'payload' => ['nullable', 'array'],
            'payload.message' => ['nullable', 'string', 'max:5000'],
            'payload.preferredTime' => ['nullable', 'string', 'max:100'],
            'payload.destination' => ['nullable', 'string', 'max:255'],
            'payload.company' => ['nullable', 'string', 'max:255'],
            'payload.organization' => ['nullable', 'string', 'max:255'],
            'payload.partnershipType' => ['nullable', 'string', 'max:100'],
            'payload.role' => ['nullable', 'string', 'max:255'],
            'payload.groupSize' => ['nullable', 'integer', 'min:1', 'max:5000'],
            'payload.travelers' => ['nullable', 'integer', 'min:1', 'max:100'],
            'payload.travelDates' => ['nullable', 'string', 'max:255'],
            'payload.budget' => ['nullable', 'string', 'max:100'],
            'payload.requirements' => ['nullable', 'string', 'max:5000'],
        ]);

        $lead = Lead::query()->create([
            'type' => $data['type'],
            'status' => $data['status'] ?? 'new',
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'payload' => $data['payload'] ?? [],
            'source_url' => $data['sourceUrl'] ?? 'admin',
            'admin_notes' => $data['adminNotes'] ?? null,
            'assigned_to' => $data['assignedTo'] ?? null,
        ]);

        ActivityLogger::log("Admin created {$lead->type} lead for {$lead->name}", 'leads');

        return response()->json([
            'success' => true,
            'data' => $lead->fresh('assignee')->toApiArray(),
        ], 201);
    }

    public function show(Lead $lead): JsonResponse
    {
        $lead->load('assignee');

        return response()->json([
            'success' => true,
            'data' => $lead->toApiArray(),
        ]);
    }

    public function update(Request $request, Lead $lead): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(Lead::STATUSES)],
            'adminNotes' => ['nullable', 'string', 'max:5000'],
            'assignedTo' => ['nullable', 'exists:users,id'],
        ]);

        if (array_key_exists('status', $data)) {
            $lead->status = $data['status'];
        }
        if (array_key_exists('adminNotes', $data)) {
            $lead->admin_notes = $data['adminNotes'];
        }
        if (array_key_exists('assignedTo', $data)) {
            $lead->assigned_to = $data['assignedTo'];
        }

        $lead->save();
        ActivityLogger::log("Lead #{$lead->id} updated ({$lead->status})", 'leads');

        return response()->json([
            'success' => true,
            'data' => $lead->fresh('assignee')->toApiArray(),
        ]);
    }

    public function destroy(Lead $lead): JsonResponse
    {
        $resume = $lead->payload['resumePath'] ?? null;
        if (is_string($resume) && Storage::disk('local')->exists($resume)) {
            Storage::disk('local')->delete($resume);
        }

        $id = $lead->id;
        $lead->delete();
        ActivityLogger::log("Lead #{$id} deleted", 'leads');

        return response()->json(['success' => true]);
    }

    public function downloadResume(Lead $lead): StreamedResponse|JsonResponse
    {
        $path = $lead->payload['resumePath'] ?? null;
        $name = $lead->payload['resumeName'] ?? 'resume.pdf';

        if (! is_string($path) || ! Storage::disk('local')->exists($path)) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Resume not found'],
            ], 404);
        }

        return Storage::disk('local')->download($path, $name);
    }
}
