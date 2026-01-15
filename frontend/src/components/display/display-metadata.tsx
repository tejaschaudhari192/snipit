import { Clock } from "lucide-react";
import { LanguageIcon } from "@/components/language-icon";
import { getTimeRemaining } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";

interface DisplayMetadataProps {
	paste: PasteData;
}

export const DisplayMetadata = ({ paste }: DisplayMetadataProps) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t text-[10px] sm:text-xs mt-1 md:mt-2">
				<div className="flex items-center gap-3">
					{paste.language ? (
						<div className="flex items-center gap-1.5 font-medium text-muted-foreground uppercase tracking-wider">
							<LanguageIcon
								language={paste.language}
								className="h-3 w-3"
							/>
							{paste.language === "text"
								? "Plain Text"
								: paste.language}
						</div>
					) : null}
					<div className="w-px h-3 bg-border hidden sm:block" />
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Clock className="h-3 w-3" />
						{paste.burnAfterRead || paste.expiresTime === "one-time"
							? t("home.expire_options.one_time_snippet")
							: `${t("display.expires_in")} ${getTimeRemaining(paste.expiresAt!)}`}
					</div>
				</div>
			</div>

			{(paste.burnAfterRead || paste.expiresTime === "one-time") && (
				<div className="mx-4 mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
					<span className="text-lg">⚠️</span>
					{t("display.burn_after_read_warning")}{" "}
					{paste.views === 0
						? "(2 views remaining)"
						: paste.views === 1
							? "(1 view remaining)"
							: "(Final view)"}
				</div>
			)}
		</>
	);
};
