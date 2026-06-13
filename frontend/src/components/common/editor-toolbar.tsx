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
import { type editor } from "monaco-editor";

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
	editor: editor.IStandaloneCodeEditor | null;
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
	editor,
}: EditorToolbarProps) => {
	const { t } = useTranslation();

	if (
		contentType !== "code" &&
		contentType !== "text" &&
		contentType !== "draw" &&
		contentType !== "richtext"
	) {
		return null;
	}

	return (
		<TooltipProvider>
			<div
				className={cn(
					"flex items-center gap-2 z-101",
					contentType === "draw"
						? isFullscreen || isWindowFullscreen
							? "fixed top-4 right-4"
							: "absolute right-3 top-3"
						: isFullscreen || isWindowFullscreen
							? "fixed top-4 right-4 sm:top-8 sm:right-8"
							: "absolute top-4 right-4 sm:top-8 sm:right-8",
				)}
			>
				{["code", "text"].includes(contentType) && (
					<TtsButton
						content={content}
						contentType={contentType}
						editor={editor}
					/>
				)}

				{showMarkdownToggles &&
					(language === "markdown" || language === "html") && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<MarkdownLayoutToggles
										mode={mdLayoutMode}
										onModeChange={onMdLayoutModeChange}
									/>
								</div>
							</TooltipTrigger>
							<TooltipContent side="left">
								<p>{t("common.layout")}</p>
							</TooltipContent>
						</Tooltip>
					)}

				<Tooltip>
					<TooltipTrigger asChild>
						<div>
							<ZenModeToggle
								isFullscreen={isFullscreen}
								isWindowFullscreen={isWindowFullscreen}
								onToggle={onToggleFullscreen}
								onWindowToggle={onToggleWindowFullscreen}
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent side="left">
						<p>
							{isFullscreen
								? t("common.exit_zen")
								: t("common.enter_zen")}
						</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
};
