<x-mail::message>
# Thanks for reaching out, {{ $lead->name }}!

We've received your {{ str_replace('_', ' ', $lead->type) }} inquiry and our team will get back to you within one business day.

If your request is urgent, reply to this email or call us.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
