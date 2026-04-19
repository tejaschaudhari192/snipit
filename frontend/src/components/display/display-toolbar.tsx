import { Button } from "@/components/ui/button";
import { MessageSquare, Globe, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FontSizeControls } from "@/components/editor/font-size-controls";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ExpirySelector } from "@/components/common/expiry-selector";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { CommentsSection } from "@/components/display/comments-section";
import { useAuth } from "@/context/AuthContext";
import type { PasteData, ActiveUser, SaveStatus } from "@/types";
import { UserAvatarList } from "./shared/user-avatar-list";
import { AutosaveStatus } from "./shared/autosave-status";
import { ToolbarActionButtons } from "./shared/toolbar-action-buttons";

interface DisplayToolbarProps {
	isEdit: boolean;
	content: string;
	onEdit: (val: boolean) => void;
	onDelete: () => void;
	onSave: () => void;
	onCancel: () => void;
	isSaving?: boolean;
	fontSize: number;
	setFontSize: (v: number | ((p: number) => number)) => void;
	showFontControls: boolean;
	allowComments: boolean;
	commentCount: number;
	paste: PasteData | undefined;
	onCommentAdded: (updatedPaste: PasteData) => void;
	activeUsers?: ActiveUser[];
	isAutosave?: boolean;
	setIsAutosave?: (v: boolean) => void;
	saveStatus?: SaveStatus;
	customId?: string;
	setCustomId?: (v: string) => void;
	expiresTime?: string;
	setExpiresTime?: (v: string) => void;
	setIsCustomExpiryDialogOpen?: (v: boolean) => void;
	showAutosave?: boolean;
	showSaveButton?: boolean;
	isTerminalOpen?: boolean;
	onToggleTerminal?: () => void;
	isCode?: boolean;
	language?: string;
}

export const DisplayToolbar = ({
	isEdit,
	content,
	onEdit,
	onDelete,
	onSave,
	onCancel,
	isSaving,
	fontSize,
	setFontSize,
	showFontControls,
	allowComments,
	commentCount,
	paste,
	onCommentAdded,
	activeUsers = [],
	isAutosave = false,
	setIsAutosave,
	saveStatus = "idle",
	customId = "",
	setCustomId,
	expiresTime = "",
	setExpiresTime,
	setIsCustomExpiryDialogOpen,
	showAutosave = true,
	showSaveButton = false,
	isTerminalOpen = false,
	onToggleTerminal,
	isCode = false,
	language = "text",
}: DisplayToolbarProps) => {
	const { t } = useTranslation();
	const { user } = useAuth();

	const isOwner = !paste?.owner || (user && paste.owner === user._id);

	const getUserRole = (): "admin" | "editor" | "viewer" | "commenter" => {
		if (isOwner) return "admin";

		if (paste?.shareList && user?.email) {
			const shareEntry = paste.shareList.find(
				(s) => s.email === user.email,
			);
			if (shareEntry) return shareEntry.role;
		}

		return paste?.publicRole || "viewer";
	};

	const userRole = getUserRole();
	const canEdit =
		userRole === "admin" ||
		userRole === "editor" ||
		paste?.editPermission === "public";
	const canDelete = isOwner || userRole === "admin";
	const isAdmin = userRole === "admin";

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-1.5 md:px-6 bg-background/40 backdrop-blur-xl relative z-20 shadow-sm border-b border-border/50">
			<ToolbarActionButtons
				isEdit={isEdit}
				canEdit={canEdit}
				canDelete={canDelete}
				content={content}
				onEdit={onEdit}
				onDelete={onDelete}
				onSave={onSave}
				onCancel={onCancel}
				isSaving={isSaving}
				isAutosave={isAutosave}
				showSaveButton={showSaveButton}
				isTerminalOpen={isTerminalOpen}
				onToggleTerminal={onToggleTerminal}
				isCode={isCode}
				language={language}
				pasteId={paste?.id}
			/>

			<div className="flex flex-1 items-center gap-2 justify-end">
				{isEdit && <AutosaveStatus status={saveStatus} />}
				<UserAvatarList users={activeUsers} />
				{isEdit && (
					<div className="flex items-center gap-3 animate-in fade-in duration-300 ml-2">
						{(isOwner || isAdmin) && setCustomId && (
							<div className="relative group w-32 md:w-40">
								<Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
								<Input
									value={customId}
									onChange={(e) =>
										setCustomId(e.target.value)
									}
									placeholder={t(
										"home.dynamic_id_dialog.placeholder",
										"ID...",
									)}
									className="pl-8 h-9 text-xs bg-background/50 border-border/50 focus:border-primary/50 !ring-0 shadow-sm transition-all"
								/>
							</div>
						)}

						{setIsAutosave && showAutosave && (
							<div
								className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-all duration-300 shadow-sm h-9 ${
									isAutosave
										? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
										: "bg-background/50 border-border/50"
								}`}
							>
								<span className="text-[10px] font-bold tracking-tight flex items-center gap-1.5 select-none uppercase">
									<Save
										className={`h-3 w-3 ${isAutosave ? "animate-pulse" : ""}`}
									/>
									Autosave
								</span>
								<Switch
									checked={isAutosave}
									onCheckedChange={setIsAutosave}
									className="scale-[0.7] data-[state=checked]:bg-emerald-500 origin-right"
								/>
							</div>
						)}

						{(isOwner || isAdmin) &&
							expiresTime &&
							setExpiresTime &&
							setIsCustomExpiryDialogOpen && (
								<ExpirySelector
									expiresTime={expiresTime}
									setExpiresTime={setExpiresTime}
									setIsCustomExpiryDialogOpen={
										setIsCustomExpiryDialogOpen
									}
									className="h-9 min-w-[120px] text-xs"
								/>
							)}
					</div>
				)}
				{showFontControls && (
					<FontSizeControls
						fontSize={fontSize}
						setFontSize={setFontSize}
					/>
				)}
				{(allowComments || (paste && !paste.owner)) && (
					<Sheet modal={false}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="gap-2 text-primary font-semibold hover:bg-primary/5"
							>
								<MessageSquare className="h-4 w-4" />
								<span className="hidden sm:inline">
									{t("common.discussion")}
								</span>
								{commentCount > 0 && (
									<span className="bg-primary/10 px-1.5 py-0.5 rounded text-[10px] animate-in zoom-in-50">
										{commentCount}
									</span>
								)}
							</Button>
						</SheetTrigger>
						<SheetContent
							hideOverlay
							className="flex flex-col h-full sm:max-w-md w-full border-l shadow-2xl p-0 overflow-hidden"
						>
							<SheetHeader className="p-6 pb-2 border-b">
								<SheetTitle className="flex items-center gap-2 text-xl">
									<MessageSquare className="w-5 h-5 text-primary" />
									{t("common.discussion_title")}
								</SheetTitle>
								<SheetDescription>
									{t("common.discussion_desc")}
								</SheetDescription>
							</SheetHeader>
							<div className="flex-1 min-h-0 p-6">
								{paste && (
									<CommentsSection
										paste={paste}
										onCommentAdded={onCommentAdded}
									/>
								)}
							</div>
						</SheetContent>
					</Sheet>
				)}
			</div>
		</div>
	);
};
