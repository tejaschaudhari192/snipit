import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import type { ContentMode } from "@/types";

interface ToolbarSubmitButtonProps {
	isSubmitting: boolean;
	isUploading: boolean;
	uploadProgress: number;
	contentType: ContentMode;
	isOptionsOpen: boolean;
	setIsOptionsOpen: (val: boolean) => void;
	handleQuickPaste: () => void;
}

export function ToolbarSubmitButton({
	isSubmitting,
	isUploading,
	uploadProgress,
	contentType,
	isOptionsOpen,
	setIsOptionsOpen,
	handleQuickPaste,
}: ToolbarSubmitButtonProps) {
	const { t } = useTranslation();

	const renderButtonText = () => {
		if (isSubmitting || isUploading) {
			return (
				<div className="flex items-center gap-2">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
					<span
						style={
							{
								"--highlight-color": "var(--foreground)",
								"--base-color": "var(--muted-foreground)",
								"--spread": "20px",
								"--duration": "2s",
							} as React.CSSProperties
						}
						className="shimmer font-medium"
					>
						{isUploading
							? `${t("home.file_upload.uploading")} ${Math.round(uploadProgress)}%`
							: t("common.states.submitting")}
					</span>
				</div>
			);
		}

		if (contentType === "file") {
			return t("home.actions.upload");
		}
		if (contentType === "link") {
			return t("home.actions.shorten");
		}
		return t("home.actions.paste");
	};

	return (
		<ButtonGroup className="shadow-lg shadow-primary/20 overflow-visible shrink-0 h-9">
			<Button
				disabled={isSubmitting}
				size="lg"
				className="px-4 h-9 font-bold rounded-r-none border-r-0 hover:bg-primary/90 transition-colors min-w-25"
				onClick={() => {
					setIsOptionsOpen(false);
					handleQuickPaste();
				}}
			>
				{renderButtonText()}
			</Button>
			<div className="w-px bg-primary-foreground/20 self-stretch my-2" />
			<Button
				disabled={isSubmitting}
				size="icon"
				className={cn(
					"h-9 w-10 shrink-0 rounded-l-none border-l-0 hover:bg-primary/90 transition-all",
					isOptionsOpen && "bg-primary/80",
				)}
				onClick={() => setIsOptionsOpen(!isOptionsOpen)}
			>
				<ChevronDown
					className={cn(
						"h-4 w-4 transition-transform duration-300",
						isOptionsOpen && "rotate-180",
					)}
				/>
			</Button>
		</ButtonGroup>
	);
}
