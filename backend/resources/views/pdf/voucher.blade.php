<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $booking->voucher_code }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 13px; color: #0f172a; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .code { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
        .box { border: 2px solid #0f766e; border-radius: 10px; padding: 18px; margin-top: 18px; }
        .muted { color: #64748b; }
    </style>
</head>
<body>
    <h1>Travel Voucher</h1>
    <p class="muted">{{ config('app.name') }}</p>
    <div class="box">
        <p class="code">{{ $booking->voucher_code }}</p>
        <p><strong>Booking:</strong> {{ $booking->booking_ref }}</p>
        <p><strong>Status:</strong> {{ strtoupper($booking->status) }}</p>
        <p><strong>Guest:</strong> {{ $customerName }}</p>
        <p><strong>Travelers:</strong> {{ $booking->travelers }}</p>
        <p><strong>Trip:</strong> {{ $booking->trip_title }}</p>
        <p><strong>Destination:</strong> {{ $booking->destination }}</p>
        <p><strong>Departure:</strong> {{ optional($booking->batch_date)->format('d M Y') }}</p>
    </div>
    <p class="muted" style="margin-top:20px;">Present this voucher at check-in.</p>
</body>
</html>
