import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Trash2, FolderInput, Share2, FolderMinus } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useAppDispatch } from "@/tools/password-manager/store";
import {
	deleteItem,
	persistItem,
} from "@/tools/password-manager/store/password-slice";
import type { PasswordItem, Folder } from "@/tools/password-manager/types";
import BulkShareModal from "./bulk-share-modal";
import { Spinner } from "@/components/ui/spinner";

const DeleteConfirmDialog = lazy(() =>
	import("@/components/common/delete-confirm-dialog").then((m) => ({
		default: m.DeleteConfirmDialog,
	})),
);

const BULK_SHARE_LIMIT = 20;

interface BulkActionBarProps {
	selectedItems: PasswordItem[];
	folders: Folder[];
	onClearSelection: () => void;
}

export default function BulkActionBar({
	selectedItems,
	folders,
	onClearSelection,
}: BulkActionBarProps) {
	const dispatch = useAppDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);

	const count = selectedItems.length;
	const isVisible = count > 0;
	const canShare = count <= BULK_SHARE_LIMIT;
	const personalFolders = folders.filter((f) => !f.collectionId);

	const handleMoveToFolder = async (folderId: string | null) => {
		setIsLoading(true);
		const updated = selectedItems.map((item) => ({
			...item,
			folderId: folderId ?? undefined,
		}));

		const results = await Promise.allSettled(
			updated.map((item) => dispatch(persistItem(item)).unwrap()),
		);

		const successCount = results.filter(
			(r) => r.status === "fulfilled",
		).length;
		const failCount = results.length - successCount;

		if (failCount > 0) {
			toast.add({
				title: `Failed to move ${failCount} item${failCount > 1 ? "s" : ""}.`,
				type: "error",
			});
		}
		if (successCount > 0) {
			const folderName = folderId
				? (folders.find((f) => f.id === folderId)?.name ?? "folder")
				: "No Folder";
			toast.add({
				title: `Moved ${successCount} item${successCount > 1 ? "s" : ""} to ${folderName}`,
				type: "success",
			});
		}

		setIsLoading(false);
		onClearSelection();
	};

	const handleBulkDelete = async () => {
		setIsLoading(true);
		setIsDeleteOpen(false);

		const results = await Promise.allSettled(
			selectedItems.map((item) => dispatch(deleteItem(item.id)).unwrap()),
		);

		const successCount = results.filter(
			(r) => r.status === "fulfilled",
		).length;
		const failCount = results.length - successCount;

		if (failCount > 0) {
			toast.add({
				title: `Failed to delete ${failCount} item${failCount > 1 ? "s" : ""}.`,
				type: "error",
			});
		}
		if (successCount > 0) {
			toast.add({
				title: `Deleted ${successCount} item${successCount > 1 ? "s" : ""}`,
				type: "success",
			});
		}

		setIsLoading(false);
		onClearSelection();
	};

	return (
		<>
			{/* Floating Bulk Action Bar */}
			<div
				className={`
					absolute bottom-6 left-1/2 -translate-x-1/2 z-50
					transition-all duration-300 ease-out
					${isVisible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-4 opacity-0 pointer-events-none"}
				`}
			>
				<div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-border bg-background/80 backdrop-blur-xl shadow-2xl shadow-black/20 ring-1 ring-white/5">
					{/* Clear Selection */}
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
						onClick={onClearSelection}
						disabled={isLoading}
					>
						<X className="w-4 h-4" />
					</Button>

					{/* Count badge */}
					<span className="text-sm font-medium text-foreground px-1 whitespace-nowrap">
						{count} selected
					</span>

					<div className="w-px h-5 bg-border mx-1" />

					{/* Move to Folder */}
					{personalFolders.length > 0 && (
						<DropdownMenu>
							<DropdownMenuTrigger render={
							<Button
									variant="ghost"
									size="sm"
									className="h-8 gap-1.5 text-sm"
									disabled={isLoading}
								>
									<FolderInput className="w-4 h-4" />
									Move
								</Button>
						} />
							<DropdownMenuContent
								align="center"
								side="top"
								className="w-44 mb-1"
							>
								{personalFolders.map((folder) => (
									<DropdownMenuItem
										key={folder.id}
										onClick={() =>
											handleMoveToFolder(folder.id)
										}
									>
										<span
											className="w-2 h-2 rounded-full mr-2 shrink-0"
											style={{
												backgroundColor: folder.color,
											}}
										/>
										{folder.name}
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => handleMoveToFolder(null)}
									className="text-muted-foreground"
								>
									<FolderMinus className="w-4 h-4 mr-2" />
									Remove from folder
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}

					{/* Share */}
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger render={
							<span>
									<Button
										variant="ghost"
										size="sm"
										className="h-8 gap-1.5 text-sm"
										disabled={isLoading || !canShare}
										onClick={() =>
											setIsShareModalOpen(true)
										}
									>
										<Share2 className="w-4 h-4" />
										Share
									</Button>
								</span>
						} />
							{!canShare && (
								<TooltipContent>
									Select {BULK_SHARE_LIMIT} or fewer items to
									share
								</TooltipContent>
							)}
						</Tooltip>
					</TooltipProvider>

					<div className="w-px h-5 bg-border mx-1" />

					{/* Delete */}
					<Button
						variant="ghost"
						size="sm"
						className="h-8 gap-1.5 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
						disabled={isLoading}
						onClick={() => setIsDeleteOpen(true)}
					>
						{isLoading ? (
							<Spinner className="w-4 h-4 animate-spin" />
						) : (
							<Trash2 className="w-4 h-4" />
						)}
						Delete
					</Button>
				</div>
			</div>

			{/* Bulk Delete Confirm */}
			<Suspense fallback={null}>
				<DeleteConfirmDialog
					isOpen={isDeleteOpen}
					onOpenChange={(open) => !open && setIsDeleteOpen(false)}
					onConfirm={handleBulkDelete}
					title={`Delete ${count} Item${count > 1 ? "s" : ""}?`}
					description={`This will permanently delete all ${count} selected item${count > 1 ? "s" : ""}. This action cannot be undone.`}
				/>
			</Suspense>

			{/* Bulk Share Modal */}
			{isShareModalOpen && (
				<BulkShareModal
					isOpen={isShareModalOpen}
					onClose={() => {
						setIsShareModalOpen(false);
						onClearSelection();
					}}
					items={selectedItems}
				/>
			)}
		</>
	);
}
