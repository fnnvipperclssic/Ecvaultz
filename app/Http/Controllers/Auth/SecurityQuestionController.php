<?php

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
     * Show security questions setup page.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $existingQuestions = $this->questionService->getQuestions($user);

        return Inertia::render('Auth/SecurityQuestions', [
            'predefinedQuestions' => SecurityQuestionService::predefinedQuestions(),
            'existingQuestions' => $existingQuestions,
            'hasQuestions' => $existingQuestions->isNotEmpty(),
        ]);
    }

    /**
     * Store security questions for the authenticated user.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'questions' => ['required', 'array', 'min:2', 'max:5'],
            'questions.*.question' => ['required', 'string', 'max:255'],
            'questions.*.answer' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $this->questionService->setQuestions($request->user(), $request->input('questions'));

        return back()->with('success', 'Security questions have been set up successfully.');
    }

    /**
     * Show verification page (during password reset flow).
     */
    public function showVerify(Request $request): Response
    {
        $email = session()->get('password_reset_email');
        if (!$email) {
            return Inertia::render('Auth/Login')->with('error', 'Session expired. Please try password reset again.');
        }

        $user = \App\Models\User::where('email', $email)->first();
        if (!$user) {
            return Inertia::render('Auth/Login')->with('error', 'User not found.');
        }

        $questions = $this->questionService->getRandomQuestions($user, 2);

        return Inertia::render('Auth/SecurityQuestionsVerify', [
            'email' => $email,
            'questions' => $questions->map(fn ($q) => ['id' => $q->id, 'question' => $q->question]),
        ]);
    }

    /**
     * Verify security question answers during password reset.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'verifications' => ['required', 'array', 'min:2'],
            'verifications.*.id' => ['required', 'integer'],
            'verifications.*.answer' => ['required', 'string'],
        ]);

        $user = \App\Models\User::where('email', $request->input('email'))->first();
        if (!$user) {
            return back()->with('error', 'User not found.');
        }

        if ($this->questionService->verifyAnswers($user, $request->input('verifications'))) {
            // Generate password reset token
            $token = \Illuminate\Support\Facades\Password::createToken($user);
            session()->forget('password_reset_email');

            ActivityLog::log($user->id, 'password_reset_security_questions_verified', $request->ip(), $request->userAgent());

            return redirect()->route('password.reset', ['token' => $token])->with('success', 'Identity verified. Please reset your password.');
        }

        return back()->with('error', 'Incorrect answers. Please try again.');
    }
}
