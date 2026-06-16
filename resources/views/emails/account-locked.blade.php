<!DOCTYPE html>
<html>
<head><title>Account Locked - {{ $appName }}</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2 style="color: #dc2626;">Security Alert: Account Locked</h2>
    <p>Hello {{ $userName }},</p>
    <p>Your account at {{ $appName }} has been temporarily locked due to <strong>{{ $failedAttempts }}</strong> failed login attempts.</p>
    <p><strong>Locked until:</strong> {{ $unlockTime }} ({{ $lockoutMinutes }} minutes from the last attempt)</p>
    <p>If this wasn't you, we recommend changing your password immediately once you regain access.</p>
    <p>If you need immediate assistance, please contact our support team.</p>
    <hr>
    <p style="color: #6b7280; font-size: 12px;">This is an automated security alert from {{ $appName }}.</p>
</body>
</html>
