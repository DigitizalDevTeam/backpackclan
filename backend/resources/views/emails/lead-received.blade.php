<x-mail::message>
# New lead: {{ str_replace('_', ' ', $lead->type) }}

**Name:** {{ $lead->name }}  
**Email:** {{ $lead->email ?? '—' }}  
**Phone:** {{ $lead->phone ?? '—' }}  
**Status:** {{ $lead->status }}

@if(!empty($lead->payload))
## Details
@foreach($lead->payload as $key => $value)
@if(!in_array($key, ['resumePath'], true) && !is_array($value))
- **{{ \Illuminate\Support\Str::headline($key) }}:** {{ $value }}
@endif
@endforeach
@endif

@if($lead->source_url)
Source: {{ $lead->source_url }}
@endif

Manage leads in the admin panel.
</x-mail::message>
