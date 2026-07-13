import { memo, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Save, ChevronDown, Code2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import type {
	PasteData,
	ActiveUser,
	SaveStatus,
	CommentData,
	ContentMode,
} from "@/types";
import { cn } from "@/utils";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy Loaded Components
const FontSizeControls = lazy(() =>
	import("@/components/editor/font-size-controls").then((m) => ({
		default: m.FontSizeControls,
	})),
);
const LanguageSelector = lazy(() =>
	import("@/components/editor/language-selector").then((m) => ({
		default: m.LanguageSelector,
	})),
);
const AiAutocompleteToggle = lazy(() =>
	import("@/components/editor/ai-autocomplete-toggle").then((m) => ({
		default: m.AiAutocompleteToggle,
	})),
);
const TransliterationToggle = lazy(() =>
	import("@/components/editor/transliteration-toggle").then((m) => ({
		default: m.TransliterationToggle,
	})),
);
const AiWriterButton = lazy(() =>
	import("@/components/editor/ai-writer-button").then((m) => ({
		default: m.AiWriterButton,
	})),
);
const VoiceInputButton = lazy(() =>
	import("@/components/editor/voice-input-button").then((m) => ({
		default: m.VoiceInputButton,
	})),
);
const ExpirySelector = lazy(() =>
	import("@/components/common/expiry-selector").then((m) => ({
		default: m.ExpirySelector,
	})),
);
const CommentsSection = lazy(() =>
	import("@/components/display/comments-section").then((m) => ({
		default: m.CommentsSection,
	})),
);
const UserAvatarList = lazy(() =>
	import("./shared/user-avatar-list").then((m) => ({
		default: m.UserAvatarList,
	})),
);
const AutosaveStatus = lazy(() =>
	import("./shared/autosave-status").then((m) => ({
		default: m.AutosaveStatus,
	})),
);
const ToolbarActionButtons = lazy(() =>
	import("./shared/toolbar-action-buttons").then((m) => ({
		default: m.ToolbarActionButtons,
	})),
);

// Fallback Skeletons
const ButtonSkeleton = () => (
	<Skeleton className="h-9 w-9 rounded-lg shrink-0" />
);
const SelectorSkeleton = () => (
	<Skeleton className="h-9 w-32 rounded-lg shrink-0" />
);

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
	onCommentAdded: (comment: CommentData) => void;
	onCommentUpdated: (comment: CommentData) => void;
	onCommentDeleted: (commentId: string) => void;
	activeUsers?: ActiveUser[];
	isAutosave?: boolean;
	setIsAutosave?: (v: boolean) => void;
	saveStatus?: SaveStatus;
	expiresTime?: string;
	setExpiresTime?: (v: string) => void;
	setIsCustomExpiryDialogOpen?: (v: boolean) => void;
	showSaveButton?: boolean;
	isTerminalOpen?: boolean;
	onToggleTerminal?: () => void;
	isCode?: boolean;
	language?: string;
	contentType?: string;
	isAiAutocompleteEnabled?: boolean;
	setIsAiAutocompleteEnabled?: (v: boolean) => void;
	onAiWriterClick?: () => void;
	onContentChange?: (val: string) => void;
	onRecordingChange?: (val: boolean) => void;
	setLanguage?: (v: string) => void;
	isDetecting?: boolean;
	onAutoDetect?: () => void;
	setContentType?: (v: ContentMode) => void;
	isOptionsOpen?: boolean;
	setIsOptionsOpen?: (v: boolean) => void;
	transliterationEnabled?: boolean;
	onTransliterationToggle?: () => void;
	transliterationLanguage?: string;
	onTransliterationLanguageChange?: (lang: string) => void;
}

