<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingDocumentResource;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Departure;
use App\Models\Trip;
use App\Support\CamelCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->with('documents')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => BookingResource::collection($bookings),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tripSlug' => ['required', 'string', 'max:255'],
            'departureId' => ['required'],
            'adults' => ['required', 'integer', 'min:1', 'max:12'],
            'children' => ['required', 'integer', 'min:0', 'max:6'],
            'riderOption' => ['nullable', 'in:own_bike,solo,dual,coach'],
            'travelOption' => ['nullable', 'in:own_bike,solo,dual,coach'],
            'roomOption' => ['nullable', 'in:triple,double,single'],
            'travelers' => ['required', 'array', 'min:1'],
            'travelers.*.fullName' => ['required', 'string', 'max:120'],
            'travelers.*.age' => ['required', 'integer', 'min:1', 'max:100'],
            'travelers.*.gender' => ['required', 'in:male,female,other'],
            'travelers.*.idType' => ['required', 'in:aadhaar,passport,dl,other'],
            'travelers.*.idNumber' => ['required', 'string', 'max:50'],
            'travelers.*.travelOption' => ['nullable', 'in:own_bike,solo,dual,coach'],
            'travelers.*.riderOption' => ['nullable', 'in:own_bike,solo,dual,coach'],
            'travelers.*.roomOption' => ['nullable', 'in:triple,double,single'],
            'travelers.*.unitPrice' => ['nullable', 'integer', 'min:0'],
            'contactPhone' => ['nullable', 'string', 'max:20'],
            'contactEmail' => ['nullable', 'email', 'max:255'],
            'acceptedTerms' => ['accepted'],
            'couponCode' => ['nullable', 'string', 'max:50'],
            'addonIds' => ['nullable', 'array'],
            'addonIds.*' => ['string', 'max:50'],
        ]);

        $pax = (int) $data['adults'] + (int) $data['children'];
        if (count($data['travelers']) !== $pax) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Traveler details must match the number of adults and children'],
            ], 422);
        }

        $trip = Trip::query()
            ->with('destination')
            ->where('slug', $data['tripSlug'])
            ->where('status', 'published')
            ->first();

        if (! $trip) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Trip not found'],
            ], 404);
        }

        try {
            $booking = DB::transaction(function () use ($request, $data, $trip, $pax) {
                /** @var Departure|null $departure */
                $departure = Departure::query()
                    ->whereKey($data['departureId'])
                    ->where('trip_id', $trip->id)
                    ->lockForUpdate()
                    ->first();

                if (! $departure) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['form' => 'Selected batch not found'],
                    ], 404);
                }

                $status = $departure->resolveEffectiveStatus();
                if (in_array($status, ['sold_out', 'cancelled', 'booking_closed'], true)) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['form' => 'This batch is no longer available for booking'],
                    ], 422);
                }

                if ($departure->availableSeats() < $pax) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['form' => 'Not enough seats left for this batch'],
                    ], 422);
                }

                $pricing = CamelCase::convert($trip->pricing ?? []);
                $dynamic = \App\Support\DynamicPricing::normalize($pricing);
                $fallbackTravel = $data['travelOption'] ?? $data['riderOption'] ?? null;
                $fallbackRoom = $data['roomOption'] ?? null;

                $enrichedTravelers = [];
                $unitPrices = [];
                $tripSubtotal = 0;

                if (! empty($dynamic['enabled'])) {
                    $travelEnabled = ($dynamic['travelEnabled'] ?? true) !== false;
                    $roomEnabled = ($dynamic['roomEnabled'] ?? true) !== false;

                    foreach ($data['travelers'] as $index => $traveler) {
                        $travelOption = $traveler['travelOption']
                            ?? $traveler['riderOption']
                            ?? $fallbackTravel;
                        $roomOption = $traveler['roomOption'] ?? $fallbackRoom;

                        if ($travelEnabled && empty($travelOption)) {
                            return response()->json([
                                'success' => false,
                                'errors' => ['form' => 'Please select a travel option for traveler '.($index + 1)],
                            ], 422);
                        }
                        if ($roomEnabled && empty($roomOption)) {
                            return response()->json([
                                'success' => false,
                                'errors' => ['form' => 'Please select a room sharing option for traveler '.($index + 1)],
                            ], 422);
                        }

                        $unitPrice = \App\Support\DynamicPricing::resolveUnitPrice(
                            $dynamic,
                            $travelOption,
                            $roomOption
                        );
                        if ($unitPrice === null || $unitPrice <= 0) {
                            return response()->json([
                                'success' => false,
                                'errors' => ['form' => 'Pricing option is not available for traveler '.($index + 1)],
                            ], 422);
                        }

                        $unitPrices[] = $unitPrice;
                        $tripSubtotal += $unitPrice;
                        $enrichedTravelers[] = [
                            'fullName' => $traveler['fullName'],
                            'age' => (int) $traveler['age'],
                            'gender' => $traveler['gender'],
                            'idType' => $traveler['idType'],
                            'idNumber' => $traveler['idNumber'],
                            'travelOption' => $travelOption,
                            'roomOption' => $roomOption,
                            'unitPrice' => $unitPrice,
                        ];
                    }
                } else {
                    $basePrice = (int) ($pricing['salePrice'] ?? $pricing['basePrice'] ?? 0);
                    $override = CamelCase::convert($departure->pricing_override ?? []);
                    $unitPrice = (int) ($override['salePrice'] ?? $override['basePrice'] ?? $basePrice);
                    if ($unitPrice <= 0) {
                        return response()->json([
                            'success' => false,
                            'errors' => ['form' => 'Trip pricing is not configured'],
                        ], 422);
                    }

                    $tripSubtotal = $unitPrice * $pax;
                    foreach ($data['travelers'] as $traveler) {
                        $unitPrices[] = $unitPrice;
                        $enrichedTravelers[] = [
                            'fullName' => $traveler['fullName'],
                            'age' => (int) $traveler['age'],
                            'gender' => $traveler['gender'],
                            'idType' => $traveler['idType'],
                            'idNumber' => $traveler['idNumber'],
                            'travelOption' => null,
                            'roomOption' => null,
                            'unitPrice' => $unitPrice,
                        ];
                    }
                }

                $travelOptions = array_values(array_unique(array_filter(array_column($enrichedTravelers, 'travelOption'))));
                $roomOptions = array_values(array_unique(array_filter(array_column($enrichedTravelers, 'roomOption'))));
                $uniqueUnitPrices = array_values(array_unique($unitPrices));
                $bookingTravelOption = count($travelOptions) === 1 ? $travelOptions[0] : null;
                $bookingRoomOption = count($roomOptions) === 1 ? $roomOptions[0] : null;
                $bookingUnitPrice = count($uniqueUnitPrices) === 1 ? $uniqueUnitPrices[0] : null;

                $catalog = \App\Support\TripAddons::normalize($trip->addons);
                $addonSelection = \App\Support\TripAddons::resolveSelection(
                    $data['addonIds'] ?? [],
                    $catalog,
                    $pax
                );
                $subtotal = $tripSubtotal + $addonSelection['total'];

                $discount = 0;
                $couponCode = null;
                if (! empty($data['couponCode'])) {
                    try {
                        $couponResult = app(\App\Services\CouponService::class)->validate(
                            (string) $data['couponCode'],
                            $subtotal,
                            $trip->slug
                        );
                        $discount = $couponResult['discount'];
                        $couponCode = $couponResult['code'];
                    } catch (\Illuminate\Validation\ValidationException $e) {
                        return response()->json([
                            'success' => false,
                            'errors' => [
                                'form' => collect($e->errors())->flatten()->first() ?? 'Invalid coupon',
                            ],
                        ], 422);
                    }
                }

                $total = max(0, $subtotal - $discount);
                $seq = (int) (Booking::query()->lockForUpdate()->count() + 1001);
                $year = now()->format('Y');
                $bookingRef = 'BC-'.$year.'-'.$seq;
                $invoiceNumber = 'INV-'.$year.'-'.$seq;
                $voucherCode = 'VCH-'.Str::upper(Str::substr(Str::slug($trip->slug), 0, 3)).'-'.$seq;

                $departure->booked_seats = (int) $departure->booked_seats + $pax;
                $departure->save();

                return Booking::query()->create([
                    'user_id' => $request->user()->id,
                    'trip_id' => $trip->id,
                    'departure_id' => $departure->id,
                    'booking_ref' => $bookingRef,
                    'trip_slug' => $trip->slug,
                    'trip_title' => $trip->title,
                    'destination' => $trip->destination?->name ?? '',
                    'batch_date' => $departure->start_date,
                    'travelers' => $pax,
                    'adults' => (int) $data['adults'],
                    'children' => (int) $data['children'],
                    'rider_option' => $bookingTravelOption,
                    'room_option' => $bookingRoomOption,
                    'unit_price' => $bookingUnitPrice,
                    'traveler_details' => $enrichedTravelers,
                    'contact_phone' => $data['contactPhone'] ?? $request->user()->phone,
                    'contact_email' => $data['contactEmail'] ?? $request->user()->email,
                    'status' => 'pending',
                    'subtotal_amount' => $tripSubtotal,
                    'addons_total' => $addonSelection['total'],
                    'discount_amount' => $discount,
                    'selected_addons' => $addonSelection['items'],
                    'coupon_code' => $couponCode,
                    'total_amount' => $total,
                    'paid_amount' => 0,
                    'balance_due' => $total,
                    'invoice_number' => $invoiceNumber,
                    'voucher_code' => $voucherCode,
                ]);
            });
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Could not create booking. Please try again.'],
            ], 500);
        }

        if ($booking instanceof JsonResponse) {
            return $booking;
        }

        $booking->load('documents');

        app(\App\Services\BookingNotificationService::class)
            ->sendBookingCreated($booking->loadMissing('user'));

        return response()->json([
            'success' => true,
            'data' => new BookingResource($booking),
        ], 201);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $booking->load('documents');

        return response()->json([
            'success' => true,
            'data' => new BookingResource($booking),
        ]);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        if ($booking->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'This booking is already cancelled'],
            ], 422);
        }

        if ($booking->status === 'completed') {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Completed bookings cannot be cancelled online'],
            ], 422);
        }

        if ((int) $booking->paid_amount > 0) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Bookings with payments must be cancelled via support. Contact us for refund assistance.'],
            ], 422);
        }

        DB::transaction(function () use ($booking) {
            /** @var Booking $locked */
            $locked = Booking::query()->whereKey($booking->id)->lockForUpdate()->firstOrFail();

            if ($locked->status !== 'cancelled' && $locked->departure_id) {
                $departure = Departure::query()
                    ->whereKey($locked->departure_id)
                    ->lockForUpdate()
                    ->first();

                if ($departure) {
                    $departure->booked_seats = max(
                        0,
                        (int) $departure->booked_seats - (int) $locked->travelers
                    );
                    $departure->save();
                }
            }

            $locked->status = 'cancelled';
            $locked->save();
        });

        $booking->refresh()->load('documents');

        return response()->json([
            'success' => true,
            'data' => new BookingResource($booking),
        ]);
    }

    public function pay(Request $request, Booking $booking): JsonResponse
    {
        $allowDemoPay = config('app.debug')
            || filter_var(env('ALLOW_DEMO_PAYMENTS', false), FILTER_VALIDATE_BOOLEAN);

        if (! $allowDemoPay) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Direct payment is disabled. Use the payment gateway.'],
            ], 403);
        }

        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        if ($data['amount'] > $booking->balance_due) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Payment amount exceeds balance due'],
            ], 400);
        }

        $booking->paid_amount += $data['amount'];
        $booking->balance_due -= $data['amount'];

        if ($booking->paid_amount > 0 && $booking->status === 'pending') {
            $booking->status = 'confirmed';
        }

        $booking->save();
        $booking->load('documents');

        $payment = \App\Models\Payment::query()->create([
            'booking_id' => $booking->id,
            'user_id' => $request->user()->id,
            'amount' => $data['amount'],
            'currency' => config('stripe.currency', 'inr'),
            'status' => 'succeeded',
            'provider' => 'manual',
            'mode' => 'balance',
            'paid_at' => now(),
            'meta' => ['source' => 'legacy_pay'],
        ]);

        app(\App\Services\BookingNotificationService::class)
            ->sendPaymentReceived($booking->loadMissing('user'), $payment);

        app(\App\Services\CouponService::class)->commitOnFirstPayment($booking, $payment);

        return response()->json([
            'success' => true,
            'data' => new BookingResource($booking),
        ]);
    }

    public function uploadDocument(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $data = $request->validate([
            'file' => ['required', 'file', 'max:10240'],
            'category' => ['required', 'in:passport,id_proof,medical,other'],
        ]);

        $file = $data['file'];
        $path = $file->store("booking-documents/{$booking->id}", 'local');

        $document = $booking->documents()->create([
            'name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType() ?: 'application/octet-stream',
            'category' => $data['category'],
            'file_path' => $path,
        ]);

        return response()->json([
            'success' => true,
            'data' => new BookingDocumentResource($document),
        ], 201);
    }

    public function invoice(Request $request, Booking $booking)
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $user = $request->user();
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', [
            'booking' => $booking,
            'customerName' => $user->name,
            'customerEmail' => $user->email,
            'customerPhone' => $user->phone,
        ]);

        return $pdf->download($booking->invoice_number.'.pdf');
    }

    public function voucher(Request $request, Booking $booking)
    {
        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Booking not found'],
            ], 404);
        }

        $user = $request->user();
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.voucher', [
            'booking' => $booking,
            'customerName' => $user->name,
        ]);

        return $pdf->download($booking->voucher_code.'.pdf');
    }
}
