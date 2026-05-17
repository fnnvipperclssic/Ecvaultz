<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::with('user')
            ->where('user_id', $request->user()->id)
            ->latest('created_at');

        if ($request->has('action')) {
            $query->where('action', $request->input('action'));
        }

        $logs = $query->paginate(50)
            ->through(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'ip_address' => $log->ip_address,
                'user_agent' => $this->parseUserAgent($log->user_agent),
                'metadata' => $log->metadata,
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                'created_at_human' => $log->created_at->diffForHumans(),
            ]);

        $actionTypes = ActivityLog::where('user_id', $request->user()->id)
            ->distinct()
            ->pluck('action');

        return Inertia::render('ActivityLog', [
            'logs' => $logs,
            'actionTypes' => $actionTypes,
            'filters' => $request->only('action'),
        ]);
    }

    protected function parseUserAgent(?string $userAgent): string
    {
        if (!$userAgent) {
            return 'Unknown';
        }

        $browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
        foreach ($browsers as $browser) {
            if (str_contains($userAgent, $browser)) {
                if (preg_match('/' . $browser . '\/([\d.]+)/', $userAgent, $matches)) {
                    return $browser . ' ' . $matches[1];
                }
                return $browser;
            }
        }

        return 'Unknown Browser';
    }
}
