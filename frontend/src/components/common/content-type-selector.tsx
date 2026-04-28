import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Code2, Link, FileUp, Paintbrush } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import type { ContentMode } from "@/types";
import { memo } from "react";

interface ContentTypeSelectorProps {
	value: ContentMode;
	onValueChange: (value: ContentMode) => void;
	className?: string;
	listClassName?: string;
	showFileOption?: boolean;
}

export const ContentTypeSelector = memo(
	({
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
				onValueChange={(val) => onValueChange(val as ContentMode)}
				className={cn("w-full", className)}
			>
				<TabsList className={cn("h-11 w-full flex", listClassName)}>
					<TabsTrigger
						value="text"
						className="flex-1 flex items-center justify-center gap-2 px-2 sm:px-3 text-sm font-semibold"
					>
						<FileText className="h-4 w-4 shrink-0" />
						<span className="hidden min-[440px]:inline whitespace-nowrap">
							{t("home.tab_text")}
						</span>
						<span className="inline min-[440px]:hidden whitespace-nowrap">
							{t("home.tab_text_short", "Text")}
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="code"
						className="flex-1 flex items-center justify-center gap-2 px-2 sm:px-3 text-sm font-semibold"
					>
						<Code2 className="h-4 w-4 shrink-0" />
						<span className="hidden min-[440px]:inline whitespace-nowrap">
							{t("home.tab_code")}
						</span>
						<span className="inline min-[440px]:hidden whitespace-nowrap">
							{t("home.tab_code_short", "Code")}
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="draw"
						className="flex-1 flex items-center justify-center gap-2 px-2 sm:px-3 text-sm font-semibold"
					>
						<Paintbrush className="h-4 w-4 shrink-0" />
						<span className="hidden min-[440px]:inline whitespace-nowrap">
							{t("home.tab_draw", "Draw")}
						</span>
						<span className="inline min-[440px]:hidden whitespace-nowrap">
							{t("home.tab_draw_short", "Draw")}
						</span>
					</TabsTrigger>
					<TabsTrigger
						value="link"
						className="flex-1 flex items-center justify-center gap-2 px-2 sm:px-3 text-sm font-semibold"
					>
						<Link className="h-4 w-4 shrink-0" />
						<span className="hidden min-[440px]:inline whitespace-nowrap">
							{t("home.tab_link")}
						</span>
						<span className="inline min-[440px]:hidden whitespace-nowrap">
							{t("home.tab_link_short", "Link")}
						</span>
					</TabsTrigger>
					{showFileOption && (
						<TabsTrigger
							value="file"
							className="flex-1 flex items-center justify-center gap-2 px-2 sm:px-3 text-sm font-semibold"
						>
							<FileUp className="h-4 w-4 shrink-0" />
							<span className="hidden min-[440px]:inline whitespace-nowrap">
								{t("home.tab_file")}
							</span>
							<span className="inline min-[440px]:hidden whitespace-nowrap">
								{t("home.tab_file_short", "File")}
							</span>
						</TabsTrigger>
					)}
				</TabsList>
			</Tabs>
		);
	},
);
