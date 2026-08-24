import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyX, CheckCircle, Merge, RefreshCw } from "lucide-react";
import type { PasswordItem } from "@/tools/password-manager/types";
import { useAppDispatch } from "@/tools/password-manager/store";
import { MergeItemsModal } from "./merge-items-modal";
import { deleteItem } from "@/tools/password-manager/store/thunks";
import { handleEdit } from "@/tools/password-manager/store/password-slice";

interface FindDuplicatesWizardProps {
	isOpen: boolean;
	onClose: () => void;
	items: PasswordItem[];
}

export function FindDuplicatesWizard({
	isOpen,
	onClose,
	items,
}: FindDuplicatesWizardProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [isAnalyzing, setIsAnalyzing] = useState(true);
	const [conflictGroups, setConflictGroups] = useState<PasswordItem[][]>([]);
	const [autoMergedCount, setAutoMergedCount] = useState(0);
	const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
	const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
	const [isFinished, setIsFinished] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			setIsAnalyzing(true);
			setConflictGroups([]);
			setAutoMergedCount(0);
			setCurrentConflictIndex(0);
			setIsFinished(false);
			return;
		}

		// Analyze duplicates
		const analyze = async () => {
			setIsAnalyzing(true);

			// 1. Group items by key (title + url + username)
			const groups = new Map<string, PasswordItem[]>();

			items.forEach((item) => {
				const type = item.itemType || "login";
				const title = (item.title || "").toLowerCase().trim();
				const url = (
					item.url ||
					item.metadata?.url ||
					item.metadata?.website ||
					""
				)
					.toLowerCase()
					.trim();
				const username = (
					item.username ||
					item.metadata?.username ||
					""
				)
					.toLowerCase()
					.trim();
				const email = (item.metadata?.email || "").toLowerCase().trim();

				const key = `${type}||${title}||${url}||${username}||${email}`;
				if (!groups.has(key)) groups.set(key, []);
				groups.get(key)!.push(item);
			});

			const duplicates = Array.from(groups.values()).filter(
				(g) => g.length > 1,
			);

			let autoMerged = 0;
			const conflictsToReview: PasswordItem[][] = [];

			// 2. Separate into exact matches (auto-merge) and conflicts
			duplicates.forEach((group) => {
				let hasConflicts = false;
				const base = group[0];

				for (let i = 1; i < group.length; i++) {
					const other = group[i];
					// Check if password or notes differ
					if (
						base.password !== other.password ||
						base.notes !== other.notes
					) {
						hasConflicts = true;
						break;
					}
					// Deep check metadata
					const baseMeta = JSON.stringify(base.metadata || {});
					const otherMeta = JSON.stringify(other.metadata || {});
					if (baseMeta !== otherMeta) {
						hasConflicts = true;
						break;
					}
				}

				if (hasConflicts) {
					conflictsToReview.push(group);
				} else {
					// Auto-merge: keep base, delete rest
					autoMerged += group.length - 1;
					const idsToDelete = group.slice(1).map((i) => i.id);
					idsToDelete.forEach((id) => dispatch(deleteItem(id)));
				}
			});

			setConflictGroups(conflictsToReview);
			setAutoMergedCount(autoMerged);
			setIsAnalyzing(false);

			if (conflictsToReview.length === 0) {
				setIsFinished(true);
			}
		};

		analyze();
	}, [isOpen, items, dispatch]);

	const currentGroup = conflictGroups[currentConflictIndex];

	const handleResolveConflict = () => {
		setIsMergeModalOpen(true);
	};

	const handleNext = () => {
		if (currentConflictIndex < conflictGroups.length - 1) {
			setCurrentConflictIndex((prev) => prev + 1);
		} else {
			setIsFinished(true);
		}
	};

	const handleSkip = () => {
		handleNext();
	};

	const renderContent = () => {
		if (isAnalyzing) {
			return (
				<div className="flex flex-col items-center justify-center py-12 gap-4">
					<RefreshCw className="w-8 h-8 animate-spin text-primary" />
					<p className="text-muted-foreground">
						{t("tools.password_manager.analyzing_duplicates")}
					</p>
				</div>
			);
		}

		if (isFinished) {
			return (
				<div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
					<div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
						<CheckCircle className="w-8 h-8" />
					</div>
					<div className="space-y-1">
						<h3 className="text-lg font-semibold">
							{t("tools.password_manager.duplicates_resolved")}
						</h3>
						<p className="text-sm text-muted-foreground max-w-70">
							{autoMergedCount > 0
								? t(
										"tools.password_manager.auto_merged_count",
										{
											count: autoMergedCount,
										},
									)
								: t(
										"tools.password_manager.no_identical_found",
									)}
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className="flex flex-col gap-6 py-4">
				<div className="flex items-center justify-between text-sm">
					<span className="font-medium text-foreground">
						{t("tools.password_manager.conflict_review")}
					</span>
					<span className="text-muted-foreground">
						{currentConflictIndex + 1} of {conflictGroups.length}
					</span>
				</div>

				<div className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
							<CopyX className="w-5 h-5" />
						</div>
						<div>
							<h4 className="font-semibold text-sm">
								{currentGroup[0].title}
							</h4>
							<p className="text-xs text-muted-foreground">
								{currentGroup.length}{" "}
								{t(
									"tools.password_manager.conflicting_versions",
								)}
							</p>
						</div>
					</div>
					<p className="text-sm text-muted-foreground">
						{t("tools.password_manager.conflict_desc")}
					</p>
				</div>
			</div>
		);
	};

	return (
		<>
			<Dialog open={isOpen && !isMergeModalOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{t("tools.password_manager.find_duplicates")}
						</DialogTitle>
						<DialogDescription>
							{t("tools.password_manager.find_duplicates_desc")}
						</DialogDescription>
					</DialogHeader>

					{renderContent()}

					<DialogFooter className="mt-4">
						{!isAnalyzing && !isFinished && (
							<>
								<Button variant="ghost" onClick={handleSkip}>
									{t("tools.password_manager.skip")}
								</Button>
								<Button
									onClick={handleResolveConflict}
									className="gap-2"
								>
									<Merge className="w-4 h-4" />
									{t("tools.password_manager.review_merge")}
								</Button>
							</>
						)}
						{isFinished && (
							<Button onClick={onClose} className="w-full">
								{t("tools.password_manager.done")}
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{isMergeModalOpen && currentGroup && (
				<MergeItemsModal
					isOpen={isMergeModalOpen}
					onClose={() => setIsMergeModalOpen(false)}
					onSkip={() => {
						setIsMergeModalOpen(false);
						handleSkip();
					}}
					items={currentGroup}
					onMerge={(mergedItem, originalItemIds) => {
						dispatch(handleEdit(mergedItem));
						originalItemIds.forEach((id) => {
							if (id !== mergedItem.id) {
								dispatch(deleteItem(id));
							}
						});
						handleNext();
					}}
				/>
			)}
		</>
	);
}
