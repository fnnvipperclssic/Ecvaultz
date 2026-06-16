Security Alert - {{ $appName }}

Hello {{ $userName }},

A security-related event has occurred on your {{ $appName }} account:

Alert Type: {{ $alertType }}
Time: {{ $time }}

@if (!empty($details))
Details:
@foreach ($details as $key => $value)
  - {{ $key }}: {{ $value }}
@endforeach
@endif

If this was not you, please take immediate action to secure your account by changing your password.

This is an automated security alert from {{ $appName }}.
