<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SecurityAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $alertType,
        public array $details = [],
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'new_device_login' => 'New Device Login Detected',
            'password_changed' => 'Password Changed',
            '2fa_enabled' => 'Two-Factor Authentication Enabled',
            '2fa_disabled' => 'Two-Factor Authentication Disabled',
            'email_changed' => 'Email Address Changed',
        ];

        $subject = $subjects[$this->alertType] ?? 'Security Alert';
        return new Envelope(subject: '[' . config('app.name') . '] ' . $subject);
    }

    public function content(): Content
    {
        return new Content(
            text: 'emails.security-alert-text',
            with: [
                'userName' => $this->user->name,
                'alertType' => $this->alertType,
                'details' => $this->details,
                'time' => now()->format('Y-m-d H:i:s'),
                'appName' => config('app.name'),
            ],
        );
    }
}
