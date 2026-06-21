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
 * Email sent to a recipient when a file is shared with them.
 */
class FileSharedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $sharer,
        public User $recipient,
        public File $file,
        public string $shareUrl,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[' . config('app.name') . '] ' . $this->sharer->name . ' shared a file with you',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            text: 'emails.file-shared-text',
            with: [
                'sharerName' => $this->sharer->name,
                'sharerEmail' => $this->sharer->email,
                'fileName' => $this->file->original_name,
                'fileSize' => $this->file->getSizeForHumans(),
                'shareUrl' => $this->shareUrl,
                'appName' => config('app.name'),
            ],
        );
    }
}
