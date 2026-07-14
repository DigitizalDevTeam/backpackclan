<?php

namespace App\Mail;

use App\Models\Lead;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadReceivedMail extends Mailable
{
    use SerializesModels;

    public function __construct(public Lead $lead)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New '.$this->lead->type.' lead — '.$this->lead->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.lead-received',
            with: ['lead' => $this->lead],
        );
    }
}
