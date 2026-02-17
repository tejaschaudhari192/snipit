import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Code2, Link, FileUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface ContentTypeSelectorProps {
	value: "text" | "code" | "link" | "file";
	onValueChange: (value: "text" | "code" | "link" | "file") => void;
	className?: string;
	listClassName?: string;
	showFileOption?: boolean;
}

export const ContentTypeSelector = ({
	value,
	onValueChange,
	className,
	listClassName,
	showFileOption = true,
}: ContentTypeSelectorProps) => {
	const { t } = useTranslation();

	return (
		<Tabs
			value={value}
			onValueChange={(val) =>
				onValueChange(val as "text" | "code" | "link" | "file")
			}
			className={cn("w-full", className)}
		>
			<TabsList className={cn("h-11 w-full flex", listClassName)}>
				<TabsTrigger
					value="text"
					className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
				>
					<FileText className="h-4 w-4 shrink-0" />
					<span className="whitespace-nowrap">
						{t("home.tab_text")}
					</span>
				</TabsTrigger>
				<TabsTrigger
					value="code"
					className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
				>
					<Code2 className="h-4 w-4 shrink-0" />
					<span className="whitespace-nowrap">
						{t("home.tab_code")}
					</span>
				</TabsTrigger>
				{showFileOption && (
					<TabsTrigger
						value="file"
						className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
					>
						<FileUp className="h-4 w-4 shrink-0" />
						<span className="whitespace-nowrap">
							{t("home.tab_file", "File")}
						</span>
					</TabsTrigger>
				)}
				<TabsTrigger
					value="link"
					className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
				>
					<Link className="h-4 w-4 shrink-0" />
					<span className="whitespace-nowrap">
						{t("home.tab_link")}
					</span>
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
};
