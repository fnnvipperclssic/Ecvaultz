Security Alert: Account Locked - {{ $appName }}

Hello {{ $userName }},

Your account at {{ $appName }} has been temporarily locked due to {{ $failedAttempts }} failed login attempts.

Locked until: {{ $unlockTime }} ({{ $lockoutMinutes }} minutes from the last attempt)

If this wasn't you, we recommend changing your password immediately once you regain access.

This is an automated security alert from {{ $appName }}.
