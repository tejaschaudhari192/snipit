import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { ContentTypeSelector } from "@/components/common/content-type-selector";

import { ExpirySelector } from "@/components/common/expiry-selector";
import { useTranslation } from "react-i18next";

import { cn } from "@/utils";
import { useState, useEffect } from "react";
import { SUPPORTED_RUN_LANGUAGES } from "@/constants";
import { useToolbarWrap } from "@/hooks/use-toolbar-wrap";
import { ToolbarSubmitButton } from "./toolbar/toolbar-submit-button";
import { ToolbarAdvancedOptionsPanel } from "./toolbar/toolbar-advanced-options-panel";

import type { ContentMode } from "@/types";

interface MainToolbarProps {
	contentType: ContentMode;
	setContentType: (val: ContentMode) => void;
	expiresTime: string;
	setExpiresTime: (val: string) => void;
	setIsCustomExpiryDialogOpen: (val: boolean) => void;
	isSubmitting?: boolean;
	isUploading?: boolean;
	uploadProgress?: number;
	handleQuickPaste: () => void;
	handleCollaborative: () => void;
	handleDialogSubmit: () => void;
	hideTypeSelector?: boolean;
	dialogError?: string;
	shortenedResult?: { id: string } | null;
	isTerminalOpen?: boolean;
	onToggleTerminal?: () => void;
	isCode?: boolean;
	language?: string;
	children?: React.ReactNode;
}

export const MainToolbar = memo(
	({
		contentType,
		setContentType,
		expiresTime,
		setExpiresTime,
		setIsCustomExpiryDialogOpen,
		isSubmitting = false,
		isUploading = false,
		uploadProgress = 0,
		handleQuickPaste,
		handleCollaborative,
		hideTypeSelector = false,
		handleDialogSubmit,
		dialogError = "",
		shortenedResult = null,
		isTerminalOpen = false,
		onToggleTerminal,
		isCode = false,
		language = "text",
		children,
	}: MainToolbarProps) => {
		const { t } = useTranslation();
		const [isOptionsOpen, setIsOptionsOpen] = useState(false);

		// Dynamic Overflow Detection
		const { needsSecondRow, containerRef, leftRef, middleRef, rightRef } =
			useToolbarWrap([children, contentType, language, isTerminalOpen]);

		useEffect(() => {
			if (isSubmitting) {
				setIsOptionsOpen(false);
			}
		}, [isSubmitting]);

		return (
			<div className="flex flex-col p-1 rounded-xl bg-background/50 backdrop-blur-3xl border border-border/50 shadow-sm relative z-10 overflow-visible">
				<div
					ref={containerRef}
					className="flex flex-row flex-wrap items-center justify-between gap-y-2 w-full"
				>
					{/* Left: Type Selector */}
					<div ref={leftRef} className="order-1 w-full sm:w-auto max-w-full overflow-x-auto no-scrollbar">
						{!hideTypeSelector && (
							<ContentTypeSelector
								value={contentType}
								onValueChange={setContentType}
								className="w-full sm:w-auto"
							/>
						)}
						{hideTypeSelector && (
							<div className="hidden sm:block" />
						)}
					</div>

					{/* Middle / Bottom: Contextual Options */}
					{children && (
						<div
							ref={middleRef}
							className={cn(
								"flex items-center justify-start gap-2 overflow-x-auto no-scrollbar px-2 py-1 xl:py-0 transition-all",
								needsSecondRow
									? "order-3 w-full"
									: "order-2 flex-1 justify-center",
							)}
						>
							{children}
							{isCode &&
								onToggleTerminal &&
								SUPPORTED_RUN_LANGUAGES.includes(
									language.toLowerCase(),
								) && (
									<Button
										variant="outline"
										size="sm"
										onClick={onToggleTerminal}
										className="gap-2 h-9 shrink-0 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
									>
										{isTerminalOpen ? (
											<X className="h-4 w-4" />
										) : (
											<Play className="h-4 w-4" />
										)}
										<span className="hidden sm:inline">
											{isTerminalOpen
												? t("display.terminal.close")
												: t(
														"display.terminal.run_code",
													)}
										</span>
									</Button>
								)}
						</div>
					)}
					{!children && (
						<div
							className={cn(
								"hidden flex-1",
								needsSecondRow ? "order-3" : "order-2",
							)}
						/>
					)}

					{/* Right: Expiry and Paste */}
					<div
						ref={rightRef}
						className={cn(
							"flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-auto",
							needsSecondRow ? "order-2" : "order-3",
						)}
					>
						{!(contentType === "link" && !!shortenedResult) && (
							<div className="flex items-center gap-2 flex-1 sm:flex-none">
								<ExpirySelector
									expiresTime={expiresTime}
									setExpiresTime={setExpiresTime}
									setIsCustomExpiryDialogOpen={
										setIsCustomExpiryDialogOpen
									}
									className="w-full sm:w-fit"
								/>

								<ToolbarSubmitButton
									isSubmitting={isSubmitting}
									isUploading={isUploading}
									uploadProgress={uploadProgress}
									contentType={contentType}
									shortenedResult={shortenedResult}
									isOptionsOpen={isOptionsOpen}
									setIsOptionsOpen={setIsOptionsOpen}
									handleQuickPaste={handleQuickPaste}
								/>
							</div>
						)}
					</div>
				</div>

				<ToolbarAdvancedOptionsPanel
					isOptionsOpen={isOptionsOpen}
					setIsOptionsOpen={setIsOptionsOpen}
					handleCollaborative={handleCollaborative}
					handleDialogSubmit={handleDialogSubmit}
					dialogError={dialogError}
				/>
			</div>
		);
	},
);
