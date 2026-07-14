<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingCreatedMail extends Mailable
{
    use SerializesModels;

    public function __construct(public Booking $booking)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking received — '.$this->booking->booking_ref,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.booking-created',
            with: [
                'booking' => $this->booking,
            ],
        );
    }
}
