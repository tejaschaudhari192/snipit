import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Code2, Link, FileUp, Paintbrush, Film } from "lucide-react";
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

		const tabsConfig = [
			{ id: "text", icon: FileText, fullKey: "home.tabs.text.full", shortKey: "home.tabs.text.short" },
			{ id: "docs", icon: FileText, fullKey: "home.tabs.docs.full", shortKey: "home.tabs.docs.short" },
			{ id: "code", icon: Code2, fullKey: "home.tabs.code.full", shortKey: "home.tabs.code.short" },
			{ id: "draw", icon: Paintbrush, fullKey: "home.tabs.draw.full", shortKey: "home.tabs.draw.short", className: "relative overflow-visible" },
			{ id: "link", icon: Link, fullKey: "home.tabs.link.full", shortKey: "home.tabs.link.short" },
			{ id: "file", icon: FileUp, fullKey: "home.tabs.file.full", shortKey: "home.tabs.file.short", requiresFileOption: true },
			{ id: "video", icon: Film, fullKey: "home.tabs.video.full", shortKey: "home.tabs.video.short", className: "relative overflow-visible", badge: "Beta" },
		];

		return (
			<Tabs
				value={value}
				onValueChange={(val) => onValueChange(val as ContentMode)}
				className={cn("w-full", className)}
			>
				<TabsList className={cn("h-11 w-full flex", listClassName)}>
					{tabsConfig.map((tab) => {
						if (tab.requiresFileOption && !showFileOption) return null;

						const Icon = tab.icon;

						return (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								className={cn("tab-trigger-base", tab.className)}
							>
								<Icon className="h-4 w-4 shrink-0" />
								<span className="tab-text-full">
									{t(tab.fullKey)}
								</span>
								<span className="tab-text-short">
									{t(tab.shortKey)}
								</span>
								{tab.badge && (
									<span className="absolute -top-1.5 -right-1 px-1 py-px text-[8px] font-bold text-white bg-primary rounded-full uppercase scale-90 tracking-wider shadow-sm select-none">
										{tab.badge}
									</span>
								)}
							</TabsTrigger>
						);
					})}
				</TabsList>
			</Tabs>
		);
	},
);
