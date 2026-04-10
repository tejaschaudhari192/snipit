import { Eye, EyeOff, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export type MarkdownLayoutMode = "split" | "editor" | "preview";

interface MarkdownLayoutTogglesProps {
	mode: MarkdownLayoutMode;
	onModeChange: (mode: MarkdownLayoutMode) => void;
	className?: string;
}

export const MarkdownLayoutToggles = ({
	mode,
	onModeChange,
	className,
}: MarkdownLayoutTogglesProps) => {
	const { t } = useTranslation();

	return (
		<div
			className={cn(
				"flex bg-black/80 backdrop-blur-md rounded-full border border-white/10 p-0.5 shadow-2xl overflow-hidden",
				className,
			)}
		>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onModeChange("editor")}
				className={cn(
					"h-8 w-8 rounded-full transition-all duration-300",
					mode === "editor"
						? "bg-primary text-primary-foreground shadow-lg"
						: "text-white/60 hover:text-white hover:bg-white/10",
				)}
				title={t("common.editor_only", "Editor Only")}
			>
				<EyeOff className="h-3.5 w-3.5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onModeChange("split")}
				className={cn(
					"h-8 w-8 rounded-full transition-all duration-300",
					mode === "split"
						? "bg-primary text-primary-foreground shadow-lg"
						: "text-white/60 hover:text-white hover:bg-white/10",
				)}
				title={t("common.split_view", "Split View")}
			>
				<Layout className="h-3.5 w-3.5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onModeChange("preview")}
				className={cn(
					"h-8 w-8 rounded-full transition-all duration-300",
					mode === "preview"
						? "bg-primary text-primary-foreground shadow-lg"
						: "text-white/60 hover:text-white hover:bg-white/10",
				)}
				title={t("common.preview_only", "Preview Only")}
			>
				<Eye className="h-3.5 w-3.5" />
			</Button>
		</div>
	);
};
