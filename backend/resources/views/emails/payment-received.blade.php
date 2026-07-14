<x-mail::message>
# Payment received

Thank you! We received a payment of **₹{{ number_format($payment->amount) }}** for booking **{{ $booking->booking_ref }}**.

**Trip:** {{ $booking->trip_title }}  
**Paid so far:** ₹{{ number_format($booking->paid_amount) }}  
**Balance due:** ₹{{ number_format($booking->balance_due) }}  
**Status:** {{ ucfirst($booking->status) }}

@if(!empty($attachInvoice))
Your invoice PDF is attached to this email.
@else
You can download your invoice anytime from your account.
@endif

@if($booking->balance_due > 0)
You still have a balance remaining. Complete payment from your account when ready.
@endif

<x-mail::button :url="config('app.frontend_url', config('app.url')).'/account/bookings'">
Open my bookings
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
