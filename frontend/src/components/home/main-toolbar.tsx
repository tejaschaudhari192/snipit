import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { ContentTypeSelector } from "@/components/common/content-type-selector";

import { ExpirySelector } from "@/components/common/expiry-selector";
import { useTranslation } from "react-i18next";

import { ButtonGroup } from "@/components/ui/button-group";
import { ChevronDown, Users } from "lucide-react";
import { cn } from "@/utils";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useState } from "react";
import { AdvancedOptions } from "./advanced-options";
import { SUPPORTED_RUN_LANGUAGES } from "@/constants";

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

		const renderButtonText = () => {
			if (isSubmitting) {
				if (
					contentType === "file" &&
					isUploading &&
					uploadProgress < 100
				) {
					return t("home.file_uploading", "Uploading...");
				}
				return t("common.submitting", "Submitting...");
			}

			if (contentType === "link") {
				return t("home.shorten_button", "Shorten");
			}

			if (contentType === "file") {
				return t("home.upload_button", "Upload");
			}

			return t("home.paste_button");
		};

		return (
			<div className="flex flex-col p-1 rounded-xl bg-background/50 backdrop-blur-3xl border border-border/50 shadow-sm relative z-10 overflow-visible">
				<div className="flex flex-col lg:flex-row gap-1 items-stretch lg:items-center justify-between">
					{!hideTypeSelector && (
						<ContentTypeSelector
							value={contentType}
							onValueChange={setContentType}
							className="w-full lg:w-auto"
						/>
					)}
					{hideTypeSelector && <div className="w-0 lg:w-auto" />}

					{children && (
						<div className="flex-1 flex items-center justify-center min-w-0 px-2 overflow-hidden">
							<div className="flex items-center justify-start gap-2 overflow-x-auto no-scrollbar py-1 lg:py-0">
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
													? t(
															"display.terminal.close",
														)
													: t(
															"display.terminal.run_code",
														)}
											</span>
										</Button>
									)}
							</div>
						</div>
					)}
					{!children && <div />}

					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
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

								<ButtonGroup className="shadow-lg shadow-primary/20 overflow-visible shrink-0 h-9">
									<Button
										disabled={isSubmitting}
										size="lg"
										className="px-4 h-9 font-bold rounded-r-none border-r-0 hover:bg-primary/90 transition-colors min-w-[100px]"
										onClick={handleQuickPaste}
									>
										{renderButtonText()}
									</Button>
									<div className="w-[1px] bg-primary-foreground/20 self-stretch my-2" />
									<Button
										disabled={isSubmitting}
										size="icon"
										className={cn(
											"h-9 w-10 shrink-0 rounded-l-none border-l-0 hover:bg-primary/90 transition-all",
											isOptionsOpen && "bg-primary/80",
										)}
										onClick={() =>
											setIsOptionsOpen(!isOptionsOpen)
										}
									>
										<ChevronDown
											className={cn(
												"h-4 w-4 transition-transform duration-300",
												isOptionsOpen && "rotate-180",
											)}
										/>
									</Button>
								</ButtonGroup>
							</div>
						)}
					</div>
				</div>

				<Collapsible
					open={isOptionsOpen}
					onOpenChange={setIsOptionsOpen}
					className="mt-1"
				>
					<CollapsibleContent>
						<div className="border-t border-border/10 pt-2 mt-1.5 px-1.5 sm:px-2">
							<div className="flex items-center gap-2 mb-3 px-1 py-1 group">
								<div className="w-1.5 h-5 bg-primary/30 group-hover:bg-primary transition-colors rounded-full" />
								<h3 className="font-bold text-sm text-primary/70 group-hover:text-primary transition-colors">
									{t(
										"home.advanced_config",
										"Advanced Configuration",
									)}
								</h3>
								<div className="flex-1 h-[1px] bg-border/5 ml-2" />
								<Button
									variant="outline"
									size="sm"
									onClick={handleCollaborative}
									className="gap-2 h-8 text-xs font-bold bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all shadow-sm rounded-md ml-2"
								>
									<Users className="h-3.5 w-3.5" />
									{t(
										"home.collaborative_session_btn",
										"Start Collaboration",
									)}
								</Button>
							</div>

							<div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
								<AdvancedOptions
									onSubmit={handleDialogSubmit}
								/>
							</div>

							{dialogError && (
								<div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-start gap-3 shadow-sm shadow-red-500/5">
									<div className="mt-0.5 shrink-0 bg-red-500/20 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
										⚠️
									</div>
									<p className="font-medium leading-relaxed italic">
										{dialogError}
									</p>
								</div>
							)}
						</div>
					</CollapsibleContent>
				</Collapsible>
			</div>
		);
	},
);
