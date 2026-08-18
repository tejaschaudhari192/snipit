import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for the Monaco editor.
 * Matches the editor's layout with line numbers and content area.
 */
export const EditorSkeleton = () => (
	<div className="flex h-full w-full bg-background/50">
		{/* Line number gutter skeleton */}
		<div className="shrink-0 w-12 border-r border-border/30 bg-muted/5" />
		{/* Editor content skeleton */}
		<div className="flex-1 p-6 space-y-3">
			<Skeleton className="w-3/4 h-4 rounded" />
			<Skeleton className="w-1/2 h-4 rounded" />
			<Skeleton className="w-5/6 h-4 rounded" />
			<Skeleton className="w-full h-4 rounded" />
			<Skeleton className="w-2/3 h-4 rounded" />
			<Skeleton className="w-full h-4 rounded" />
			<Skeleton className="w-3/4 h-4 rounded" />
		</div>
	</div>
);

/**
 * Skeleton for the editor toolbar buttons.
 */
export const EditorToolbarSkeleton = () => (
	<div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex gap-2">
		<Skeleton className="h-9 w-9 rounded-lg" />
		<Skeleton className="h-9 w-9 rounded-lg" />
		<Skeleton className="h-9 w-9 rounded-lg" />
	</div>
);

/**
 * Skeleton for the collaborative drawing canvas.
 */
export const CollabDrawSkeleton = () => (
	<Skeleton className="w-full h-full rounded-xl" />
);

/**
 * Skeleton for the editor content area (full size).
 */
export const EditorContentSkeleton = () => (
	<Skeleton className="h-full w-full" />
);

/**
 * Skeleton for the preview pane (markdown/html display).
 */
export const PreviewPaneSkeleton = () => (
	<Skeleton className="p-10 rounded-2xl h-64 w-full" />
);

/**
 * Skeleton for the file upload area.
 */
export const FileUploadSkeleton = () => (
	<div className="h-full w-full flex items-center justify-center p-10">
		<div className="w-full max-w-xl space-y-6">
			<div className="flex flex-col items-center gap-4">
				<Skeleton className="h-12 w-12 rounded-xl" />
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-64" />
			</div>
			<Skeleton className="h-75 w-full rounded-2xl border-2 border-dashed" />
		</div>
	</div>
);

/**
 * Skeleton for the link result area.
 */
export const LinkResultSkeleton = () => (
	<div className="h-full w-full flex items-center justify-center p-10">
		<div className="w-full max-w-xl space-y-6">
			<div className="flex flex-col items-center gap-4">
				<Skeleton className="h-14 w-14 rounded-xl" />
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-4 w-60" />
			</div>
			<Skeleton className="h-12 w-full rounded-xl" />
		</div>
	</div>
);

/**
 * Skeleton for the Tiptap editor (docs mode).
 */
export const TiptapEditorSkeleton = () => (
	<Skeleton className="flex-1 w-full h-full" />
);
