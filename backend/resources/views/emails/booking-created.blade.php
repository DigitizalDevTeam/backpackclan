<x-mail::message>
# Booking confirmed

Hi{{ $booking->user?->name ? ' '.$booking->user->name : '' }},

We have received your booking for **{{ $booking->trip_title }}**.

**Booking ref:** {{ $booking->booking_ref }}  
**Destination:** {{ $booking->destination }}  
**Batch:** {{ optional($booking->batch_date)->format('j M Y') }}  
**Travelers:** {{ $booking->travelers }}  
**Total:** ₹{{ number_format($booking->total_amount) }}  
**Paid:** ₹{{ number_format($booking->paid_amount) }}  
**Balance due:** ₹{{ number_format($booking->balance_due) }}

@if($booking->balance_due > 0)
Please complete payment to secure your seats. You will receive another email with your invoice once payment is successful.
@else
Your booking is fully paid. A payment confirmation email with your invoice is on its way.
@endif

<x-mail::button :url="config('app.frontend_url', config('app.url')).'/book/pay/'.$booking->id">
@if($booking->balance_due > 0)
Pay now
@else
View booking
@endif
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
