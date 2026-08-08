import { LabelManager } from "@/components/common/label-manager";
import { Clock, Bookmark, ShieldCheck } from "lucide-react";
import { LanguageIcon } from "@/components/snippets/language-icon";
import { getTimeRemaining } from "@/utils";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { savePaste } from "@/lib/api/labels";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/components/ui/toast";
import { useSnippets } from "@/context/SnippetContext";
import { guestStorage } from "@/utils/guest-storage";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { LANGUAGES } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface DisplayMetadataProps {
	paste?: PasteData;
	loading?: boolean;
}

export const DisplayMetadata = ({ paste, loading }: DisplayMetadataProps) => {
	const { t } = useTranslation();
	const { user } = useAuth();

	const { savedProfile, loadSavedProfile } = useSnippets();
	const [isSaving, setIsSaving] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const [isSavedByLabels, setIsSavedByLabels] = useState(false);
	const [isEditingLabels, setIsEditingLabels] = useState(false);

	useEffect(() => {
		if (!paste) return;
		const savedItem = savedProfile.items.find((p) => p.id === paste.id);
		if (user && savedItem) {
			setIsSaved(true);
		}
	}, [user, savedProfile.items, paste]);

	const handleSaveSnippet = async () => {
		if (!paste) return;
		if (user) {
			try {
				setIsSaving(true);
				const result = await savePaste(paste.id);
				setIsSaved(result.saved);

				if (result.saved) {
					toast.add({
						title: t("display.status.snippet_saved"),
						type: "success",
					});
				} else {
					toast.add({
						title: t("display.status.snippet_unsaved"),
						type: "success",
					});
				}

				loadSavedProfile(true);
			} catch (error) {
				console.error("Failed to toggle save snippet", error);
				toast.add({
					title: t("display.status.save_failed"),
					type: "error",
				});
			} finally {
				setIsSaving(false);
			}
		} else {
			// Handle guest save to localStore
			try {
				setIsSaving(true);
				const saved = guestStorage.toggleSaved(paste);

				if (saved) {
					toast.add({
						title: t("display.status.snippet_saved"),
						type: "success",
					});
				} else {
					toast.add({
						title: t("display.status.snippet_unsaved"),
						type: "success",
					});
				}

				setIsSaved(saved);
				loadSavedProfile(true);
			} catch (error) {
				console.error("Failed to save snippet locally", error);
			} finally {
				setIsSaving(false);
			}
		}
	};

	const handleLabelsUpdate = useCallback(
		(labels: string[]) => setIsSavedByLabels(labels.length > 0),
		[],
	);

	const handleEditStateChange = useCallback(
		(isEditing: boolean) => setIsEditingLabels(isEditing),
		[],
	);

	if (loading || !paste) {
		return <ShimmerSection type="metadata" />;
	}

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
					{(!user ||
						(paste.owner &&
							paste.owner.toString() !== user._id.toString())) &&
						!isSavedByLabels &&
						!isEditingLabels && (
							<Button
								variant={isSaved ? "secondary" : "ghost"}
								size="sm"
								onClick={handleSaveSnippet}
								disabled={isSaving}
								className={`h-7 px-3 text-xs font-bold gap-1.5 ${
									isSaved
										? "bg-primary/20 text-primary hover:bg-primary/30"
										: "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
								}`}
								title="Save snippet"
							>
								{isSaving ? (
									<Skeleton className="w-3.5 h-3.5 rounded-full bg-primary/30 shrink-0" />
								) : (
									<Bookmark
										className={`w-3.5 h-3.5 shrink-0 ${isSaved ? "fill-current" : ""}`}
									/>
								)}
								{isSaving
									? "Saving..."
									: isSaved
										? "Saved"
										: "Save"}
							</Button>
						)}
					<div className="w-full sm:w-auto">
						<LabelManager
							pasteId={paste.id}
							compact={true}
							onLabelsUpdate={handleLabelsUpdate}
							onEditStateChange={handleEditStateChange}
						/>
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
