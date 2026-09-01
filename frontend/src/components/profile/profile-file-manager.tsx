import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid, List, Plus } from "lucide-react";
import { useFolders } from "@/context/FolderContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CreateFolderDialog } from "./create-folder-dialog";
import { FolderCard } from "./folder-card";
import { FolderBreadcrumb } from "./folder-breadcrumb";
import type { FolderData } from "@/types";

interface ProfileFileManagerProps {
	viewMode: "grid" | "list";
	onViewModeChange: (mode: "grid" | "list") => void;
	subfolders?: FolderData[];
}

export const ProfileFileManager: React.FC<ProfileFileManagerProps> = ({
	viewMode,
	onViewModeChange,
	subfolders: externalSubfolders,
}) => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const { folders, activeFolderId, setActiveFolderId } = useFolders();

	const [createOpen, setCreateOpen] = useState(false);

	// Subfolders for the current active folder (Root or specific parent)
	const currentSubfolders = React.useMemo(() => {
		if (!user) return [];
		return (
			externalSubfolders ||
			folders.filter((f) => f.parentId === activeFolderId)
		);
	}, [user, externalSubfolders, folders, activeFolderId]);

	return (
		<div className="space-y-3 mb-5 select-none">
			{/* Controls Bar: Breadcrumbs & View Toggle */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 border border-border/40 backdrop-blur-xl rounded-2xl p-2.5 px-4 shadow-xs">
				{/* Breadcrumb Navigation */}
				{user ? (
					<FolderBreadcrumb
						activeFolderId={activeFolderId}
						folders={folders}
						onNavigate={setActiveFolderId}
					/>
				) : (
					<div className="text-xs font-semibold text-muted-foreground">
						{t("profile.your_snippets")}
					</div>
				)}

				{/* Right Actions: Create Subfolder & View Mode Toggle */}
				<div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
					{user && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setCreateOpen(true)}
							className="h-8 gap-1.5 rounded-xl text-xs font-bold border-border/50 bg-background/50 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
						>
							<Plus className="w-3.5 h-3.5" />
							<span className="hidden xs:inline">
								{t("folders.create_subfolder")}
							</span>
						</Button>
					)}

					<div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/30">
						<button
							onClick={() => onViewModeChange("grid")}
							className={`p-1.5 rounded-lg transition-all cursor-pointer ${
								viewMode === "grid"
									? "bg-background text-primary shadow-xs font-bold"
									: "text-muted-foreground hover:text-foreground"
							}`}
							title={t("folders.grid_view")}
						>
							<Grid className="w-3.5 h-3.5" />
						</button>
						<button
							onClick={() => onViewModeChange("list")}
							className={`p-1.5 rounded-lg transition-all cursor-pointer ${
								viewMode === "list"
									? "bg-background text-primary shadow-xs font-bold"
									: "text-muted-foreground hover:text-foreground"
							}`}
							title={t("folders.list_view")}
						>
							<List className="w-3.5 h-3.5" />
						</button>
					</div>
				</div>
			</div>

			{/* Subfolders Grid / List Cards */}
			{currentSubfolders.length > 0 && (
				<div className="space-y-2">
					<span className="text-[10px] font-extrabold text-muted-foreground/80 uppercase tracking-widest px-1">
						{t("folders.subfolders")} ({currentSubfolders.length})
					</span>
					<div
						className={
							viewMode === "grid"
								? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
								: "space-y-2"
						}
					>
						{currentSubfolders.map((folder, idx) => (
							<FolderCard
								key={folder._id}
								folder={folder}
								index={idx}
							/>
						))}
					</div>
				</div>
			)}

			<CreateFolderDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				parentId={activeFolderId}
			/>
		</div>
	);
};
