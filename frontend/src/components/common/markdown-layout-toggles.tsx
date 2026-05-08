import { Eye, EyeOff, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
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

	const MODES = [
		{
			id: "editor" as const,
			icon: EyeOff,
			title: t("common.editor_only"),
		},
		{
			id: "split" as const,
			icon: Layout,
			title: t("common.split_view"),
		},
		{
			id: "preview" as const,
			icon: Eye,
			title: t("common.preview_only"),
		},
	];

	return (
		<div
			className={cn(
				"flex bg-black/80 backdrop-blur-md rounded-full border border-white/10 p-0.5 shadow-2xl overflow-hidden",
				className,
			)}
		>
			{MODES.map(({ id, icon: Icon, title }) => (
				<Button
					key={id}
					variant="ghost"
					size="icon"
					onClick={() => onModeChange(id)}
					className={cn(
						"h-8 w-8 rounded-full transition-all duration-300",
						mode === id
							? "bg-primary text-primary-foreground shadow-lg"
							: "text-white/60 hover:text-white hover:bg-white/10",
					)}
					title={title}
				>
					<Icon className="h-3.5 w-3.5" />
				</Button>
			))}
		</div>
	);
};
