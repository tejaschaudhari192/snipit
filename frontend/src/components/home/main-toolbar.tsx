import { Button } from "@/components/ui/button";
import { ContentTypeSelector } from "@/components/common/content-type-selector";

import { ExpirySelector } from "@/components/common/expiry-selector";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

import { ButtonGroup } from "@/components/ui/button-group";
import { Settings2, ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { ContentMode } from "@/types";

interface MainToolbarProps {
	contentType: ContentMode;
	setContentType: (val: ContentMode) => void;
	expiresTime: string;
	setExpiresTime: (val: string) => void;
	setIsCustomExpiryDialogOpen: (val: boolean) => void;
	handleCreationClick: () => void;
	handleCollaborative: () => void;
	isSubmitting?: boolean;
	isUploading?: boolean;
	uploadProgress?: number;
	handleQuickPaste: () => void;
}

export const MainToolbar = ({
	contentType,
	setContentType,
	expiresTime,
	setExpiresTime,
	setIsCustomExpiryDialogOpen,
	handleCreationClick,
	handleCollaborative,
	isSubmitting = false,
	isUploading = false,
	uploadProgress = 0,
	handleQuickPaste,
}: MainToolbarProps) => {
	const { t } = useTranslation();

	const renderButtonText = () => {
		if (isSubmitting) {
			if (contentType === "file" && isUploading && uploadProgress < 100) {
				return t("home.file_uploading", "Uploading...");
			}
			return t("common.submitting", "Submitting...");
		}
		return t("home.paste_button");
	};

	return (
		<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 rounded-2xl bg-background/40 backdrop-blur-xl border border-border/50 shadow-sm relative z-10">
			<ContentTypeSelector
				value={contentType}
				onValueChange={setContentType}
				className="w-full sm:w-auto"
			/>

			<div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
				<div
					className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 border shadow-sm ${"bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"}`}
				>
					<span className="text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5">
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
						</span>
						{t("home.collaborative_session", "Collaborative")}
					</span>

					<Switch
						checked={false}
						onCheckedChange={handleCollaborative}
						disabled={isSubmitting}
						className="data-[state=checked]:bg-blue-500"
					/>
				</div>

				<ExpirySelector
					expiresTime={expiresTime}
					setExpiresTime={setExpiresTime}
					setIsCustomExpiryDialogOpen={setIsCustomExpiryDialogOpen}
					className="flex-1 min-w-0" // Allow it to shrink if needed
				/>

				<ButtonGroup className="shadow-lg shadow-primary/20 overflow-hidden shrink-0">
					<Button
						disabled={isSubmitting}
						size="lg"
						className="px-4 sm:px-6 h-11 font-bold rounded-r-none border-r-0 hover:bg-primary/90 transition-colors min-w-[90px] sm:min-w-[120px]"
						onClick={handleQuickPaste}
					>
						{renderButtonText()}
					</Button>
					<div className="w-[1px] bg-primary-foreground/20 self-stretch my-2" />
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								disabled={isSubmitting}
								size="icon"
								className="h-11 w-10 rounded-l-none border-l-0 hover:bg-primary/90 transition-colors"
							>
								<ChevronDown className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuItem
								onClick={handleCreationClick}
								className="flex items-center gap-2 cursor-pointer"
							>
								<Settings2 className="h-4 w-4 text-muted-foreground" />
								<div className="flex flex-col">
									<span className="font-medium">
										{t(
											"home.paste_advanced",
											"Advanced Creation",
										)}
									</span>
									<span className="text-[10px] text-muted-foreground">
										{t(
											"home.paste_advanced_desc",
											"Configure privacy, password, and more",
										)}
									</span>
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</ButtonGroup>
			</div>
		</div>
	);
};
