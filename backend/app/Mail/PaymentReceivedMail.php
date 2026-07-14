<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReceivedMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        public Booking $booking,
        public Payment $payment,
        public bool $attachInvoice = true,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment received — '.$this->booking->booking_ref,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment-received',
            with: [
                'booking' => $this->booking,
                'payment' => $this->payment,
                'attachInvoice' => $this->attachInvoice,
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        if (! $this->attachInvoice) {
            return [];
        }

        $booking = $this->booking->loadMissing('user');
        $pdf = Pdf::loadView('pdf.invoice', [
            'booking' => $booking,
            'customerName' => $booking->user?->name ?? 'Guest',
            'customerEmail' => $booking->contact_email ?? $booking->user?->email,
            'customerPhone' => $booking->contact_phone ?? $booking->user?->phone,
        ])->output();

        return [
            Attachment::fromData(
                fn () => $pdf,
                ($booking->invoice_number ?: $booking->booking_ref).'.pdf'
            )->withMime('application/pdf'),
        ];
    }
}
