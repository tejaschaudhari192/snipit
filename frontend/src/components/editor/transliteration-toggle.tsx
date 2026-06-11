import { memo } from "react";
import { Keyboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TRANSLITERATION_LANGUAGES } from "@/constants";
import { cn } from "@/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransliterationToggleProps {
	enabled: boolean;
	onToggle: () => void;
	language: string;
	onLanguageChange: (lang: string) => void;
	className?: string;
}

export const TransliterationToggle = memo(
	({
		enabled,
		onToggle,
		language,
		onLanguageChange,
		className,
	}: TransliterationToggleProps) => {
		const { t } = useTranslation();

		const selectedLangObj = TRANSLITERATION_LANGUAGES.find(
			(l) => l.value === language,
		);
		const langName = selectedLangObj ? selectedLangObj.name : "Indic";

		return (
			<div className={cn("flex items-center gap-1", className)}>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={enabled ? "default" : "outline"}
								size="sm"
								onClick={onToggle}
								className={cn(
									"gap-2 h-9 px-3 transition-all",
									enabled
										? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
										: "bg-background/50 hover:bg-background/80 border-border/40 shadow-sm text-muted-foreground",
								)}
							>
								<Keyboard className="h-4 w-4" />
								<span className="font-medium text-sm hidden sm:inline-block">
									{enabled
										? t("editor.transliteration.enabled", {
												language: langName,
											})
										: t("editor.transliteration.disabled")}
								</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="top">
							<p>
								{enabled
									? t(
											"editor.transliteration.tooltip_disable",
										)
									: t(
											"editor.transliteration.tooltip_enable",
											{
												language: langName,
											},
										)}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				{enabled && (
					<Select value={language} onValueChange={onLanguageChange}>
						<SelectTrigger className="w-[120px] h-9 bg-background/80 backdrop-blur-sm border-border/50 shadow-sm transition-all focus:ring-primary/20 shrink-0">
							<SelectValue
								placeholder={t(
									"editor.transliteration.select_language",
								)}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{TRANSLITERATION_LANGUAGES.map((lang) => (
									<SelectItem
										key={lang.value}
										value={lang.value}
									>
										<span className="font-medium">
											{lang.label}
										</span>
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				)}
			</div>
		);
	},
);
