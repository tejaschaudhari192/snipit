import { cn } from "@/utils";
import { MarkdownLayoutToggles } from "@/components/common/markdown-layout-toggles";
import { ZenModeToggle } from "@/components/common/zen-mode-toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import type { ContentMode } from "@/types";
import { TtsButton } from "@/components/editor/tts-button";
import { EditorEngineToggle } from "@/components/common/editor-engine-toggle";
import type { EditorEngine } from "@/hooks/use-editor-engine";

interface EditorToolbarProps {
	contentType: ContentMode;
	content: string;
	language: string;
	isFullscreen: boolean;
	isWindowFullscreen: boolean;
	onToggleFullscreen: () => void;
	onToggleWindowFullscreen: () => void;
	mdLayoutMode: "split" | "preview" | "editor";
	onMdLayoutModeChange: (mode: "split" | "preview" | "editor") => void;
	showMarkdownToggles?: boolean;
	editorEngine?: EditorEngine;
	onToggleEditorEngine?: () => void;
}

export const EditorToolbar = ({
	contentType,
	content,
	language,
	isFullscreen,
	isWindowFullscreen,
	onToggleFullscreen,
	onToggleWindowFullscreen,
	mdLayoutMode,
	onMdLayoutModeChange,
	showMarkdownToggles = true,
	editorEngine = "monaco",
	onToggleEditorEngine,
}: EditorToolbarProps) => {
	const { t } = useTranslation();

	if (
		contentType !== "code" &&
		contentType !== "text" &&
		contentType !== "draw" &&
		contentType !== "docs"
	) {
		return null;
	}

	return (
		<TooltipProvider>
			<div
				className={cn(
					"flex items-center gap-2 z-40",
					contentType === "draw"
						? isFullscreen || isWindowFullscreen
							? "fixed top-4 right-4"
							: "absolute right-3 top-3"
						: isFullscreen || isWindowFullscreen
							? "fixed top-4 right-4 sm:top-8 sm:right-8"
							: "absolute top-4 right-4 sm:top-8 sm:right-8",
				)}
			>
				{["code", "text", "docs"].includes(contentType) && (
					<TtsButton content={content} contentType={contentType} />
				)}

				{onToggleEditorEngine &&
					(contentType === "code" || contentType === "text") && (
						<EditorEngineToggle
							engine={editorEngine}
							onToggle={onToggleEditorEngine}
						/>
					)}

				{showMarkdownToggles &&
					(language === "markdown" || language === "html") && (
						<Tooltip>
							<TooltipTrigger
								render={
									<div>
										<MarkdownLayoutToggles
											mode={mdLayoutMode}
											onModeChange={onMdLayoutModeChange}
										/>
									</div>
								}
							/>
							<TooltipContent side="left">
								<p>{t("common.layout")}</p>
							</TooltipContent>
						</Tooltip>
					)}

				<Tooltip>
					<TooltipTrigger
						render={
							<div>
								<ZenModeToggle
									isFullscreen={isFullscreen}
									isWindowFullscreen={isWindowFullscreen}
									onToggle={onToggleFullscreen}
									onWindowToggle={onToggleWindowFullscreen}
								/>
							</div>
						}
					/>
					<TooltipContent side="left">
						<p>
							{isFullscreen
								? t("common.actions.shrink_editor")
								: t("common.actions.expand_editor")}
						</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
};
