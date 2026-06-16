<?php

namespace App\Services;

use App\Models\SecurityQuestion;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Support\Collection;

class SecurityQuestionService
{
    /**
     * Pre-defined security question options.
     */
    public static function predefinedQuestions(): array
    {
        return [
            'Apa nama kota tempat Anda lahir?',
            'Siapa nama hewan peliharaan pertama Anda?',
            'Apa merek mobil pertama Anda?',
            'Siapa nama sekolah dasar Anda?',
            'Apa pekerjaan impian masa kecil Anda?',
            'Siapa nama guru favorit Anda?',
            'Apa makanan favorit Anda saat kecil?',
            'Di mana Anda menghabiskan liburan favorit pertama?',
            'Siapa nama panggilan masa kecil Anda?',
            'Apa film favorit Anda sepanjang masa?',
        ];
    }

    /**
     * Set security questions for a user.
     */
    public function setQuestions(User $user, array $questions): void
    {
        // Remove existing questions first
        SecurityQuestion::where('user_id', $user->id)->delete();

        foreach ($questions as $q) {
            if (empty($q['question']) || empty($q['answer'])) {
                continue;
            }

            SecurityQuestion::create([
                'user_id' => $user->id,
                'question' => $q['question'],
                'answer_hash' => SecurityQuestion::hashAnswer(trim(strtolower($q['answer']))),
            ]);
        }

        ActivityLog::log($user->id, 'security_questions_updated', request()->ip(), request()->userAgent(), [
            'count' => count($questions),
        ]);
    }

    /**
     * Get a user's security questions (without answers).
     */
    public function getQuestions(User $user): Collection
    {
        return SecurityQuestion::where('user_id', $user->id)
            ->select('id', 'question')
            ->get();
    }

    /**
     * Check if user has security questions set up.
     */
    public function hasQuestions(User $user): bool
    {
        return SecurityQuestion::where('user_id', $user->id)->exists();
    }

    /**
     * Get questions count for a user.
     */
    public function getQuestionCount(User $user): int
    {
        return SecurityQuestion::where('user_id', $user->id)->count();
    }

    /**
     * Verify a security question answer.
     */
    public function verifyAnswer(int $questionId, string $answer): bool
    {
        $question = SecurityQuestion::find($questionId);
        if (!$question) {
            return false;
        }

        return $question->verifyAnswer(trim(strtolower($answer)));
    }

    /**
     * Verify answers for a user (multiple questions).
     * Returns true only if ALL selected questions are answered correctly.
     */
    public function verifyAnswers(User $user, array $verifications): bool
    {
        $userQuestions = SecurityQuestion::where('user_id', $user->id)
            ->whereIn('id', array_column($verifications, 'id'))
            ->get()
            ->keyBy('id');

        if ($userQuestions->count() < count($verifications)) {
            return false;
        }

        foreach ($verifications as $v) {
            $question = $userQuestions->get($v['id']);
            if (!$question || !$question->verifyAnswer(trim(strtolower($v['answer'] ?? '')))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get random questions for verification.
     */
    public function getRandomQuestions(User $user, int $count = 2): Collection
    {
        return SecurityQuestion::where('user_id', $user->id)
            ->select('id', 'question')
            ->inRandomOrder()
            ->take($count)
            ->get();
    }
}
