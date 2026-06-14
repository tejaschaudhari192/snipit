import {
	Download,
	FileText,
	Code as CodeIcon,
	FileDown,
	Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_EXTENSIONS } from "@/constants";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
	exportToCodePdf,
	exportToPreviewPdf,
	downloadFile,
	exportToDocx,
} from "@/lib/export";

interface SaveAsButtonProps {
	content: string;
	language: string;
	pasteId?: string;
	isCode?: boolean;
	contentType?: string;
	className?: string;
}

export const SaveAsButton = ({
	content,
	language,
	pasteId,
	isCode,
	contentType,
	className,
}: SaveAsButtonProps) => {
	const { t } = useTranslation();
	const [isGenerating, setIsGenerating] = useState(false);

	const handleDownload = async (
		format: "lang" | "txt" | "pdf" | "pdf-md" | "docx" | "pdf-rt",
	) => {
		const fileName = pasteId || "snipit";

		try {
			if (format === "pdf") {
				setIsGenerating(true);
				await exportToCodePdf(content, fileName);
			} else if (format === "pdf-md") {
				exportToPreviewPdf("markdown-preview-container", fileName);
			} else if (format === "pdf-rt") {
				exportToPreviewPdf("tiptap-editor-container", fileName);
			} else if (format === "docx") {
				exportToDocx(content, fileName);
			} else if (format === "lang") {
				const ext =
					LANGUAGE_EXTENSIONS[language.toLowerCase()] || "txt";
				downloadFile(content, fileName, ext);
			} else if (format === "txt") {
				downloadFile(content, fileName, "txt");
			}
		} catch (error) {
			console.error("Export failed:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={className}
					disabled={isGenerating}
				>
					{isGenerating ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Download className="h-4 w-4" />
					)}
					<span className="hidden sm:inline ml-2">
						{t("common.save_as")}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-48">
				{contentType === "richtext" ? (
					<>
						<DropdownMenuItem
							onClick={() => handleDownload("docx")}
							className="gap-2 cursor-pointer"
						>
							<FileText className="h-4 w-4" />
							<span>.docx</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDownload("pdf-rt")}
							className="gap-2 cursor-pointer"
						>
							<FileDown className="h-4 w-4 text-primary" />
							<span>.pdf (Formatted)</span>
						</DropdownMenuItem>
					</>
				) : (
					<>
						{isCode && (
							<DropdownMenuItem
								onClick={() => handleDownload("lang")}
								className="gap-2 cursor-pointer"
							>
								<CodeIcon className="h-4 w-4" />
								<span>
									.
									{LANGUAGE_EXTENSIONS[
										language.toLowerCase()
									] || "code"}
								</span>
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							onClick={() => handleDownload("txt")}
							className="gap-2 cursor-pointer"
						>
							<FileText className="h-4 w-4" />
							<span>.txt</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						{language.toLowerCase() === "markdown" ? (
							<>
								<DropdownMenuItem
									onClick={() => handleDownload("pdf")}
									className="gap-2 cursor-pointer"
								>
									<FileDown className="h-4 w-4" />
									<span>.pdf (Code)</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => handleDownload("pdf-md")}
									className="gap-2 cursor-pointer"
								>
									<FileDown className="h-4 w-4 text-primary" />
									<span>.pdf (Preview)</span>
								</DropdownMenuItem>
							</>
						) : (
							<DropdownMenuItem
								onClick={() => handleDownload("pdf")}
								className="gap-2 cursor-pointer"
							>
								<FileDown className="h-4 w-4" />
								<span>.pdf</span>
							</DropdownMenuItem>
						)}
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
