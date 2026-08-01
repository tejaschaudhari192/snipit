import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type {
	ParsedImportItem,
	DuplicateStrategy,
} from "../../utils/importers/types";
import { useAppDispatch } from "../../store";
import { persistItem, createFolderAsync } from "../../store/password-slice";
import { Progress } from "@/components/ui/progress";
import {
	CheckCircle2,
	CircleDashed,
	FileX2,
	AlertTriangle,
	SkipForward,
	CopyPlus,
	Replace,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";

interface Props {
	items: ParsedImportItem[];
	duplicateStrategy: DuplicateStrategy;
	onDone: (imported: number, skipped: number) => void;
	onCancel: () => void;
}

type DuplicateDecision = "skip" | "keep_both" | "overwrite";

interface PendingDuplicate {
	item: ParsedImportItem;
	resolve: (decision: DuplicateDecision) => void;
}

// ─── Inline "Ask" dialog ────────────────────────────────────────────────────
function DuplicateAskDialog({ pending }: { pending: PendingDuplicate | null }) {
	const { t } = useTranslation();
	if (!pending) return null;

	return (
		<Dialog open modal>
			<DialogContent
				className="sm:max-w-105"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="w-5 h-5 text-amber-500" />
						{t("tools.password_manager.import.duplicate_detected")}
					</DialogTitle>
					<DialogDescription>
						<span className="font-semibold text-foreground">
							{pending.item.mapped.title}
						</span>{" "}
						{t("tools.password_manager.import.duplicate_info")}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
					<Button
						variant="outline"
						className="flex-1 gap-2"
						onClick={() => pending.resolve("skip")}
					>
						<SkipForward className="w-4 h-4" />
						{t("tools.password_manager.import.skip")}
					</Button>
					<Button
						variant="outline"
						className="flex-1 gap-2"
						onClick={() => pending.resolve("keep_both")}
					>
						<CopyPlus className="w-4 h-4" />
						{t("tools.password_manager.import.keep_both")}
					</Button>
					<Button
						className="flex-1 gap-2"
						onClick={() => pending.resolve("overwrite")}
					>
						<Replace className="w-4 h-4" />
						{t("tools.password_manager.import.overwrite")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function StepBulkImport({
	items,
	duplicateStrategy,
	onDone,
}: Props) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [currentIndex, setCurrentIndex] = useState(0);
	const [importedCount, setImportedCount] = useState(0);
	const [skippedCount, setSkippedCount] = useState(0);
	const [pendingDuplicate, setPendingDuplicate] =
		useState<PendingDuplicate | null>(null);

	// Refs to avoid stale closures in the async loop
	const cancelRef = useRef(false);
	const isMountedRef = useRef(true);

	// Called when user resolves a duplicate via the dialog
	const askForDuplicate = useCallback(
		(item: ParsedImportItem): Promise<DuplicateDecision> => {
			return new Promise((resolve) => {
				setPendingDuplicate({
					item,
					resolve: (decision: DuplicateDecision) => {
						setPendingDuplicate(null);
						resolve(decision);
					},
				});
			});
		},
		[],
	);

	useEffect(() => {
		isMountedRef.current = true;
		let imported = 0;
		let skipped = 0;
		const localFolderCache: Record<string, string> = {};

		const runImport = async () => {
			for (let i = 0; i < items.length; i++) {
				if (cancelRef.current || !isMountedRef.current) break;

				if (isMountedRef.current) setCurrentIndex(i);
				const item = items[i];

				// Handle pre-skipped (e.g. archived/trashed in source)
				if (item.isSkipped) {
					skipped++;
					if (isMountedRef.current) setSkippedCount(skipped);
					continue;
				}

				// ── Handle duplicates ────────────────────────────────────
				if (item.isDuplicate) {
					let decision: DuplicateDecision =
						duplicateStrategy as DuplicateDecision;

					if (duplicateStrategy === "ask") {
						// Pause the loop and wait for user input
						decision = await askForDuplicate(item);
						if (!isMountedRef.current) return;
					}

					if (decision === "skip") {
						skipped++;
						if (isMountedRef.current) setSkippedCount(skipped);
						continue;
					}

					if (decision === "overwrite" && item.duplicateOfId) {
						item.mapped.id = item.duplicateOfId;
					}
					// "keep_both" → fall through with new ID (default)
				}

				// ── Handle folder creation ────────────────────────────────
				if (item.sourceFolder) {
					if (!localFolderCache[item.sourceFolder]) {
						try {
							const newFolder = await dispatch(
								createFolderAsync({
									name: item.sourceFolder,
									color: "#888888",
									isVirtual: false,
								}),
							).unwrap();
							localFolderCache[item.sourceFolder] = newFolder.id;
						} catch (e) {
							console.error("Failed to create folder", e);
						}
					}

					if (localFolderCache[item.sourceFolder]) {
						item.mapped.folderId =
							localFolderCache[item.sourceFolder];
					}
				}

				// ── Save item ─────────────────────────────────────────────
				try {
					await dispatch(persistItem(item.mapped)).unwrap();
					imported++;
					if (isMountedRef.current) setImportedCount(imported);
				} catch (e) {
					console.error("Failed to import item", e);
					skipped++;
					if (isMountedRef.current) setSkippedCount(skipped);
				}
			}

			if (isMountedRef.current && !cancelRef.current) {
				onDone(imported, skipped);
			}
		};

		runImport();

		return () => {
			isMountedRef.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Run once on mount

	const totalProcessed = currentIndex + 1;
	const progress =
		items.length === 0
			? 100
			: Math.round((totalProcessed / items.length) * 100);
	const currentItem = items[currentIndex];

	return (
		<>
			<DuplicateAskDialog pending={pendingDuplicate} />

			<div className="p-6 flex flex-col gap-8 text-center min-h-75 justify-center">
				<div>
					<h2 className="text-xl font-bold mb-2">
						{t("tools.password_manager.import.importing")}
					</h2>
					<p className="text-muted-foreground">
						{t("tools.password_manager.import.processing", {
							current: totalProcessed,
							total: items.length,
						})}
					</p>
				</div>

				<div className="space-y-4">
					<Progress value={progress} className="h-3" />
					<div className="flex justify-center gap-6 text-sm font-medium">
						<span className="text-emerald-600 flex items-center gap-1.5">
							<CheckCircle2 className="w-4 h-4" /> {importedCount}{" "}
							{t("tools.password_manager.import.imported")}
						</span>
						<span className="text-muted-foreground flex items-center gap-1.5">
							<FileX2 className="w-4 h-4" /> {skippedCount}{" "}
							{t("tools.password_manager.import.skipped")}
						</span>
					</div>
				</div>

				{currentItem && (
					<div className="p-3 bg-muted/50 rounded-lg text-sm flex items-center gap-3 text-left">
						<CircleDashed className="w-4 h-4 animate-spin text-primary shrink-0" />
						<div className="truncate flex-1">
							<span className="font-medium mr-2">
								{t(
									"tools.password_manager.import.processing_item",
								)}
								:
							</span>
							{currentItem.mapped.title}
						</div>
						{currentItem.isDuplicate && (
							<span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
								{t("tools.password_manager.import.duplicate")}
							</span>
						)}
					</div>
				)}

				<div className="pt-8">
					<Button
						variant="outline"
						onClick={() => {
							cancelRef.current = true;
							// Resolve any pending dialog so the loop can exit
							setPendingDuplicate((prev) => {
								prev?.resolve("skip");
								return null;
							});
							onDone(
								importedCount,
								skippedCount + (items.length - currentIndex),
							);
						}}
					>
						{t("tools.password_manager.import.stop")}
					</Button>
				</div>
			</div>
		</>
	);
}
