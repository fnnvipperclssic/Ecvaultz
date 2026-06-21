<?php

/**
 * Admin Security Question Controller — Overview Security Questions
 *
 * Menyediakan visibilitas administratif ke tabel `security_questions`.
 * Admin dapat melihat user mana yang sudah/belum setup security questions.
 *
 * CATATAN KEAMANAN: Jawaban security questions TIDAK PERNAH ditampilkan.
 * Yang disimpan di database adalah bcrypt hash — tidak bisa di-recover.
 * Admin HANYA bisa melihat: user mana, berapa pertanyaan, kapan dibuat.
 *
 * @package App\Http\Controllers\Admin
 * @security OWASP A07 — Jawaban tidak pernah ditampilkan (bcrypt hashed)
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecurityQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityQuestionAdminController extends Controller
{
    /**
     * Daftar user dengan status security questions.
     *
     * @security TIDAK menampilkan jawaban — hanya jumlah pertanyaan per user
     */
    public function index(Request $request): Response
    {
        $allowedSort = ['user_id', 'questions_count', 'created_at'];
        $sort = in_array($request->get('sort'), $allowedSort, true) ? $request->get('sort') : 'created_at';
        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        // Group by user, count questions
        $query = \App\Models\User::query()
            ->withCount('securityQuestions')
            ->whereHas('securityQuestions');

        if ($search = $request->get('search')) {
            $escaped = addcslashes($search, '%_');
            $query->where(function ($q) use ($escaped) {
                $q->where('name', 'LIKE', "%{$escaped}%")
                  ->orWhere('email', 'LIKE', "%{$escaped}%");
            });
        }

        $users = $query->orderBy(
            $sort === 'questions_count' ? 'security_questions_count' : $sort,
            $order
        )->paginate(25)->withQueryString();

        // Users tanpa security questions (at risk)
        $usersWithout = \App\Models\User::whereDoesntHave('securityQuestions')->count();

        return Inertia::render('Admin/SecurityQuestions/Index', [
            'users' => $users,
            'filters' => (object) $request->only(['search', 'sort', 'order']),
            'stats' => [
                'users_with_questions' => \App\Models\User::whereHas('securityQuestions')->count(),
                'users_without_questions' => $usersWithout,
                'total_questions' => SecurityQuestion::count(),
            ],
        ]);
    }
}
