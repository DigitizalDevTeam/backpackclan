<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Mail\LeadConfirmationMail;
use App\Mail\LeadReceivedMail;
use App\Models\Lead;
use App\Services\SettingsService;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class LeadController extends Controller
{
    public function store(Request $request, SettingsService $settings): JsonResponse
    {
        $base = $request->validate([
            'type' => ['required', Rule::in(Lead::TYPES)],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'sourceUrl' => ['nullable', 'string', 'max:500'],
            'payload' => ['nullable', 'array'],
        ]);

        $type = $base['type'];
        $payload = is_array($request->input('payload')) ? $request->input('payload') : ($base['payload'] ?? []);
        $base['payload'] = $payload;

        $this->validateByType($request, $type, $base);

        if ($type === 'career' && $request->hasFile('resume')) {
            $request->validate([
                'resume' => ['file', 'mimes:pdf,doc,docx', 'max:5120'],
            ]);
            $path = $request->file('resume')->store('leads/resumes', 'local');
            $payload['resumePath'] = $path;
            $payload['resumeName'] = $request->file('resume')->getClientOriginalName();
        }

        $lead = Lead::query()->create([
            'type' => $type,
            'status' => 'new',
            'name' => $base['name'],
            'email' => $base['email'] ?? null,
            'phone' => $base['phone'] ?? null,
            'payload' => $payload,
            'source_url' => $base['sourceUrl'] ?? null,
        ]);

        ActivityLogger::log("New {$type} lead from {$lead->name}", 'leads');

        $notifications = [];
        try {
            $notifications = $settings->groupRaw('notifications');
        } catch (\Throwable) {
            $notifications = SettingsService::defaults()['notifications'];
        }

        if (($notifications['leadOpsNotify'] ?? true) === true) {
            $opsEmail = $settings->opsEmail();
            if ($opsEmail) {
                Mail::to($opsEmail)->send(new LeadReceivedMail($lead));
            }
        }
        if (($notifications['leadConfirmation'] ?? true) === true && $lead->email) {
            Mail::to($lead->email)->send(new LeadConfirmationMail($lead));
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => (string) $lead->id,
                'type' => $lead->type,
                'message' => 'Thanks! Our team will reach out soon.',
            ],
        ], 201);
    }

    /**
     * @param  array<string, mixed>  $base
     */
    private function validateByType(Request $request, string $type, array &$base): void
    {
        $payload = $base['payload'] ?? [];

        match ($type) {
            'callback' => (function () use ($request, &$base) {
                $request->validate([
                    'phone' => ['required', 'string', 'min:10', 'max:30'],
                    'payload.preferredTime' => ['nullable', 'string', 'max:100'],
                ]);
            })(),
            'contact', 'general' => (function () use ($request, &$base) {
                $request->validate([
                    'email' => ['required', 'email', 'max:255'],
                    'phone' => ['required', 'string', 'min:10', 'max:30'],
                    'payload.message' => ['required', 'string', 'min:10', 'max:5000'],
                ]);
            })(),
            'custom_trip' => (function () use ($request) {
                $request->validate([
                    'email' => ['required', 'email'],
                    'phone' => ['required', 'string', 'min:10'],
                    'payload.destination' => ['required', 'string', 'max:255'],
                    'payload.travelers' => ['nullable', 'integer', 'min:1', 'max:100'],
                    'payload.travelDates' => ['nullable', 'string', 'max:255'],
                    'payload.budget' => ['nullable', 'string', 'max:100'],
                    'payload.message' => ['nullable', 'string', 'max:5000'],
                ]);
            })(),
            'corporate' => (function () use ($request) {
                $request->validate([
                    'email' => ['required', 'email'],
                    'phone' => ['required', 'string', 'min:10'],
                    'payload.company' => ['required', 'string', 'max:255'],
                    'payload.groupSize' => ['nullable', 'integer', 'min:1', 'max:5000'],
                    'payload.requirements' => ['nullable', 'string', 'max:5000'],
                ]);
            })(),
            'partner' => (function () use ($request) {
                $request->validate([
                    'email' => ['required', 'email'],
                    'phone' => ['required', 'string', 'min:10'],
                    'payload.organization' => ['required', 'string', 'max:255'],
                    'payload.partnershipType' => ['required', 'string', 'max:100'],
                    'payload.message' => ['nullable', 'string', 'max:5000'],
                ]);
            })(),
            'career' => (function () use ($request) {
                $request->validate([
                    'email' => ['required', 'email'],
                    'phone' => ['required', 'string', 'min:10'],
                    'payload.role' => ['required', 'string', 'max:255'],
                    'payload.message' => ['nullable', 'string', 'max:5000'],
                ]);
            })(),
            default => null,
        };
    }
}
