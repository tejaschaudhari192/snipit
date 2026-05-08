import { Download, FileText, Code as CodeIcon, FileDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_EXTENSIONS } from "@/constants";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SaveAsButtonProps {
	content: string;
	language: string;
	pasteId?: string;
	isCode?: boolean;
	className?: string;
}

export const SaveAsButton = ({
	content,
	language,
	pasteId,
	isCode,
	className,
}: SaveAsButtonProps) => {
	const { t } = useTranslation();

	const handleDownload = async (format: "lang" | "txt" | "pdf") => {
		const fileName = pasteId || "snipit";

		if (format === "pdf") {
			const { jsPDF } = await import("jspdf");
			const doc = new jsPDF();
			doc.setFont("courier");
			doc.setFontSize(10);
			const lines = doc.splitTextToSize(content, 180);

			const margin = 10;
			const lineHeight = 5;
			const pageHeight = doc.internal.pageSize.getHeight();
			let cursorY = margin;

			lines.forEach((line: string) => {
				if (cursorY + lineHeight > pageHeight - margin) {
					doc.addPage();
					cursorY = margin;
				}
				doc.text(line, margin, cursorY);
				cursorY += lineHeight;
			});

			doc.save(`${fileName}.pdf`);
			return;
		}

		const ext =
			format === "txt"
				? "txt"
				: LANGUAGE_EXTENSIONS[language.toLowerCase()] || "txt";
		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${fileName}.${ext}`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className={className}>
					<Download className="h-4 w-4" />
					<span className="hidden sm:inline">
						{t("common.save_as")}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-48">
				{isCode && (
					<DropdownMenuItem
						onClick={() => handleDownload("lang")}
						className="gap-2"
					>
						<CodeIcon className="h-4 w-4" />
						<span>
							.
							{LANGUAGE_EXTENSIONS[language.toLowerCase()] ||
								"code"}
						</span>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem
					onClick={() => handleDownload("txt")}
					className="gap-2"
				>
					<FileText className="h-4 w-4" />
					<span>.txt</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => handleDownload("pdf")}
					className="gap-2"
				>
					<FileDown className="h-4 w-4" />
					<span>.pdf</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
