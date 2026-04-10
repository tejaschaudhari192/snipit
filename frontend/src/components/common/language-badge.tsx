import { useTranslation } from "react-i18next";
import { LanguageIcon } from "@/components/snippets/language-icon";
import { Link as LinkIcon } from "lucide-react";
import { FileTypeIcon } from "./file-type-icon";
import { GlassBadge } from "./core/glass-badge";
import { cn } from "@/lib/utils";

interface LanguageBadgeProps {
	language?: string | null;
	contentMode?: string;
	isLink?: boolean;
	isFile?: boolean;
	fileName?: string | null;
	mimeType?: string | null;
	className?: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
	javascript:
		"bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
	typescript:
		"bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20",
	python: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20",
	java: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20",
	html: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20",
	css: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20",
	json: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
	rust: "bg-orange-600/20 text-orange-700 dark:text-orange-400 border-orange-600/20",
	go: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
	c: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/20",
	cpp: "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/20",
	csharp: "bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/20",
	markdown:
		"bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/20",
	shell: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/20",
	bash: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/20",
	other: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export const LanguageBadge = ({
	language,
	contentMode,
	isLink,
	isFile,
	fileName,
	mimeType,
	className,
}: LanguageBadgeProps) => {
	const { t } = useTranslation();
	const lang = language?.toLowerCase() || "other";

	const getBadgeConfig = () => {
		if (isLink || contentMode === "link") {
			return {
				icon: <LinkIcon className="h-3.5 w-3.5" />,
				text: t("history.link_snippet"),
				color: "bg-primary/10 text-primary border-primary/20",
			};
		}

		if (isFile || contentMode === "file") {
			return {
				icon: (
					<FileTypeIcon
						fileName={fileName}
						mimeType={mimeType}
						className="h-3.5 w-3.5"
					/>
				),
				text: t("home.tab_file", "File"),
				color: "bg-primary/10 text-primary border-primary/20",
			};
		}

		const color =
			LANGUAGE_COLORS[lang] ||
			"bg-muted text-muted-foreground border-border/50";

		return {
			icon: <LanguageIcon language={lang} className="h-3.5 w-3.5" />,
			text:
				lang === "text"
					? t("history.plain_text_snippet")
					: lang.toUpperCase(),
			color,
		};
	};

	const { icon, text, color } = getBadgeConfig();

	return (
		<GlassBadge icon={icon} className={cn(color, className)} rounded="lg">
			<span className="truncate max-w-[120px]">{text}</span>
		</GlassBadge>
	);
};
