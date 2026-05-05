import { LabelManager } from "@/components/common/label-manager";
import { Clock, Bookmark, ShieldCheck } from "lucide-react";
import { LanguageIcon } from "@/components/snippets/language-icon";
import { getTimeRemaining } from "@/utils";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useApiHelpers } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSnippets } from "@/context/SnippetContext";

interface DisplayMetadataProps {
	paste: PasteData;
}

export const DisplayMetadata = ({ paste }: DisplayMetadataProps) => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const apiHelpers = useApiHelpers();
	const { savedProfile, loadSavedProfile } = useSnippets();
	const [isSaving, setIsSaving] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const [isSavedByLabels, setIsSavedByLabels] = useState(false);
	const [isEditingLabels, setIsEditingLabels] = useState(false);

	useEffect(() => {
		const savedItem = savedProfile.items.find((p) => p.id === paste.id);
		if (user && savedItem) {
			setIsSaved(true);
		}
	}, [user, savedProfile.items, paste.id]);

	const handleSaveSnippet = async () => {
		if (!user) return;
		try {
			setIsSaving(true);
			const result = await apiHelpers.savePaste(paste.id);
			setIsSaved(result.saved);

			if (result.saved) {
				toast.success(
					t("display.snippet_saved", "Snippet saved to your profile"),
				);
			} else {
				toast.success(
					t("display.snippet_unsaved", "Snippet removed from saved"),
				);
			}

			loadSavedProfile(true); // Refresh saved profile
		} catch (error) {
			console.error("Failed to toggle save snippet", error);
			toast.error(
				t("display.save_failed", "Failed to update saved status"),
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<>
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-1.5 bg-background/40 backdrop-blur-xl border-y border-border/50 text-[10px] sm:text-xs shadow-sm mt-0 relative z-10 gap-2 sm:gap-0">
				<div className="flex flex-wrap items-center gap-3">
					{paste.language ? (
						<div className="flex items-center gap-1.5 font-medium text-muted-foreground">
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
						{t(`common.${paste.visibility || "public"}`)}
					</div>
					{(paste.isPasswordProtected || !!paste.password) && (
						<>
							<div className="w-px h-3 bg-border hidden sm:block" />
							<div className="flex items-center gap-1.5 text-muted-foreground font-medium uppercase tracking-wider">
								<ShieldCheck className="h-3.5 w-3.5 text-primary" />
								{t("common.secure", "Secure")}
							</div>
						</>
					)}
				</div>

				<div className="flex items-center gap-2 w-full sm:w-auto">
					{user &&
						paste.owner &&
						paste.owner.toString() !== user._id.toString() &&
						!isSavedByLabels &&
						!isEditingLabels && (
							<button
								onClick={handleSaveSnippet}
								disabled={isSaving}
								className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all text-xs font-bold ${
									isSaved
										? "bg-primary/20 text-primary"
										: "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
								}`}
								title="Save snippet"
							>
								<Bookmark
									className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`}
								/>
								{isSaved ? "Saved" : "Save"}
							</button>
						)}
					<div className="w-full sm:w-auto">
						<LabelManager
							pasteId={paste.id}
							compact={true}
							onLabelsUpdate={useCallback(
								(labels: string[]) =>
									setIsSavedByLabels(labels.length > 0),
								[],
							)}
							onEditStateChange={useCallback(
								(isEditing: boolean) =>
									setIsEditingLabels(isEditing),
								[],
							)}
						/>
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
