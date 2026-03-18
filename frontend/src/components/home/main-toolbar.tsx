import { Button } from "@/components/ui/button";
import { ContentTypeSelector } from "@/components/common/content-type-selector";

import { ExpirySelector } from "@/components/common/expiry-selector";
import { useTranslation } from "react-i18next";

import { ButtonGroup } from "@/components/ui/button-group";
import { Settings2, ChevronDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainToolbarProps {
	contentType: "text" | "code" | "link" | "file";
	setContentType: (val: "text" | "code" | "link" | "file") => void;
	expiresTime: string;
	setExpiresTime: (val: string) => void;
	setIsCustomExpiryDialogOpen: (val: boolean) => void;
	handleCreationClick: () => void;
	handleQuickPaste: () => void;
	isSubmitting?: boolean;
	isUploading?: boolean;
	uploadProgress?: number;
}

export const MainToolbar = ({
	contentType,
	setContentType,
	expiresTime,
	setExpiresTime,
	setIsCustomExpiryDialogOpen,
	handleCreationClick,
	handleQuickPaste,
	isSubmitting = false,
	isUploading = false,
	uploadProgress = 0,
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

			<div className="flex items-center gap-2 justify-between sm:justify-end">
				<ExpirySelector
					expiresTime={expiresTime}
					setExpiresTime={setExpiresTime}
					setIsCustomExpiryDialogOpen={setIsCustomExpiryDialogOpen}
				/>

				<ButtonGroup className="shadow-lg shadow-primary/20 overflow-hidden">
					<Button
						disabled={isSubmitting}
						size="lg"
						className="px-6 h-11 font-bold rounded-r-none border-r-0 hover:bg-primary/90 transition-colors min-w-[120px]"
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
