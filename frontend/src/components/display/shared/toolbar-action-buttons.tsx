import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Edit, Trash2, Save, X, Play, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_RUN_LANGUAGES } from "@/constants";
import { SaveAsButton } from "./save-as-button";
import { Spinner } from "@/components/ui/spinner";
import type { PasteData } from "@/types";

interface ToolbarActionButtonsProps {
	isEdit: boolean;
	canEdit: boolean;
	canDelete: boolean;
	content: string;
	onEdit: (val: boolean) => void;
	onDelete: () => void;
	onSave: () => void;
	onCancel: () => void;
	isSaving?: boolean;
	isAutosave?: boolean;
	showSaveButton?: boolean;
	isTerminalOpen?: boolean;
	onToggleTerminal?: () => void;
	isCode?: boolean;
	language?: string;
	pasteId?: string;
	contentType?: string;
	paste?: PasteData;
}

export const ToolbarActionButtons = ({
	isEdit,
	canEdit,
	canDelete,
	content,
	onEdit,
	onDelete,
	onSave,
	onCancel,
	isSaving,
	isAutosave,
	showSaveButton = false,
	isTerminalOpen = false,
	onToggleTerminal,
	isCode = false,
	language = "text",
	pasteId,
	contentType,
	paste,
}: ToolbarActionButtonsProps) => {
	const { t } = useTranslation();

	const fileUrl =
		paste?.files?.[0]?.url ||
		paste?.fileUrl ||
		(contentType === "file" && content?.startsWith("http")
			? content
			: undefined);

	const handleDirectFileDownload = () => {
		if (fileUrl) {
			window.open(fileUrl, "_blank");
		}
	};

	return (
		<div className="flex items-center gap-2">
			{!isEdit ? (
				<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5 max-w-[75vw] sm:max-w-none">
					{contentType === "file" ? (
						fileUrl && (
							<Button
								variant="outline"
								size="sm"
								onClick={handleDirectFileDownload}
								className="gap-2 px-3 h-9 w-auto rounded-md text-sm font-medium shrink-0 cursor-pointer"
							>
								<Download className="h-4 w-4" />
								<span>
									{t("common.actions.download") || "Download"}
								</span>
							</Button>
						)
					) : (
						<>
							<CopyButton
								variant="outline"
								content={content}
								className="gap-2 px-3 h-9 w-auto rounded-md text-sm font-medium shrink-0"
							>
								<span>{t("display.actions.copy")}</span>
							</CopyButton>

							{(isCode ||
								language.toLowerCase() === "text" ||
								contentType === "docs") && (
								<SaveAsButton
									content={content}
									language={language}
									pasteId={pasteId}
									isCode={isCode}
									contentType={contentType}
									className="gap-2 h-9 shrink-0"
								/>
							)}
						</>
					)}

					{isCode &&
						SUPPORTED_RUN_LANGUAGES.includes(
							language.toLowerCase(),
						) && (
							<Button
								variant="outline"
								size="sm"
								onClick={onToggleTerminal}
								className="gap-2 h-9 shrink-0 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
							>
								{isTerminalOpen ? (
									<X className="h-4 w-4" />
								) : (
									<Play className="h-4 w-4" />
								)}
								<span className="hidden sm:inline">
									{isTerminalOpen
										? t("display.terminal.close")
										: t("display.terminal.run_code")}
								</span>
							</Button>
						)}
					{canEdit && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => onEdit(true)}
							className="gap-2 h-9 shrink-0"
						>
							<Edit className="h-4 w-4" />
							<span className="hidden sm:inline">
								{t("display.actions.edit")}
							</span>
						</Button>
					)}
					{canDelete && (
						<Button
							id="delete-paste-button"
							variant="outline"
							size="sm"
							onClick={onDelete}
							className="gap-2 h-9 shrink-0 text-destructive hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
							<span className="hidden sm:inline">
								{t("display.actions.delete")}
							</span>
						</Button>
					)}
				</div>
			) : (
				<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5 max-w-[75vw] sm:max-w-none">
					{(!isAutosave || showSaveButton) && (
						<Button
							variant="default"
							size="sm"
							onClick={onSave}
							disabled={isSaving}
							className="gap-2 h-9 font-bold min-w-30"
						>
							{isSaving ? (
								<>
									<Spinner className="h-4 w-4 animate-spin" />
									<span
										style={
											{
												"--highlight-color":
													"var(--foreground)",
												"--base-color":
													"var(--muted-foreground)",
												"--spread": "20px",
												"--duration": "2s",
											} as React.CSSProperties
										}
										className="shimmer font-medium"
									>
										{t("common.states.saving")}
									</span>
								</>
							) : (
								<>
									<Save className="h-4 w-4" />
									<span className="hidden sm:inline">
										{t("display.actions.save")}
									</span>
								</>
							)}
						</Button>
					)}
					<Button
						variant="outline"
						size="sm"
						onClick={onCancel}
						className="gap-2 h-9"
					>
						<X className="h-4 w-4" />
						<span className="hidden sm:inline">
							{t("history.cancel")}
						</span>
					</Button>
					{isCode && (
						<Button
							variant="outline"
							size="sm"
							onClick={onToggleTerminal}
							className="gap-2 h-9 shrink-0 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
						>
							{isTerminalOpen ? (
								<X className="h-4 w-4" />
							) : (
								<Play className="h-4 w-4" />
							)}
							<span className="hidden sm:inline">
								{isTerminalOpen
									? t("display.terminal.close")
									: t("display.terminal.run_code")}
							</span>
						</Button>
					)}
				</div>
			)}
		</div>
	);
};
