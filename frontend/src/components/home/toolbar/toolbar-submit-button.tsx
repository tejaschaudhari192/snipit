import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { MultiStateButton } from "@/components/ui/multi-state-button";
import { ShinyText } from "@/components/ui/shiny-text";
import { ChevronDown, Send } from "lucide-react";
import { cn } from "cn";
import { useTranslation } from "react-i18next";
import type { ContentMode } from "@/types";
import React from "react";

interface ToolbarSubmitButtonProps {
	isSubmitting: boolean;
	isUploading: boolean;
	uploadProgress: number;
	contentType: ContentMode;
	isOptionsOpen: boolean;
	setIsOptionsOpen: (val: boolean) => void;
	handleQuickPaste: () => Promise<boolean | void> | void;
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
	const [isSuccess, setIsSuccess] = React.useState(false);

	const getIdleLabel = () => {
		if (contentType === "file") {
			return t("home.actions.upload");
		}
		if (contentType === "link") {
			return t("home.actions.shorten");
		}
		return t("home.actions.paste");
	};

	const getSuccessLabel = () => {
		if (contentType === "file") {
			return t("home.actions.uploaded");
		}
		if (contentType === "link") {
			return t("home.actions.shortened");
		}
		return t("home.actions.pasted");
	};

	const getLoadingLabel = () => {
		if (isUploading) {
			return (
				<ShinyText className="text-white dark:text-white font-medium">
					{`${t("home.file_upload.uploading")} ${Math.round(uploadProgress)}%`}
				</ShinyText>
			);
		}
		return (
			<ShinyText className="text-white dark:text-white font-medium">
				{t("common.states.submitting")}
			</ShinyText>
		);
	};

	const isLoading = isSubmitting || isUploading;
	const currentStatus = isSuccess
		? "success"
		: isLoading
			? "loading"
			: "idle";

	const handleClick = async () => {
		setIsOptionsOpen(false);
		const result = await handleQuickPaste();
		if (result !== false) {
			setIsSuccess(true);
			setTimeout(() => {
				setIsSuccess(false);
			}, 2500);
		}
	};

	return (
		<ButtonGroup className="shadow-lg shadow-primary/20 overflow-visible shrink-0 h-9">
			<MultiStateButton
				id="quick-paste-button"
				status={currentStatus}
				disabled={isLoading}
				idleLabel={getIdleLabel()}
				loadingLabel={getLoadingLabel()}
				successLabel={getSuccessLabel()}
				idleIcon={
					<Send className="size-3.5 text-primary-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
				}
				className="px-4 h-9 font-bold rounded-l-lg rounded-r-none border-r-0 hover:bg-primary/90 transition-colors min-w-25"
				onClick={handleClick}
			/>
			<div className="w-px bg-primary-foreground/20 self-stretch my-2" />
			<Button
				disabled={isLoading}
				size="icon"
				className={cn(
					"h-9 w-10 shrink-0 rounded-r-lg rounded-l-none border-l-0 hover:bg-primary/90 transition-all",
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
