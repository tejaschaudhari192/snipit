import { Clock } from "lucide-react";
import { LanguageIcon } from "@/components/snippets/language-icon";
import { getTimeRemaining } from "@/utils";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";

interface DisplayMetadataProps {
	paste: PasteData;
}

export const DisplayMetadata = ({ paste }: DisplayMetadataProps) => {
	const { t } = useTranslation();

	return (
		<>
			<div className="flex items-center justify-between px-6 py-1.5 bg-background/40 backdrop-blur-xl border-y border-border/50 text-[10px] sm:text-xs shadow-sm mt-0 relative z-10">
				<div className="flex items-center gap-3">
					{paste.language ? (
						<div className="flex items-center gap-1.5 font-medium text-muted-foreground uppercase tracking-wider">
							<LanguageIcon
								language={paste.language}
								className="h-3 w-3"
							/>
							{paste.language === "text"
								? t("home.tab_text", "Plain Text")
								: paste.language}
						</div>
					) : null}
					<div className="w-px h-3 bg-border hidden sm:block" />
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Clock className="h-3 w-3" />
						{paste.expiresTime === "never"
							? t("home.expire_options.never")
							: paste.burnAfterRead ||
								  paste.expiresTime === "one-time"
								? t("home.expire_options.one_time_snippet")
								: paste.expiresAt
									? `${t("display.expires_in")} ${getTimeRemaining(paste.expiresAt, t)}`
									: ""}
					</div>
					<div className="w-px h-3 bg-border hidden sm:block" />
					<div className="flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider font-medium">
						<span
							className={`h-1.5 w-1.5 rounded-full ${
								paste.visibility === "public"
									? "bg-green-500"
									: paste.visibility === "shared"
										? "bg-blue-500"
										: "bg-red-500"
							}`}
						/>
						{t(`common.${paste.visibility || "public"}`)}
					</div>
				</div>
			</div>

			{(paste.burnAfterRead || paste.expiresTime === "one-time") && (
				<div className="mx-4 mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
					<span className="text-lg">⚠️</span>
					{t("display.burn_after_read_warning")}{" "}
					{paste.views === 0
						? t("display.views_remaining_plural", { count: 2 })
						: paste.views === 1
							? t("display.views_remaining_singular")
							: t("display.final_view")}
				</div>
			)}
		</>
	);
};
