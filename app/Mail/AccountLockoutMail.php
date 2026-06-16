<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountLockoutMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public int $failedAttempts,
        public int $lockoutMinutes,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[' . config('app.name') . '] Account Locked - Security Alert',
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'emails.account-locked-text',
            html: 'emails.account-locked',
            with: [
                'userName' => $this->user->name,
                'failedAttempts' => $this->failedAttempts,
                'lockoutMinutes' => $this->lockoutMinutes,
                'unlockTime' => now()->addMinutes($this->lockoutMinutes)->format('Y-m-d H:i:s'),
                'appName' => config('app.name'),
            ],
        );
    }
}
