import { LabelManager } from "@/components/common/label-manager";
import { Clock, ShieldCheck, Folder } from "lucide-react";
import { LanguageIcon } from "@/components/snippets/language-icon";
import { getTimeRemaining } from "@/utils";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";
import { useFolders } from "@/context/FolderContext";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { LANGUAGES } from "@/constants";

interface DisplayMetadataProps {
	paste?: PasteData;
	loading?: boolean;
}

export const DisplayMetadata = ({ paste, loading }: DisplayMetadataProps) => {
	const { t } = useTranslation();
	const { getFolderPathString } = useFolders();

	const folderPathString = paste?.folderId
		? getFolderPathString(paste.folderId)
		: null;

	if (loading || !paste) {
		return <ShimmerSection type="metadata" />;
	}

	return (
		<>
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-1.5 bg-background/40 backdrop-blur-xl border-y border-border/50 text-[10px] sm:text-xs shadow-sm mt-0 relative z-10 gap-2 sm:gap-0">
				<div className="flex flex-wrap items-center gap-3">
					{folderPathString && (
						<>
							<div className="flex items-center gap-1.5 text-primary font-bold">
								<Folder className="h-3.5 w-3.5 shrink-0" />
								<span>{folderPathString}</span>
							</div>
							<div className="w-px h-3 bg-border" />
						</>
					)}
					{paste.language ? (
						<div className="flex items-center gap-1.5 font-medium text-muted-foreground">
							<LanguageIcon
								language={paste.language}
								className="h-3 w-3"
							/>
							{(() => {
								if (
									paste.contentMode === "docs" ||
									paste.language === "docs"
								)
									return t("home.tabs.docs.full");
								if (paste.language === "text")
									return t("home.tabs.text.full");
								const lang = LANGUAGES.find(
									(l) => l.value === paste.language,
								);
								if (lang) return lang.name;
								return (
									paste.language.charAt(0).toUpperCase() +
									paste.language.slice(1)
								);
							})()}
						</div>
					) : null}
					<div className="w-px h-3 bg-border hidden sm:block" />
					<div className="flex items-center gap-1.5 text-muted-foreground font-medium">
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
					<div className="flex items-center gap-1.5 text-muted-foreground font-medium uppercase tracking-wider">
						<span
							className={`h-1.5 w-1.5 rounded-full ${
								paste.visibility === "public"
									? "bg-green-500"
									: paste.visibility === "shared"
										? "bg-blue-500"
										: "bg-red-500"
							}`}
						/>
						{t(`common.access.${paste.visibility}`)}
					</div>
					{paste.isPasswordProtected && (
						<>
							<div className="w-px h-3 bg-border hidden sm:block" />
							<div className="flex items-center gap-1.5 text-muted-foreground font-medium uppercase tracking-wider">
								<ShieldCheck className="h-3.5 w-3.5 text-primary" />
								{t("common.secure")}
							</div>
						</>
					)}
				</div>

				<div className="flex items-center gap-2 w-full sm:w-auto">
					<div className="w-full sm:w-auto">
						<LabelManager pasteId={paste.id} compact={true} />
					</div>
				</div>
			</div>

			{(paste.burnAfterRead || paste.expiresTime === "one-time") && (
				<div className="mx-4 mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
					<span className="text-lg">⚠️</span>
					{t("display.burn_after_read_warning")}
				</div>
			)}
		</>
	);
};
