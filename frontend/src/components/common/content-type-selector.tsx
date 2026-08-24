import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";
import type { ContentMode } from "@/types";
import { memo } from "react";
import { TABS_CONFIG } from "@/constants";

interface ContentTypeSelectorProps {
	value: ContentMode;
	onValueChange: (value: ContentMode) => void;
	className?: string;
	showFileOption?: boolean;
}

export const ContentTypeSelector = memo(
	({
		value,
		onValueChange,
		className,
		showFileOption = true,
	}: ContentTypeSelectorProps) => {
		const { t } = useTranslation();

		return (
			<Tabs
				value={value}
				onValueChange={(val) => onValueChange(val as ContentMode)}
				className={cn(
					"min-h-fit w-full sm:w-auto max-w-full min-w-0",
					className,
				)}
			>
				<TabsList
					className={cn(
						"min-h-fit max-w-full w-full sm:w-auto flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar scroll-smooth",
					)}
				>
					{TABS_CONFIG.map((tab) => {
						if (tab.requiresFileOption && !showFileOption)
							return null;

						const Icon = tab.icon;

						return (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								className="tab-trigger-base shrink-0"
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
