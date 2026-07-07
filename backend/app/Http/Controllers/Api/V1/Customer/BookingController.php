<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingDocumentResource;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function pay(Request $request, Booking $booking): JsonResponse
    {
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

        if ($booking->balance_due === 0 && $booking->status === 'pending') {
            $booking->status = 'confirmed';
        }

        $booking->save();
        $booking->load('documents');

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
        $content = $this->buildInvoiceText($booking, $user);

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$booking->invoice_number.'.txt"',
        ]);
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
        $content = $this->buildVoucherText($booking, $user);

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$booking->voucher_code.'.txt"',
        ]);
    }

    private function buildInvoiceText(Booking $booking, $user): string
    {
        return implode("\n", [
            'BACKPACKCLAN — TAX INVOICE',
            '================================',
            'Invoice No: '.$booking->invoice_number,
            'Booking Ref: '.$booking->booking_ref,
            'Date: '.$booking->created_at?->toDateString(),
            '',
            'BILLED TO',
            $user->name,
            $user->email,
            $user->phone ?? '',
            '',
            'TRIP DETAILS',
            $booking->trip_title,
            'Destination: '.$booking->destination,
            'Batch Date: '.$booking->batch_date?->toDateString(),
            'Travelers: '.$booking->travelers,
            '',
            'PAYMENT SUMMARY',
            'Total Amount: INR '.$booking->total_amount,
            'Paid: INR '.$booking->paid_amount,
            'Balance Due: INR '.$booking->balance_due,
            '',
            'Thank you for choosing Backpackclan!',
        ]);
    }

    private function buildVoucherText(Booking $booking, $user): string
    {
        return implode("\n", [
            'BACKPACKCLAN — TRAVEL VOUCHER',
            '================================',
            'Voucher Code: '.$booking->voucher_code,
            'Booking Ref: '.$booking->booking_ref,
            'Status: '.strtoupper($booking->status),
            '',
            'GUEST',
            $user->name,
            'Travelers: '.$booking->travelers,
            '',
            'TRIP',
            $booking->trip_title,
            $booking->destination,
            'Departure: '.$booking->batch_date?->toDateString(),
            '',
            'Present this voucher at check-in.',
        ]);
    }
}
