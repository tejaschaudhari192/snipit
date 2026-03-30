import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { LanguageIcon } from "@/components/snippets/language-icon";
import { useTranslation } from "react-i18next";
import aiGif from "@/assets/images/ai.gif";
import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/constants";

interface LanguageSelectorProps {
	value: string;
	onValueChange: (value: string) => void;
	isDetecting?: boolean;
	className?: string;
}

export const LanguageSelector = ({
	value,
	onValueChange,
	isDetecting,
	className,
}: LanguageSelectorProps) => {
	const { t } = useTranslation();

	if (isDetecting) {
		return (
			<button
				type="button"
				className={cn(
					"group relative w-full sm:w-[180px] h-10 shrink-0 rounded-md p-[1px] overflow-hidden focus:outline-none",
					className,
				)}
			>
				<div className="absolute inset-[-200%] opacity-70 moving-border-gradient animate-moving-border" />
				<div className="relative z-10 flex h-full w-full items-center justify-center gap-2 rounded-[5px] bg-background dark:bg-slate-900 text-sm font-medium">
					<span className="whitespace-nowrap">
						{t("home.auto_detecting")}
					</span>
					<img
						src={aiGif}
						alt="AI Detecting"
						className="w-5 h-5 shrink-0"
					/>
				</div>
			</button>
		);
	}

	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger
				className={cn(
					"w-full sm:w-[200px] h-10 bg-background/80 backdrop-blur-sm border-border/50 shadow-sm transition-all focus:ring-primary/20",
					className,
				)}
			>
				<SelectValue placeholder="Language" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{LANGUAGES.map((lang) => (
						<SelectItem key={lang.value} value={lang.value}>
							<span className="inline-flex items-center gap-2">
								<LanguageIcon
									language={lang.value}
									className="h-4 w-4"
								/>
								<span>{lang.name}</span>
							</span>
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};
