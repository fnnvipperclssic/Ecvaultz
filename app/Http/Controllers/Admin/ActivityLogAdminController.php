<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogAdminController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::with('user')
            ->latest('created_at');

        if ($request->has('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $logs = $query->paginate(50)->through(fn ($log) => [
            'id' => $log->id,
            'action' => $log->action,
            'user_name' => $log->user?->name ?? 'System/Anonymous',
            'user_email' => $log->user?->email,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'metadata' => $log->metadata,
            'created_at' => $log->created_at->format('Y-m-d H:i:s'),
            'created_at_human' => $log->created_at->diffForHumans(),
        ]);

        $actionTypes = ActivityLog::distinct()->pluck('action');

        return Inertia::render('Admin/ActivityLog', [
            'logs' => $logs,
            'actionTypes' => $actionTypes,
            'filters' => $request->only(['action', 'user_id', 'date_from', 'date_to']),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = ActivityLog::with('user')->latest('created_at');

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $logs = $query->take(5000)->get();

        $filename = 'activity_logs_' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'User', 'Email', 'Action', 'IP Address', 'Metadata', 'Date']);
            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->id,
                    $log->user?->name ?? 'System',
                    $log->user?->email,
                    $log->action,
                    $log->ip_address,
                    json_encode($log->metadata),
                    $log->created_at->format('Y-m-d H:i:s'),
                ]);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
