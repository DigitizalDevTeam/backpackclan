<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Booking */
class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'bookingRef' => $this->booking_ref,
            'customerId' => (string) $this->user_id,
            'tripId' => $this->trip_id ? (string) $this->trip_id : null,
            'departureId' => $this->departure_id ? (string) $this->departure_id : null,
            'tripSlug' => $this->trip_slug,
            'tripTitle' => $this->trip_title,
            'destination' => $this->destination,
            'batchDate' => $this->batch_date?->toDateString(),
            'travelers' => $this->travelers,
            'adults' => (int) ($this->adults ?? $this->travelers),
            'children' => (int) ($this->children ?? 0),
            'riderOption' => $this->rider_option,
            'roomOption' => $this->room_option,
            'unitPrice' => $this->unit_price !== null ? (int) $this->unit_price : null,
            'travelerDetails' => $this->traveler_details ?? [],
            'contactPhone' => $this->contact_phone,
            'contactEmail' => $this->contact_email,
            'status' => $this->status,
            'totalAmount' => $this->total_amount,
            'paidAmount' => $this->paid_amount,
            'balanceDue' => $this->balance_due,
            'invoiceNumber' => $this->invoice_number,
            'voucherCode' => $this->voucher_code,
            'couponCode' => $this->coupon_code,
            'discountAmount' => (int) ($this->discount_amount ?? 0),
            'addonsTotal' => (int) ($this->addons_total ?? 0),
            'subtotalAmount' => (int) ($this->subtotal_amount ?? 0),
            'selectedAddons' => $this->selected_addons ?? [],
            'documents' => BookingDocumentResource::collection(
                $this->whenLoaded('documents')
            ),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
