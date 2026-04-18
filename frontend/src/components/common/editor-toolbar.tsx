import { cn } from "@/lib/utils";
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

interface EditorToolbarProps {
	contentType: ContentMode;
	language: string;
	isFullscreen: boolean;
	isWindowFullscreen: boolean;
	onToggleFullscreen: () => void;
	onToggleWindowFullscreen: () => void;
	mdLayoutMode: "split" | "preview" | "editor";
	onMdLayoutModeChange: (mode: "split" | "preview" | "editor") => void;
	showMarkdownToggles?: boolean;
}

export const EditorToolbar = ({
	contentType,
	language,
	isFullscreen,
	isWindowFullscreen,
	onToggleFullscreen,
	onToggleWindowFullscreen,
	mdLayoutMode,
	onMdLayoutModeChange,
	showMarkdownToggles = true,
}: EditorToolbarProps) => {
	const { t } = useTranslation();

	if (
		contentType !== "code" &&
		contentType !== "text" &&
		contentType !== "draw"
	) {
		return null;
	}

	return (
		<TooltipProvider>
			<div
				className={cn(
					"flex items-center gap-2 z-[101]",
					contentType === "draw"
						? isFullscreen || isWindowFullscreen
							? "fixed top-4 right-4"
							: "absolute right-3 top-3"
						: isFullscreen || isWindowFullscreen
							? "fixed top-4 right-4 sm:top-8 sm:right-8"
							: "absolute top-4 right-4 sm:top-8 sm:right-8",
				)}
			>
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
								<p>{t("common.layout", "Layout Mode")}</p>
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
								? t("common.exit_zen", "Exit Zen Mode")
								: t("common.enter_zen", "Enter Zen Mode")}
						</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
};
