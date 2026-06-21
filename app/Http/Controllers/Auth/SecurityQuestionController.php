<?php

/**
 * Security Question Controller — Setup & Verification
 *
 * Mengelola pembuatan dan verifikasi pertanyaan keamanan untuk:
 * 1. Setup pertanyaan oleh authenticated user (via profile)
 * 2. Verifikasi pertanyaan untuk reset password (password recovery flow)
 *
 * OWASP A07 (Identification & Authentication Failures):
 * - Jawaban disimpan dengan bcrypt hash — tidak bisa di-recover
 * - Verifikasi menggunakan timing-safe hash_equals untuk mencegah timing attack
 * - Token reset menggunakan HMAC-SHA256 signed dengan APP_KEY
 * - Token memiliki TTL 15 menit — mencegah replay attack
 * - Throttle diterapkan di route level untuk mencegah brute force
 *
 * @package App\Http\Controllers\Auth
 * @security OWASP A07 — Secure identity verification
 */

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\SecurityQuestionService;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityQuestionController extends Controller
{
    protected SecurityQuestionService $questionService;

    public function __construct(SecurityQuestionService $questionService)
    {
        $this->questionService = $questionService;
    }

    /**
     * Tampilkan halaman setup security questions (untuk authenticated user).
     *
     * Menampilkan predefined questions + existing questions yang sudah di-set.
     *
     * @security Hanya user yang sudah terautentikasi yang bisa mengakses
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $existingQuestions = $this->questionService->getQuestions($user);

        return Inertia::render('Auth/SecurityQuestions', [
            'predefinedQuestions' => SecurityQuestionService::predefinedQuestions(),
            'existingQuestions' => $existingQuestions,
            'hasQuestions' => $existingQuestions->isNotEmpty(),
            'isMandatory' => session()->has('setup.security_questions'),
        ]);
    }

    /**
     * Simpan security questions untuk authenticated user.
     *
     * Minimum 2 pertanyaan, maksimum 5. Jawaban di-hash dengan bcrypt.
     *
     * @security Jawaban TIDAK PERNAH disimpan dalam plaintext — selalu bcrypt hash
     * @security Clear session flag 'setup.security_questions' setelah setup selesai
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'questions' => ['required', 'array', 'min:2', 'max:5'],
            'questions.*.question' => ['required', 'string', 'max:255'],
            'questions.*.answer' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $this->questionService->setQuestions($request->user(), $request->input('questions'));

        // Clear mandatory setup flag jika ada
        if (session()->has('setup.security_questions')) {
            session()->forget('setup.security_questions');
        }

        return back()->with('success', 'Security questions have been set up successfully.');
    }

    /**
     * Tampilkan halaman verifikasi security questions (password reset flow).
     *
     * Membaca email dari session (disimpan oleh PasswordResetLinkController).
     * Menampilkan 2 random questions yang sudah di-set oleh user.
     *
     * @security Email diambil dari session — tidak bisa dimanipulasi oleh user
     * @security Hanya menampilkan pertanyaan jika email valid + user punya questions
     */
    public function showVerify(Request $request): Response
    {
        $email = session()->get('password_reset_email');
        $expiry = session()->get('password_reset_email_expiry');

        // Validasi session email masih ada dan belum expired
        if (!$email || !$expiry || now()->timestamp > $expiry) {
            session()->forget(['password_reset_email', 'password_reset_email_expiry']);
            return Inertia::render('Auth/ForgotPassword')->with(
                'error',
                'Your session has expired. Please start the password reset process again.'
            );
        }

        $user = \App\Models\User::where('email', $email)->first();
        if (!$user) {
            session()->forget(['password_reset_email', 'password_reset_email_expiry']);
            return Inertia::render('Auth/ForgotPassword')->with(
                'error',
                'Account not found. Please try again.'
            );
        }

        // Ambil 2 pertanyaan random untuk verifikasi
        $questions = $this->questionService->getRandomQuestions($user, 2);

        if ($questions->isEmpty()) {
            return Inertia::render('Auth/ForgotPassword')->with(
                'error',
                'No security questions found for this account. Please contact the administrator.'
            );
        }

        return Inertia::render('Auth/SecurityQuestionsVerify', [
            'email' => $email,
            'questions' => $questions->map(fn ($q) => [
                'id' => $q->id,
                'question' => $q->question,
            ]),
        ]);
    }

    /**
     * Verifikasi jawaban security questions dan generate session reset token.
     *
     * Flow:
     * 1. Validasi jawaban via SecurityQuestionService (bcrypt hash_equals check)
     * 2. Jika benar → generate HMAC-SHA256 signed session token
     * 3. Token disimpan di session dengan TTL 15 menit
     * 4. Redirect ke halaman reset password
     *
     * Token structure:
     * - password_reset_token: hash_hmac('sha256', email . expiry, app.key)
     * - password_reset_email: email user
     * - password_reset_token_expiry: timestamp expiry (now + 15 minutes)
     *
     * @security Token menggunakan HMAC-SHA256 — tidak bisa dipalsukan tanpa APP_KEY
     * @security Token disimpan di server-side session — TIDAK dikirim via URL/email
     * @security TTL 15 menit — mencegah replay attack jangka panjang
     * @security Tidak menggunakan Password::createToken() — tidak ada token di database
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'lowercase'],
            'verifications' => ['required', 'array', 'min:2'],
            'verifications.*.id' => ['required', 'integer'],
            'verifications.*.answer' => ['required', 'string'],
        ]);

        // Verifikasi email cocok dengan yang di session
        $sessionEmail = session()->get('password_reset_email');
        if ($sessionEmail !== $request->input('email')) {
            return back()->with('error', 'Session mismatch. Please restart the password reset process.');
        }

        $user = \App\Models\User::where('email', $request->input('email'))->first();
        if (!$user) {
            return back()->with('error', 'User not found. Please restart the process.');
        }

        // Verifikasi jawaban security questions
        if ($this->questionService->verifyAnswers($user, $request->input('verifications'))) {
            // Generate signed session token menggunakan HMAC-SHA256
            $expiryTimestamp = now()->addMinutes(15)->timestamp;
            $tokenPayload = $user->email . $expiryTimestamp;
            $signedToken = hash_hmac('sha256', $tokenPayload, config('app.key'));

            // Simpan token di session — TIDAK di database
            session()->put('password_reset_token', $signedToken);
            session()->put('password_reset_token_expiry', $expiryTimestamp);
            // Email sudah ada di session dari PasswordResetLinkController

            ActivityLog::log(
                $user->id,
                'password_reset_security_questions_verified',
                $request->ip(),
                $request->userAgent(),
                ['questions_answered' => count($request->input('verifications'))]
            );

            // Redirect ke halaman reset password via named route
            return redirect()->route('password.reset')->with(
                'success',
                'Identity verified. Please set your new password below. This session expires in 15 minutes.'
            );
        }

        // Jawaban salah
        ActivityLog::log(
            $user->id,
            'password_reset_security_questions_failed',
            $request->ip(),
            $request->userAgent()
        );

        return back()->with('error', 'Incorrect answers. Please try again.');
    }
}
