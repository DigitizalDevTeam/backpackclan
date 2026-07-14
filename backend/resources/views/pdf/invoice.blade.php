<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $booking->invoice_number }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #0f172a; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        .muted { color: #64748b; }
        .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-top: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .right { text-align: right; }
        .total { font-size: 14px; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Tax Invoice</h1>
    <p class="muted">{{ config('app.name') }}</p>

    <div class="box">
        <p><strong>Invoice:</strong> {{ $booking->invoice_number }}</p>
        <p><strong>Booking:</strong> {{ $booking->booking_ref }}</p>
        <p><strong>Date:</strong> {{ optional($booking->created_at)->format('d M Y') }}</p>
        <p><strong>Billed to:</strong> {{ $customerName }} · {{ $customerEmail }}</p>
        @if($customerPhone)
            <p><strong>Phone:</strong> {{ $customerPhone }}</p>
        @endif
    </div>

    <div class="box">
        <p><strong>{{ $booking->trip_title }}</strong></p>
        <p class="muted">{{ $booking->destination }} · {{ optional($booking->batch_date)->format('d M Y') }} · {{ $booking->travelers }} travelers</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th class="right">Amount (INR)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Trip subtotal</td>
                <td class="right">{{ number_format($booking->subtotal_amount ?: ($booking->total_amount + $booking->discount_amount - $booking->addons_total)) }}</td>
            </tr>
            @if(($booking->addons_total ?? 0) > 0)
                <tr>
                    <td>Add-ons</td>
                    <td class="right">{{ number_format($booking->addons_total) }}</td>
                </tr>
            @endif
            @if(($booking->discount_amount ?? 0) > 0)
                <tr>
                    <td>Discount @if($booking->coupon_code) ({{ $booking->coupon_code }}) @endif</td>
                    <td class="right">-{{ number_format($booking->discount_amount) }}</td>
                </tr>
            @endif
            <tr class="total">
                <td>Total</td>
                <td class="right">{{ number_format($booking->total_amount) }}</td>
            </tr>
            <tr>
                <td>Paid</td>
                <td class="right">{{ number_format($booking->paid_amount) }}</td>
            </tr>
            <tr>
                <td>Balance due</td>
                <td class="right">{{ number_format($booking->balance_due) }}</td>
            </tr>
        </tbody>
    </table>

    <p class="muted" style="margin-top:24px;">Thank you for choosing {{ config('app.name') }}.</p>
</body>
</html>
