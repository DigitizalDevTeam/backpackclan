<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminBookingResource;
use App\Models\Booking;
use App\Models\BookingDocument;
use App\Models\Departure;
use App\Models\Payment;
use App\Models\Trip;
use App\Models\User;
use App\Support\ActivityLogger;
use App\Support\CamelCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::query()
            ->with(['user', 'payments'])
            ->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('booking_ref', 'like', "%{$search}%")
                    ->orWhere('trip_title', 'like', "%{$search}%")
                    ->orWhere('destination', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $bookings = $query->limit(200)->get();

        return response()->json([
            'success' => true,
            'data' => AdminBookingResource::collection($bookings),
        ]);
    }

    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['user', 'payments', 'documents', 'trip', 'departure']);

        return response()->json([
            'success' => true,
            'data' => new AdminBookingResource($booking),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customerId' => ['required', 'exists:users,id'],
            'tripId' => ['required', 'exists:trips,id'],
            'departureId' => ['required', 'exists:departures,id'],
            'adults' => ['required', 'integer', 'min:1', 'max:20'],
            'children' => ['required', 'integer', 'min:0', 'max:10'],
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'cancelled', 'completed'])],
            'paidAmount' => ['sometimes', 'integer', 'min:0'],
            'contactPhone' => ['nullable', 'string', 'max:20'],
            'contactEmail' => ['nullable', 'email', 'max:255'],
            'travelerDetails' => ['nullable', 'array'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $customer = User::query()->with('role')->findOrFail($data['customerId']);
        if (! $customer->isCustomer()) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Selected user must be a customer'],
            ], 422);
        }

        try {
            $booking = DB::transaction(function () use ($data, $customer) {
                $trip = Trip::query()->with('destination')->findOrFail($data['tripId']);
                $departure = Departure::query()
                    ->whereKey($data['departureId'])
                    ->where('trip_id', $trip->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $pax = (int) $data['adults'] + (int) $data['children'];
                $status = $data['status'] ?? 'confirmed';

                if ($status !== 'cancelled' && $departure->availableSeats() < $pax) {
                    abort(422, 'Not enough seats left for this departure');
                }

                $pricing = CamelCase::convert($trip->pricing ?? []);
                $basePrice = (int) ($pricing['salePrice'] ?? $pricing['basePrice'] ?? 0);
                $override = CamelCase::convert($departure->pricing_override ?? []);
                $unitPrice = (int) ($override['salePrice'] ?? $override['basePrice'] ?? $basePrice);
                if ($unitPrice <= 0) {
                    abort(422, 'Trip pricing is not configured');
                }

                $total = $unitPrice * $pax;
                $paid = min($total, (int) ($data['paidAmount'] ?? 0));
                $seq = (int) (Booking::query()->lockForUpdate()->count() + 1001);
                $year = now()->format('Y');

                if ($status !== 'cancelled') {
                    $departure->booked_seats = (int) $departure->booked_seats + $pax;
                    $departure->save();
                }

                $booking = Booking::query()->create([
                    'user_id' => $customer->id,
                    'trip_id' => $trip->id,
                    'departure_id' => $departure->id,
                    'booking_ref' => 'BC-'.$year.'-'.$seq,
                    'trip_slug' => $trip->slug,
                    'trip_title' => $trip->title,
                    'destination' => $trip->destination?->name ?? '',
                    'batch_date' => $departure->start_date,
                    'travelers' => $pax,
                    'adults' => (int) $data['adults'],
                    'children' => (int) $data['children'],
                    'traveler_details' => $data['travelerDetails'] ?? [],
                    'contact_phone' => $data['contactPhone'] ?? $customer->phone,
                    'contact_email' => $data['contactEmail'] ?? $customer->email,
                    'status' => $status,
                    'subtotal_amount' => $total,
                    'addons_total' => 0,
                    'discount_amount' => 0,
                    'selected_addons' => [],
                    'coupon_code' => null,
                    'total_amount' => $total,
                    'paid_amount' => $paid,
                    'balance_due' => max(0, $total - $paid),
                    'invoice_number' => 'INV-'.$year.'-'.$seq,
                    'voucher_code' => 'VCH-'.Str::upper(Str::substr(Str::slug($trip->slug), 0, 3)).'-'.$seq,
                ]);

                if ($paid > 0) {
                    Payment::query()->create([
                        'booking_id' => $booking->id,
                        'user_id' => $customer->id,
                        'amount' => $paid,
                        'currency' => config('stripe.currency', 'inr'),
                        'status' => 'succeeded',
                        'provider' => 'admin',
                        'mode' => $paid >= $total ? 'full' : 'deposit',
                        'paid_at' => now(),
                        'meta' => ['source' => 'admin_create', 'notes' => $data['notes'] ?? null],
                    ]);
                }

                return $booking;
            });
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => $e->getMessage()],
            ], $e->getStatusCode());
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Could not create booking'],
            ], 500);
        }

        ActivityLogger::log("Admin created booking {$booking->booking_ref}", 'bookings');
        $booking->load(['user', 'payments', 'documents']);

        $notifier = app(\App\Services\BookingNotificationService::class);
        $notifier->sendBookingCreated($booking);
        $succeededPayment = $booking->payments->firstWhere('status', 'succeeded');
        if ($succeededPayment) {
            $notifier->sendPaymentReceived($booking, $succeededPayment);
        }

        return response()->json([
            'success' => true,
            'data' => new AdminBookingResource($booking),
        ], 201);
    }

    public function update(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'cancelled', 'completed'])],
            'customerId' => ['sometimes', 'exists:users,id'],
            'tripId' => ['sometimes', 'exists:trips,id'],
            'departureId' => ['sometimes', 'exists:departures,id'],
            'adults' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'children' => ['sometimes', 'integer', 'min:0', 'max:10'],
            'contactPhone' => ['nullable', 'string', 'max:20'],
            'contactEmail' => ['nullable', 'email', 'max:255'],
            'travelerDetails' => ['nullable', 'array'],
            'paidAmount' => ['sometimes', 'integer', 'min:0'],
            'totalAmount' => ['sometimes', 'integer', 'min:0'],
            'recordPaymentAmount' => ['sometimes', 'integer', 'min:1'],
            'recalculatePricing' => ['sometimes', 'boolean'],
        ]);

        try {
            $recordedPayment = null;
            DB::transaction(function () use ($data, $booking, &$recordedPayment) {
                $booking = Booking::query()->whereKey($booking->id)->lockForUpdate()->firstOrFail();
                $previousStatus = $booking->status;
                $previousPax = (int) $booking->travelers;
                $previousDepartureId = $booking->departure_id;

                if (array_key_exists('customerId', $data)) {
                    $customer = User::query()->with('role')->findOrFail($data['customerId']);
                    if (! $customer->isCustomer()) {
                        throw new \RuntimeException('Selected user must be a customer');
                    }
                    $booking->user_id = $customer->id;
                    if (! array_key_exists('contactEmail', $data) && ! $booking->contact_email) {
                        $booking->contact_email = $customer->email;
                    }
                    if (! array_key_exists('contactPhone', $data) && ! $booking->contact_phone) {
                        $booking->contact_phone = $customer->phone;
                    }
                }

                $tripChanged = array_key_exists('tripId', $data) || array_key_exists('departureId', $data);
                if ($tripChanged) {
                    $tripId = (int) ($data['tripId'] ?? $booking->trip_id);
                    $departureId = (int) ($data['departureId'] ?? $booking->departure_id);
                    $trip = Trip::query()->with('destination')->findOrFail($tripId);
                    $departure = Departure::query()
                        ->whereKey($departureId)
                        ->where('trip_id', $trip->id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    $booking->trip_id = $trip->id;
                    $booking->departure_id = $departure->id;
                    $booking->trip_slug = $trip->slug;
                    $booking->trip_title = $trip->title;
                    $booking->destination = $trip->destination?->name ?? '';
                    $booking->batch_date = $departure->start_date;

                    $shouldRecalc = ($data['recalculatePricing'] ?? true) === true
                        && ! array_key_exists('totalAmount', $data);
                    if ($shouldRecalc) {
                        $pricing = CamelCase::convert($trip->pricing ?? []);
                        $basePrice = (int) ($pricing['salePrice'] ?? $pricing['basePrice'] ?? 0);
                        $override = CamelCase::convert($departure->pricing_override ?? []);
                        $unitPrice = (int) ($override['salePrice'] ?? $override['basePrice'] ?? $basePrice);
                        $pax = (int) ($data['adults'] ?? $booking->adults ?? $booking->travelers);
                        $pax += (int) ($data['children'] ?? $booking->children ?? 0);
                        if ($unitPrice <= 0) {
                            throw new \RuntimeException('Trip pricing is not configured');
                        }
                        $addons = (int) ($booking->addons_total ?? 0);
                        $discount = (int) ($booking->discount_amount ?? 0);
                        $subtotal = $unitPrice * max(1, $pax);
                        $booking->subtotal_amount = $subtotal;
                        $booking->total_amount = max(0, $subtotal + $addons - $discount);
                        $booking->balance_due = max(0, (int) $booking->total_amount - (int) $booking->paid_amount);
                    }
                }

                if (array_key_exists('adults', $data) || array_key_exists('children', $data)) {
                    $adults = (int) ($data['adults'] ?? $booking->adults ?? 1);
                    $children = (int) ($data['children'] ?? $booking->children ?? 0);
                    $booking->adults = $adults;
                    $booking->children = $children;
                    $booking->travelers = $adults + $children;
                }

                if (array_key_exists('contactPhone', $data)) {
                    $booking->contact_phone = $data['contactPhone'];
                }
                if (array_key_exists('contactEmail', $data)) {
                    $booking->contact_email = $data['contactEmail'];
                }
                if (array_key_exists('travelerDetails', $data)) {
                    $booking->traveler_details = $data['travelerDetails'];
                }

                if (array_key_exists('totalAmount', $data)) {
                    $booking->total_amount = (int) $data['totalAmount'];
                    $booking->balance_due = max(0, (int) $booking->total_amount - (int) $booking->paid_amount);
                }

                if (array_key_exists('paidAmount', $data)) {
                    $paid = min((int) $booking->total_amount, (int) $data['paidAmount']);
                    $booking->paid_amount = $paid;
                    $booking->balance_due = max(0, (int) $booking->total_amount - $paid);
                }

                if (! empty($data['recordPaymentAmount'])) {
                    $amount = min((int) $booking->balance_due, (int) $data['recordPaymentAmount']);
                    if ($amount > 0) {
                        $booking->paid_amount = (int) $booking->paid_amount + $amount;
                        $booking->balance_due = max(0, (int) $booking->total_amount - (int) $booking->paid_amount);
                        $recordedPayment = Payment::query()->create([
                            'booking_id' => $booking->id,
                            'user_id' => $booking->user_id,
                            'amount' => $amount,
                            'currency' => config('stripe.currency', 'inr'),
                            'status' => 'succeeded',
                            'provider' => 'admin',
                            'mode' => 'balance',
                            'paid_at' => now(),
                            'meta' => ['source' => 'admin_adjust'],
                        ]);
                    }
                }

                if (array_key_exists('status', $data)) {
                    $booking->status = $data['status'];
                }

                if ($booking->paid_amount > 0 && $booking->status === 'pending') {
                    $booking->status = 'confirmed';
                }

                $newPax = (int) $booking->travelers;
                $newDepartureId = $booking->departure_id;

                // Departure switch: release old seats then take new seats
                if ($previousDepartureId && (int) $previousDepartureId !== (int) $newDepartureId) {
                    if ($previousStatus !== 'cancelled') {
                        $old = Departure::query()->whereKey($previousDepartureId)->lockForUpdate()->first();
                        if ($old) {
                            $old->booked_seats = max(0, (int) $old->booked_seats - $previousPax);
                            $old->save();
                        }
                    }
                    if ($booking->status !== 'cancelled' && $newDepartureId) {
                        $new = Departure::query()->whereKey($newDepartureId)->lockForUpdate()->first();
                        if (! $new) {
                            throw new \RuntimeException('Selected departure not found');
                        }
                        if ($new->availableSeats() < $newPax) {
                            throw new \RuntimeException('Not enough seats on the selected departure');
                        }
                        $new->booked_seats = (int) $new->booked_seats + $newPax;
                        $new->save();
                    }
                } else {
                    $this->syncSeatsOnUpdate($booking, $previousStatus, $previousPax, $booking->status, $newPax);
                }

                $booking->save();
            });
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'errors' => ['form' => $e->getMessage() ?: 'Could not update booking'],
            ], 422);
        }

        ActivityLogger::log("Admin updated booking {$booking->booking_ref}", 'bookings');
        $booking->refresh()->load(['user', 'payments', 'documents']);

        if ($recordedPayment) {
            app(\App\Services\BookingNotificationService::class)
                ->sendPaymentReceived($booking, $recordedPayment);

            app(\App\Services\CouponService::class)->commitOnFirstPayment(
                $booking,
                $recordedPayment
            );
        }

        return response()->json([
            'success' => true,
            'data' => new AdminBookingResource($booking),
        ]);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        DB::transaction(function () use ($booking) {
            $booking = Booking::query()->whereKey($booking->id)->lockForUpdate()->firstOrFail();
            if ($booking->status !== 'cancelled' && $booking->departure_id) {
                $departure = Departure::query()->whereKey($booking->departure_id)->lockForUpdate()->first();
                if ($departure) {
                    $departure->booked_seats = max(0, (int) $departure->booked_seats - (int) $booking->travelers);
                    $departure->save();
                }
            }
            $booking->status = 'cancelled';
            $booking->save();
        });

        ActivityLogger::log("Admin cancelled booking {$booking->booking_ref}", 'bookings');
        $booking->refresh()->load(['user', 'payments', 'documents']);

        return response()->json([
            'success' => true,
            'data' => new AdminBookingResource($booking),
        ]);
    }

    public function invoice(Booking $booking)
    {
        $booking->load('user');
        $user = $booking->user;
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', [
            'booking' => $booking,
            'customerName' => $user?->name ?? ($booking->contact_email ?? 'Guest'),
            'customerEmail' => $user?->email ?? $booking->contact_email,
            'customerPhone' => $user?->phone ?? $booking->contact_phone,
        ]);

        return $pdf->download($booking->invoice_number.'.pdf');
    }

    public function voucher(Booking $booking)
    {
        $booking->load('user');
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.voucher', [
            'booking' => $booking,
            'customerName' => $booking->user?->name ?? ($booking->contact_email ?? 'Guest'),
        ]);

        return $pdf->download($booking->voucher_code.'.pdf');
    }

    public function downloadDocument(Booking $booking, BookingDocument $document)
    {
        if ($document->booking_id !== $booking->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Document not found'],
            ], 404);
        }

        if (! Storage::disk('local')->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'File not found'],
            ], 404);
        }

        return Storage::disk('local')->download($document->file_path, $document->name);
    }

    private function syncSeatsOnUpdate(
        Booking $booking,
        string $previousStatus,
        int $previousPax,
        string $newStatus,
        int $newPax
    ): void {
        if (! $booking->departure_id) {
            return;
        }

        $departure = Departure::query()->whereKey($booking->departure_id)->lockForUpdate()->first();
        if (! $departure) {
            return;
        }

        $wasActive = $previousStatus !== 'cancelled';
        $isActive = $newStatus !== 'cancelled';

        if ($wasActive && ! $isActive) {
            $departure->booked_seats = max(0, (int) $departure->booked_seats - $previousPax);
            $departure->save();

            return;
        }

        if (! $wasActive && $isActive) {
            if ($departure->availableSeats() < $newPax) {
                throw new \RuntimeException('Not enough seats to reactivate this booking');
            }
            $departure->booked_seats = (int) $departure->booked_seats + $newPax;
            $departure->save();

            return;
        }

        if ($wasActive && $isActive && $newPax !== $previousPax) {
            $diff = $newPax - $previousPax;
            if ($diff > 0 && $departure->availableSeats() < $diff) {
                throw new \RuntimeException('Not enough seats for the updated traveler count');
            }
            $departure->booked_seats = max(0, (int) $departure->booked_seats + $diff);
            $departure->save();
        }
    }
}
