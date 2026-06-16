<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;

class SecurityQuestion extends Model
{
    protected $fillable = [
        'user_id',
        'question',
        'answer_hash',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function hashAnswer(string $answer): string
    {
        return Hash::make($answer);
    }

    public function verifyAnswer(string $answer): bool
    {
        return Hash::check($answer, $this->answer_hash);
    }
}
