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
            'tripSlug' => $this->trip_slug,
            'tripTitle' => $this->trip_title,
            'destination' => $this->destination,
            'batchDate' => $this->batch_date?->toDateString(),
            'travelers' => $this->travelers,
            'status' => $this->status,
            'totalAmount' => $this->total_amount,
            'paidAmount' => $this->paid_amount,
            'balanceDue' => $this->balance_due,
            'invoiceNumber' => $this->invoice_number,
            'voucherCode' => $this->voucher_code,
            'documents' => BookingDocumentResource::collection(
                $this->whenLoaded('documents')
            ),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
