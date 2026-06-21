<?php

/**
 * Admin Login Attempt Controller — Audit Log Login untuk Administrator
 *
 * Menyediakan visibilitas penuh ke semua login attempt (berhasil & gagal).
 * Berguna untuk deteksi brute force, credential stuffing, dan investigasi
 * insiden keamanan.
 *
 * OWASP A09 (Security Logging & Monitoring):
 * - Semua login attempt tercatat dengan IP, user agent, timestamp
 * - Admin dapat memfilter dan menganalisis pola serangan
 *
 * @package App\Http\Controllers\Admin
 * @security OWASP A09 — Security monitoring dashboard
 */

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoginAttemptAdminController extends Controller
{
    /**
     * Daftar semua login attempt (paginated, filterable).
     *
     * @security Data sensitif (IP address) hanya bisa dilihat oleh admin
     */
    public function index(Request $request): Response
    {
        $allowedSort = ['email', 'success', 'ip_address', 'created_at'];
        $sort = in_array($request->get('sort'), $allowedSort, true) ? $request->get('sort') : 'created_at';
        $order = $request->get('order') === 'asc' ? 'asc' : 'desc';

        $query = LoginAttempt::with('user:id,name,email');

        // Filter: success/failure
        if ($request->has('success') && $request->get('success') !== '') {
            $query->where('success', $request->boolean('success'));
        }

        // Filter: email
        if ($email = $request->get('email')) {
            $escaped = addcslashes($email, '%_');
            $query->where('email', 'LIKE', "%{$escaped}%");
        }

        // Filter: IP address
        if ($ip = $request->get('ip_address')) {
            $query->where('ip_address', 'LIKE', $ip . '%');
        }

        // Filter: failure reason
        if ($reason = $request->get('failure_reason')) {
            $query->where('failure_reason', $reason);
        }

        $attempts = $query->orderBy($sort, $order)->paginate(25)->withQueryString();

        // Aggregate stats
        $stats = [
            'total' => LoginAttempt::count(),
            'successful' => LoginAttempt::where('success', true)->count(),
            'failed' => LoginAttempt::where('success', false)->count(),
            'today_failed' => LoginAttempt::where('success', false)
                ->whereDate('created_at', today())->count(),
            'unique_ips' => LoginAttempt::distinct('ip_address')->count('ip_address'),
        ];

        return Inertia::render('Admin/LoginAttempts/Index', [
            'attempts' => $attempts,
            'filters' => (object) $request->only(['success', 'email', 'ip_address', 'failure_reason', 'sort', 'order']),
            'stats' => $stats,
        ]);
    }
}
