# Memory — a living agent memory explorer

A Three.js memory landscape with the organic lime-green particle branches of [Finn Taylor’s literal file tree](https://x.com/FinnoTaylor/status/2112286571999428676). Branches grow outward from a shared center, directly on the page, with quiet text labels and floating tools.

## On Naveen’s site

This is the local reference implementation from
`/Users/naveenbandarage/Developer/work-ideas/literal-file-tree`, brought into the
portfolio at `/memory`. The `Fun` page links to it. The original fictional Orchid
workspace is preserved; the center is labeled Naveen as a prototype for a personal
tree. The records remain fictional sample data, with no live agent connection.

The Next.js page uses the SEO component and a full-viewport layout. A same-origin iframe
keeps the standalone Three.js app’s CSS, document shortcuts, and rendering loop
separate from the rest of the site. There are no runtime requests to the original
hosted reference. All imports and edits stay in this browser’s IndexedDB.

## Run

From the repository root:

```sh
bun install
bun run dev            # http://localhost:3000/memory
bun run test:memory
bun run build
```

The dev and production build scripts first bundle this app with Vite into
`public/memory-explorer/`. This generated directory is ignored by Git and recreated
on deployment. Three.js is loaded only by this page’s iframe. Its worker and
example JSON use the same `/memory-explorer/` base path.

After editing the standalone source during development, run `bun run build:memory`
and refresh the page. Next.js changes reload normally.

## Use

- Open domain labels to grow branches from the center. Parent branches grow first; their children follow. Node positions stay stable as other branches open. Select a memory to inspect its content, evidence, source documents, and typed relationships.
- Use search to find records by title, content, or tags. Results include folder paths and text previews; use ↑/↓ and Enter to open a result. The inspector’s folder path takes you back to its branch. Choose **Recall** to record the actual local text retrieval results and highlight their supporting sources.
- **Memory options → Recall history** opens local and imported retrieval logs. Locally recorded recalls preserve the retrieved text and source ids, even after corrections.
- Correct a memory to create a revision with a new source. Pin memories to give matching records a small retrieval preference. Archive a memory to hide it from the present while preserving historical snapshots; the confirmation offers Undo to restore it immediately.
- The clock opens a timeline of creation, correction, supersession, and archive events. Choose **Now** to return to the current state.
- Import JSON, Markdown, or text using the menu or drag and drop. Markdown sections become memories; the complete original document becomes their source. Imports replace the current workspace; export first to preserve a copy.
- Export JSON to back up the workspace, move it between devices, or edit the schema externally. The bundled `public/example-memory.json` is a complete example.

## Storage and agent connection

Memory is stored locally in IndexedDB on the current browser origin. Expanded folders are stored in localStorage. Files are not uploaded. Clearing browser data removes this local memory. The initial Orchid workspace is fictional sample data.

This version supports imported memory and retrieval logs. It does not connect to a running agent, use embeddings, infer knowledge with an LLM, or expose an agent memory API. Its local retrieval is explicitly a title/content/tag text match. A future integration can replace the import adapter and supply real agent retrieval logs using the same schema.

## JSON format (version 1)

```json
{
  "version": 1,
  "agent": { "id": "my-agent", "name": "My agent" },
  "nodes": [
    { "id": "project", "type": "folder", "title": "projects/" },
    {
      "id": "source",
      "type": "source",
      "title": "instruction.txt",
      "content": "Use Three.js."
    },
    {
      "id": "decision",
      "type": "memory",
      "title": "rendering.md",
      "parent": "project",
      "content": "Use Three.js.",
      "source_ids": ["source"],
      "created_at": "2026-10-29T12:00:00Z"
    }
  ],
  "edges": [{ "from": "decision", "to": "source", "type": "supported_by" }],
  "recalls": []
}
```

Node types: `folder`, `memory`, `source`, `entity`. Every id is unique. Parents must be folders, and `source_ids` must point to sources. Text is rendered literally; imported markup is not executed.

Optional fields: `status` (`active`, `inferred`, `disputed`, `superseded`), `scope`, `evidence`, `tags`, `pinned`, `valid_to`, `archived_at`, `superseded_by`, and `revisions` (`at`, `content`, `source_ids`, `status`). Undated records are available in all snapshots and use an epoch baseline.

A recall record contains `id`, `query`, `at`, `method`, and `results` (`id`, `score`, `terms`, and optional `snapshot` with `title`, `content`, `source_ids`, `status`). Logs without snapshots resolve the record at the recall timestamp.

## Scale

Imports are limited to 10 MB, 10,000 records, and 50,000 relationships. These are input ceilings, not performance guarantees. A Web Worker performs projection and text retrieval. The scene is limited to 100 visible labels, six children per folder page, six roots per page, and 30 visible relationship curves. Search jumps directly to the page containing a selected memory. Branch geometry is bounded and disposed when no longer visible. The model test exercises a 5,000-memory export without projecting all records into the scene.

## Controls

Drag to pan; scroll or pinch to zoom. Click Memory or the fit control to frame the visible neighborhood. Keyboard: Tab/Enter to navigate, Cmd/Ctrl+F to search, Cmd/Ctrl+N to add a memory, Escape to close, +/- to zoom, 0 to fit. Reduced-motion preferences are respected.

Imports reject text fields over 100,000 characters with an explicit error instead of truncating their content. Split larger documents into smaller imports. Failed edit validation leaves the current workspace intact.
