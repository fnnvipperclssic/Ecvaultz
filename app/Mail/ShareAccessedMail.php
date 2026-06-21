<?php

namespace App\Mail;

use App\Models\File;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email sent to the file owner when someone accesses their shared file.
 */
class ShareAccessedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $owner,
        public File $file,
        public string $accessorEmail,
        public string $accessorIp,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[' . config('app.name') . '] Your shared file was accessed',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            text: 'emails.share-accessed-text',
            with: [
                'ownerName' => $this->owner->name,
                'fileName' => $this->file->original_name,
                'accessorEmail' => $this->accessorEmail,
                'accessorIp' => $this->accessorIp,
                'accessTime' => now()->format('Y-m-d H:i:s'),
                'appName' => config('app.name'),
            ],
        );
    }
}