export const DisplayToolbar = memo(
	({
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
		onCommentUpdated,
		onCommentDeleted,
		activeUsers = [],
		isAutosave = false,
		setIsAutosave,
		saveStatus = "idle",
		expiresTime = "",
		setExpiresTime,
		setIsCustomExpiryDialogOpen,
		showSaveButton = false,
		isTerminalOpen = false,
		onToggleTerminal,
		isCode = false,
		language = "text",
		contentType = "text",
		isAiAutocompleteEnabled = false,
		setIsAiAutocompleteEnabled,
		onAiWriterClick,
		onContentChange,
		onRecordingChange,
		setLanguage,
		isDetecting = false,
		onAutoDetect,
		setContentType,
		isOptionsOpen = false,
		setIsOptionsOpen,
		transliterationEnabled,
		onTransliterationToggle,
		transliterationLanguage,
		onTransliterationLanguageChange,
	}: DisplayToolbarProps) => {
		const { t } = useTranslation();
		const { user } = useAuth();

		if (!paste) {
			return <ShimmerSection type="toolbar" />;
		}

		const isOwner = !!(user && paste?.owner === user._id);

		const getUserRole = (): "admin" | "editor" | "viewer" | "commenter" => {
			if (isOwner) return "admin";
			if (paste?.role) return paste.role;

			if (paste?.collaborators && user?.email) {
				const shareEntry = paste.collaborators.find(
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
		const isExplicitUser =
			isOwner ||
			(paste?.collaborators &&
				user?.email &&
				paste.collaborators.some((s) => s.email === user.email));
		const canShowDiscussion = isExplicitUser
			? ["admin", "editor", "commenter"].includes(userRole)
			: allowComments &&
				["admin", "editor", "commenter", "viewer"].includes(userRole);

		return (
			<div className="flex flex-row items-center justify-between gap-4 px-4 py-1.5 md:px-6 bg-background/40 backdrop-blur-xl relative z-20 shadow-sm border-b border-border/50 w-full overflow-x-auto no-scrollbar select-none">
				{/* Left Actions & Language Selector */}
				<div className="flex items-center gap-2 justify-start shrink-0">
					<div className="shrink-0 flex items-center">
						<Suspense
							fallback={<div className="flex gap-2 w-32 h-9" />}
						>
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
								contentType={contentType}
							/>
						</Suspense>
					</div>

					{isEdit &&
						(isDetecting ||
							contentType === "code" ||
							contentType === "text") &&
						setLanguage &&
						setContentType && (
							<div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 shrink-0">
								<Suspense fallback={<SelectorSkeleton />}>
									<LanguageSelector
										value={language}
										onValueChange={(val) => {
											setLanguage(val);
											if (val === "text") {
												setContentType("text");
											} else {
												setContentType("code");
											}
										}}
										isDetecting={isDetecting}
										className="w-40 h-9 text-xs"
									/>
								</Suspense>
								{!isDetecting && onAutoDetect && (
									<Button
										variant="outline"
										size="icon"
										className="h-9 w-9 shrink-0 bg-background/80 backdrop-blur-sm border-border/50 shadow-sm"
										onClick={onAutoDetect}
										title={t("home.auto_detecting")}
									>
										<Code2 className="h-4 w-4 text-muted-foreground" />
									</Button>
								)}
							</div>
						)}
				</div>

				{/* Right Options */}
				<div className="flex items-center justify-end gap-2.5 shrink-0">
					{isEdit && setIsOptionsOpen && user && (
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"gap-2 h-9 text-xs font-bold px-3 transition-all rounded-lg shrink-0",
								isOptionsOpen
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-primary/5 hover:text-primary",
							)}
							onClick={() => setIsOptionsOpen(!isOptionsOpen)}
						>
							<span className="hidden sm:inline">
								{t("home.advanced_config")}
							</span>
							<ChevronDown
								className={cn(
									"h-4 w-4 transition-transform duration-300",
									isOptionsOpen && "rotate-180",
								)}
							/>
						</Button>
					)}
					{isEdit && (
						<div className="shrink-0 flex items-center">
							<Suspense fallback={<div className="w-16 h-4" />}>
								<AutosaveStatus status={saveStatus} />
							</Suspense>
						</div>
					)}
					<div className="shrink-0 flex items-center">
						<Suspense
							fallback={<div className="flex -space-x-2" />}
						>
							<UserAvatarList users={activeUsers} />
						</Suspense>
					</div>
					{isEdit &&
						setIsAiAutocompleteEnabled &&
						contentType !== "file" &&
						contentType !== "draw" && (
							<Suspense fallback={<ButtonSkeleton />}>
								<AiAutocompleteToggle
									enabled={isAiAutocompleteEnabled}
									onToggle={setIsAiAutocompleteEnabled}
									className="h-9 shrink-0"
								/>
							</Suspense>
						)}

					{isEdit &&
						(isOwner || isAdmin) &&
						expiresTime &&
						setExpiresTime &&
						setIsCustomExpiryDialogOpen && (
							<Suspense fallback={<SelectorSkeleton />}>
								<ExpirySelector
									expiresTime={expiresTime}
									setExpiresTime={setExpiresTime}
									setIsCustomExpiryDialogOpen={
										setIsCustomExpiryDialogOpen
									}
									className="h-9 min-w-30 text-xs shrink-0"
								/>
							</Suspense>
						)}

					{isEdit &&
						onAiWriterClick &&
						contentType !== "file" &&
						contentType !== "draw" && (
							<Suspense fallback={<ButtonSkeleton />}>
								<AiWriterButton onClick={onAiWriterClick} />
							</Suspense>
						)}

					{isEdit &&
						["text", "richtext"].includes(contentType) &&
						transliterationEnabled !== undefined &&
						onTransliterationToggle &&
						transliterationLanguage &&
						onTransliterationLanguageChange && (
							<Suspense fallback={<ButtonSkeleton />}>
								<TransliterationToggle
									enabled={transliterationEnabled}
									onToggle={onTransliterationToggle}
									language={transliterationLanguage}
									onLanguageChange={
										onTransliterationLanguageChange
									}
								/>
							</Suspense>
						)}

					{isEdit &&
						onContentChange &&
						contentType !== "file" &&
						contentType !== "draw" && (
							<Suspense fallback={<ButtonSkeleton />}>
								<VoiceInputButton
									value={content}
									setTextValue={onContentChange}
									onRecordingChange={onRecordingChange}
								/>
							</Suspense>
						)}

					{isEdit && (
						<div className="w-px h-6 bg-border/40 mx-1 shrink-0" />
					)}
					{isEdit && setIsAutosave && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div
										className={cn(
											"flex items-center gap-2 px-2.5 h-9 rounded-lg border transition-all cursor-pointer select-none active:scale-95 shrink-0",
											isAutosave
												? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
												: "bg-background/50 border-border/50 hover:bg-muted/80",
										)}
										onClick={() =>
											setIsAutosave(!isAutosave)
										}
									>
										<Save className="h-4 w-4" />
										<Switch
											checked={isAutosave}
											onCheckedChange={setIsAutosave}
											className="scale-[0.7] data-[state=checked]:bg-emerald-500"
										/>
									</div>
								</TooltipTrigger>
								<TooltipContent
									side="bottom"
									align="center"
									className="max-w-xs"
								>
									<span className="text-xs font-semibold">
										{t("common.autosave")}
									</span>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					{showFontControls && (
						<div className="shrink-0 flex items-center">
							<Suspense fallback={<ButtonSkeleton />}>
								<FontSizeControls
									fontSize={fontSize}
									setFontSize={setFontSize}
								/>
							</Suspense>
						</div>
					)}
					{canShowDiscussion && (
						<Sheet modal={false}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="gap-2 text-primary font-semibold hover:bg-primary/5 shrink-0"
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
										<Suspense fallback={null}>
											<CommentsSection
												paste={paste}
												onCommentAdded={onCommentAdded}
												onCommentUpdated={onCommentUpdated}
												onCommentDeleted={onCommentDeleted}
											/>
										</Suspense>
									)}
								</div>
							</SheetContent>
						</Sheet>
					)}
				</div>
			</div>
		);
	},
);
