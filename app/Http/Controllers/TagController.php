<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Tag;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

/**
 * Manages user-defined tags for file organization.
 *
 * Tags are per-user, with unique name constraint.
 * Files can have multiple tags; tags can be attached/detached via the file endpoint.
 */
class TagController extends Controller
{
    /**
     * List the authenticated user's tags with file counts.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $tags = Tag::where('user_id', $user->id)
            ->withCount('files')
            ->orderBy('name')
            ->get()
            ->map(fn (Tag $tag) => [
                'uuid' => $tag->uuid,
                'name' => $tag->name,
                'color' => $tag->color,
                'file_count' => $tag->files_count,
            ]);

        return response()->json(['tags' => $tags]);
    }

    /**
     * Create a new tag.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:tags,name,NULL,id,user_id,' . $request->user()->id],
            'color' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $user = $request->user();

        $tag = Tag::create([
            'user_id' => $user->id,
            'name' => trim($request->name),
            'color' => $request->color ?? '#6366f1',
        ]);

        ActivityLog::log($user->id, 'tag_created', $request->ip(), $request->userAgent(), [
            'tag_uuid' => $tag->uuid,
            'tag_name' => $tag->name,
        ]);

        return back()->with('success', 'Tag "' . $tag->name . '" created.');
    }

    /**
     * Update a tag (rename or change color).
     */
    public function update(Request $request, Tag $tag): RedirectResponse
    {
        $this->authorize('update', $tag);

        $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:tags,name,' . $tag->id . ',id,user_id,' . $request->user()->id],
            'color' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $oldName = $tag->name;
        $tag->update([
            'name' => trim($request->name),
            'color' => $request->color ?? $tag->color,
        ]);

        ActivityLog::log($request->user()->id, 'tag_updated', $request->ip(), $request->userAgent(), [
            'tag_uuid' => $tag->uuid,
            'old_name' => $oldName,
            'new_name' => $tag->name,
        ]);

        return back()->with('success', 'Tag updated.');
    }

    /**
     * Delete a tag and detach from all files.
     */
    public function destroy(Request $request, Tag $tag): RedirectResponse
    {
        $this->authorize('delete', $tag);

        $tagName = $tag->name;

        // Detach from all files first (cascade handles pivot)
        $tag->files()->detach();
        $tag->delete();

        ActivityLog::log($request->user()->id, 'tag_deleted', $request->ip(), $request->userAgent(), [
            'tag_name' => $tagName,
        ]);

        return back()->with('success', 'Tag "' . $tagName . '" deleted.');
    }

    /**
     * Attach tags to a file.
     */
    public function attach(Request $request, File $file): RedirectResponse
    {
        if (!Gate::allows('update', $file)) {
            abort(403);
        }

        $request->validate([
            'tag_uuids' => ['required', 'array', 'min:1', 'max:20'],
            'tag_uuids.*' => ['required', 'string', 'uuid', 'exists:tags,uuid'],
        ]);

        $user = $request->user();

        $tagIds = Tag::whereIn('uuid', $request->tag_uuids)
            ->where('user_id', $user->id)
            ->pluck('id')
            ->toArray();

        if (empty($tagIds)) {
            return back()->with('error', 'No valid tags found.');
        }

        $file->tags()->syncWithoutDetaching($tagIds);

        ActivityLog::log($user->id, 'tags_attached', $request->ip(), $request->userAgent(), [
            'file_uuid' => $file->uuid,
            'tag_uuids' => $request->tag_uuids,
        ]);

        return back()->with('success', 'Tags attached to file.');
    }

    /**
     * Detach a tag from a file.
     */
    public function detach(Request $request, File $file, Tag $tag): RedirectResponse
    {
        if (!Gate::allows('update', $file)) {
            abort(403);
        }

        $this->authorize('delete', $tag);

        $file->tags()->detach($tag->id);

        ActivityLog::log($request->user()->id, 'tag_detached', $request->ip(), $request->userAgent(), [
            'file_uuid' => $file->uuid,
            'tag_uuid' => $tag->uuid,
            'tag_name' => $tag->name,
        ]);

        return back()->with('success', 'Tag removed from file.');
    }
}
