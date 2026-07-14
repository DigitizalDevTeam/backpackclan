<?php

namespace App\Services;

use App\Mail\BookingCreatedMail;
use App\Mail\PaymentReceivedMail;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Mail;

class BookingNotificationService
{
    public function __construct(private SettingsService $settings) {}

    public function sendBookingCreated(Booking $booking): void
    {
        if (! $this->enabled('bookingCreated')) {
            return;
        }

        $email = $this->customerEmail($booking);
        if (! $email) {
            return;
        }

        Mail::to($email)->send(new BookingCreatedMail($booking));
    }

    public function sendPaymentReceived(Booking $booking, Payment $payment): void
    {
        if (! $this->enabled('paymentReceived')) {
            return;
        }

        $email = $this->customerEmail($booking);
        if (! $email) {
            return;
        }

        $attachInvoice = (bool) ($this->notifications()['attachInvoice'] ?? true);
        Mail::to($email)->send(new PaymentReceivedMail($booking, $payment, $attachInvoice));
    }

    private function enabled(string $key): bool
    {
        $notifications = $this->notifications();

        return (bool) ($notifications[$key] ?? true);
    }

    /**
     * @return array<string, mixed>
     */
    private function notifications(): array
    {
        try {
            return $this->settings->group('notifications');
        } catch (\Throwable) {
            return SettingsService::defaults()['notifications'];
        }
    }

    private function customerEmail(Booking $booking): ?string
    {
        $email = $booking->contact_email ?: $booking->user?->email;

        return is_string($email) && $email !== '' ? $email : null;
    }
}
