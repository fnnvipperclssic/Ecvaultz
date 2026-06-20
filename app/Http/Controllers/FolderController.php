<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class FolderController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\s\-_]+$/'],
            'parent_id' => ['nullable', 'uuid', 'exists:folders,uuid'],
        ]);

        $parentId = null;
        if ($request->parent_id) {
            $parentFolder = Folder::where('uuid', $request->parent_id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();
            $parentId = $parentFolder->id;
        }

        Folder::create([
            'user_id' => $request->user()->id,
            'parent_id' => $parentId,
            'name' => $request->name,
        ]);

        return back()->with('success', 'Folder created.');
    }

    public function update(Request $request, string $uuid): RedirectResponse
    {
        $folder = Folder::where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('update', $folder)) {
            abort(403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9\s\-_]+$/'],
        ]);

        $folder->name = $request->name;
        $folder->save();

        return back()->with('success', 'Folder renamed.');
    }

    /**
     * Return folder tree structure as JSON for the sidebar tree view.
     */
    public function tree(Request $request): \Illuminate\Http\JsonResponse
    {
        $folders = Folder::where('user_id', $request->user()->id)
            ->with('children')
            ->whereNull('parent_id')
            ->get()
            ->map(fn ($f) => $this->formatFolderNode($f));

        return response()->json(['folders' => $folders]);
    }

    protected function formatFolderNode(Folder $folder): array
    {
        return [
            'uuid' => $folder->uuid,
            'name' => $folder->name,
            'file_count' => $folder->files()->count(),
            'children' => $folder->children->map(fn ($child) => $this->formatFolderNode($child))->toArray(),
        ];
    }

    public function destroy(Request $request, string $uuid): RedirectResponse
    {
        $folder = Folder::where('uuid', $uuid)->firstOrFail();

        if (!Gate::allows('delete', $folder)) {
            abort(403);
        }

        // Move files to root before deleting folder
        $folder->files()->update(['folder_id' => null]);
        $folder->children()->update(['parent_id' => null]);

        $folder->delete();

        return back()->with('success', 'Folder deleted.');
    }
}
