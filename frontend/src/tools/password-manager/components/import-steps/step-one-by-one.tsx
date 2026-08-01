import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
	ParsedImportItem,
	DuplicateStrategy,
} from "../../utils/importers/types";
import { useAppDispatch } from "../../store";
import { persistItem, createFolderAsync } from "../../store/password-slice";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertTriangle, Check, X, RefreshCw } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ITEM_TYPE_OPTIONS } from "../../utils/constants";
import type { PasswordItem } from "../../types";

interface Props {
	items: ParsedImportItem[];
	duplicateStrategy: DuplicateStrategy;
	onDone: (imported: number, skipped: number) => void;
	onCancel: () => void;
}

export default function StepOneByOne({
	items,
	duplicateStrategy,
	onDone,
	onCancel,
}: Props) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [currentIndex, setCurrentIndex] = useState(0);

	// UI display counters (state for re-render)
	const [importedCountUI, setImportedCountUI] = useState(0);
	const [skippedCountUI, setSkippedCountUI] = useState(0);

	// Refs for accurate final reporting (avoid stale closures in onDone)
	const importedRef = useRef(0);
	const skippedRef = useRef(0);

	// Ref for folder cache — synchronous, no batching issues
	const folderCacheRef = useRef<Record<string, string>>({});

	// Local state for the editable fields of the current item
	const [editedTitle, setEditedTitle] = useState("");
	const [editedUsername, setEditedUsername] = useState("");
	const [editedPassword, setEditedPassword] = useState("");
	const [editedUrl, setEditedUrl] = useState("");
	const [editedNotes, setEditedNotes] = useState("");
	const [editedType, setEditedType] =
		useState<PasswordItem["itemType"]>("login");

	const [showSourcePass, setShowSourcePass] = useState(false);
	const [showResultPass, setShowResultPass] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const item = items[currentIndex];

	// Initialize form state from the first item on mount
	useEffect(() => {
		if (items[0]) {
			setEditedTitle(items[0].mapped.title);
			setEditedUsername(items[0].mapped.username || "");
			setEditedPassword(items[0].mapped.password || "");
			setEditedUrl(items[0].mapped.url || "");
			setEditedNotes(items[0].mapped.notes || "");
			setEditedType(items[0].mapped.itemType || "login");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sync form fields when navigating to a new item
	const loadItem = (index: number) => {
		const next = items[index];
		if (next) {
			setEditedTitle(next.mapped.title);
			setEditedUsername(next.mapped.username || "");
			setEditedPassword(next.mapped.password || "");
			setEditedUrl(next.mapped.url || "");
			setEditedNotes(next.mapped.notes || "");
			setEditedType(next.mapped.itemType || "login");
			setShowSourcePass(false);
			setShowResultPass(false);
			setSaveError(null);
		}
		setCurrentIndex(index);
	};

	const advance = () => {
		if (currentIndex + 1 >= items.length) {
			onDone(importedRef.current, skippedRef.current);
		} else {
			loadItem(currentIndex + 1);
		}
	};

	const handleSkip = () => {
		skippedRef.current += 1;
		setSkippedCountUI(skippedRef.current);
		setSaveError(null);
		advance();
	};

	const handleAccept = async () => {
		if (!item) return;
		setIsSaving(true);
		setSaveError(null);

		try {
			const finalItem = { ...item.mapped };
			finalItem.title = editedTitle;
			finalItem.username = editedUsername;
			finalItem.password = editedPassword;
			finalItem.url = editedUrl;
			finalItem.notes = editedNotes;
			finalItem.itemType = editedType;

			// Handle duplicates based on strategy
			if (item.isDuplicate) {
				if (duplicateStrategy === "overwrite" && item.duplicateOfId) {
					finalItem.id = item.duplicateOfId;
				} else if (duplicateStrategy === "skip") {
					handleSkip();
					return;
				}
				// "ask" in one-by-one mode: user is already reviewing the item.
				// Accept = Keep Both (new ID), or they can choose to overwrite via the form.
			}

			// Handle Folder Creation — use ref to prevent race conditions
			if (item.sourceFolder) {
				if (!folderCacheRef.current[item.sourceFolder]) {
					const newFolder = await dispatch(
						createFolderAsync({
							name: item.sourceFolder,
							color: "#888888",
							isVirtual: false,
						}),
					).unwrap();
					// Write to ref immediately (synchronous — no batching)
					folderCacheRef.current[item.sourceFolder] = newFolder.id;
				}
				finalItem.folderId = folderCacheRef.current[item.sourceFolder];
			}

			await dispatch(persistItem(finalItem)).unwrap();
			importedRef.current += 1;
			setImportedCountUI(importedRef.current);
			advance();
		} catch (e) {
			console.error("Failed to save item", e);
			setSaveError(
				(e as Error)?.message ||
					t("tools.password_manager.import.save_error"),
			);
		} finally {
			setIsSaving(false);
		}
	};

	if (!item) return null;

	const progress = Math.round((currentIndex / items.length) * 100);

	return (
		<div className="flex flex-col h-full">
			{/* Header / Progress */}
			<div className="p-4 border-b border-pm-border bg-muted/20">
				<div className="flex items-center justify-between mb-2">
					<div className="text-sm font-medium">
						{t("tools.password_manager.import.reviewing_item", {
							current: currentIndex + 1,
							total: items.length,
						})}
					</div>
					<div className="text-sm text-muted-foreground">
						{progress}%
					</div>
				</div>
				<Progress value={progress} className="h-2 mb-2" />
				<div className="flex gap-4 text-xs font-medium">
					<span className="text-emerald-600">
						✓ {importedCountUI}{" "}
						{t("tools.password_manager.import.imported")}
					</span>
					<span className="text-muted-foreground">
						? {items.length - currentIndex}{" "}
						{t("tools.password_manager.import.remaining")}
					</span>
					<span className="text-destructive">
						✗ {skippedCountUI}{" "}
						{t("tools.password_manager.import.skipped")}
					</span>
				</div>
			</div>

			{/* Body */}
			<div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-pm-surface">
				{item.isDuplicate && (
					<div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex gap-3">
						<AlertTriangle className="w-5 h-5 shrink-0" />
						<div className="text-sm">
							<p className="font-semibold mb-1">
								{t(
									"tools.password_manager.import.duplicate_detected",
								)}
							</p>
							<p>
								{t(
									"tools.password_manager.import.duplicate_info",
								)}
							</p>
						</div>
					</div>
				)}

				{saveError && (
					<div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
						<AlertTriangle className="w-5 h-5 shrink-0" />
						<div className="flex-1 text-sm">
							<p className="font-semibold mb-0.5">
								{t("tools.password_manager.import.save_failed")}
							</p>
							<p className="text-xs opacity-80">{saveError}</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5 shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
							onClick={handleAccept}
						>
							<RefreshCw className="w-3.5 h-3.5" />
							{t("tools.password_manager.import.retry")}
						</Button>
					</div>
				)}

				<div className="grid md:grid-cols-2 gap-6">
					{/* Source Panel */}
					<div className="space-y-4">
						<div className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4">
							{t("tools.password_manager.import.source_data", {
								app: item.sourceApp,
							})}
						</div>

						{Object.entries(item.sourceFields).map(
							([key, value]) => {
								if (!value) return null;
								const isPass = key
									.toLowerCase()
									.includes("password");
								return (
									<div key={key} className="space-y-1">
										<Label className="text-xs text-muted-foreground capitalize">
											{key}
										</Label>
										<div className="text-sm bg-muted/30 p-2.5 rounded-md border border-pm-border break-all flex items-center justify-between">
											<span
												className={
													isPass && !showSourcePass
														? "font-mono"
														: ""
												}
											>
												{isPass && !showSourcePass
													? "••••••••••••••••"
													: value}
											</span>
											{isPass && (
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={() =>
														setShowSourcePass(
															!showSourcePass,
														)
													}
												>
													{showSourcePass ? (
														<EyeOff className="w-3.5 h-3.5" />
													) : (
														<Eye className="w-3.5 h-3.5" />
													)}
												</Button>
											)}
										</div>
									</div>
								);
							},
						)}

						{item.sourceFolder && (
							<div className="space-y-1">
								<Label className="text-xs text-muted-foreground">
									{t("tools.password_manager.import.folder")}
								</Label>
								<div className="text-sm bg-muted/30 p-2.5 rounded-md border border-pm-border">
									{item.sourceFolder}
								</div>
							</div>
						)}
					</div>

					{/* Result Panel */}
					<div className="space-y-4">
						<div className="text-xs font-bold tracking-wider text-primary uppercase mb-4">
							{t(
								"tools.password_manager.import.will_be_saved_as",
							)}
						</div>

						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">
								{t("title")}
							</Label>
							<Input
								value={editedTitle}
								onChange={(e) => setEditedTitle(e.target.value)}
								className="h-10"
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">
								{t("tools.password_manager.username")}
							</Label>
							<Input
								value={editedUsername}
								onChange={(e) =>
									setEditedUsername(e.target.value)
								}
								className="h-10"
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">
								{t("tools.password_manager.password")}
							</Label>
							<div className="relative">
								<Input
									type={showResultPass ? "text" : "password"}
									value={editedPassword}
									onChange={(e) =>
										setEditedPassword(e.target.value)
									}
									className="h-10 pr-10 font-mono"
								/>
								<Button
									variant="ghost"
									size="icon"
									className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
									onClick={() =>
										setShowResultPass(!showResultPass)
									}
								>
									{showResultPass ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</Button>
							</div>
						</div>

						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">
								{t("tools.password_manager.url")}
							</Label>
							<Input
								value={editedUrl}
								onChange={(e) => setEditedUrl(e.target.value)}
								className="h-10"
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">
								{t("tools.password_manager.type")}
							</Label>
							<Select
								value={editedType}
								onValueChange={(val: string) =>
									setEditedType(
										val as PasswordItem["itemType"],
									)
								}
							>
								<SelectTrigger className="h-10">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{ITEM_TYPE_OPTIONS.map((opt) => (
										<SelectItem key={opt.id} value={opt.id}>
											{t(opt.label)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">
								{t("tools.password_manager.notes")}
							</Label>
							<Textarea
								value={editedNotes}
								onChange={(e) => setEditedNotes(e.target.value)}
								className="min-h-20 resize-y"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Footer Actions */}
			<div className="p-4 border-t border-pm-border bg-background flex items-center justify-between gap-4">
				<Button
					variant="ghost"
					onClick={onCancel}
					className="text-muted-foreground"
				>
					{t("tools.password_manager.import.cancel")}
				</Button>
				<div className="flex gap-3">
					<Button
						variant="outline"
						className="text-destructive hover:text-destructive hover:bg-destructive/10"
						onClick={handleSkip}
						disabled={isSaving}
					>
						<X className="w-4 h-4 mr-1.5" />{" "}
						{t("tools.password_manager.import.skip")}
					</Button>
					<Button onClick={handleAccept} disabled={isSaving}>
						<Check className="w-4 h-4 mr-1.5" />
						{isSaving
							? t("tools.password_manager.import.saving")
							: t("tools.password_manager.import.accept_next")}
					</Button>
				</div>
			</div>
		</div>
	);
}
