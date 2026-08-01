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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Check, Info, GitMerge } from "lucide-react";
import type { PasswordItem } from "@/tools/password-manager/types";

type TopLevelStringField = Extract<keyof PasswordItem, "username" | "password" | "url" | "title" | "folderId" | "collectionId" | "notes">;

interface MergeItemsModalProps {
	isOpen: boolean;
	onClose: () => void;
	items: PasswordItem[];
	onMerge: (mergedItem: PasswordItem, originalItemIds: string[]) => void;
}

interface Conflict {
	field: string;
	label: string;
	values: { id: string; value: string; isTopLevel: boolean }[];
}

export function MergeItemsModal({
	isOpen,
	onClose,
	items,
	onMerge,
}: MergeItemsModalProps) {
	const { t } = useTranslation();
	const [conflicts, setConflicts] = useState<Conflict[]>([]);
	const [resolutions, setResolutions] = useState<Record<string, string>>({}); // field -> chosen value id

	useEffect(() => {
		if (isOpen && items.length > 1) {
			// Find conflicts
			const foundConflicts: Conflict[] = [];
			const defaultResolutions: Record<string, string> = {};

			const checkField = (field: string, label: string, isTopLevel: boolean) => {
				const values: { id: string; value: string; isTopLevel: boolean }[] = [];
				const seenValues = new Set<string>();

				items.forEach((item) => {
					let val = "";
					if (isTopLevel) {
						val = item[field as TopLevelStringField] || "";
					} else {
						val = item.metadata?.[field] || item[field as TopLevelStringField] || "";
					}

					if (val && !seenValues.has(val)) {
						seenValues.add(val);
						values.push({ id: item.id, value: val, isTopLevel });
					}
				});

				if (values.length > 1) {
					foundConflicts.push({ field, label, values });
					// Default to the most recently updated item's value if possible, else the first one
					defaultResolutions[field] = values[0].id;
				}
			};
			checkField("title", t("title"), true);
			checkField("folderId", t("tools.password_manager_folder"), true);
			checkField("collectionId", t("tools.password_manager_collection"), true);

			// Dynamically find all metadata fields across all selected items
			const allMetaKeys = new Set<string>();
			items.forEach(i => {
				if (i.metadata) Object.keys(i.metadata).forEach(k => allMetaKeys.add(k));
				// some standard fields might exist at top level due to imports
				if (i.username) allMetaKeys.add("username");
				if (i.password) allMetaKeys.add("password");
				if (i.url) allMetaKeys.add("url");
			});

			allMetaKeys.forEach(key => {
				let label = key.charAt(0).toUpperCase() + key.slice(1);
				if (key === "username") label = t("tools.password_manager_username");
				else if (key === "password") label = t("tools.password_manager_password");
				else if (key === "url") label = t("tools.password_manager_url");
				checkField(key, label, false);
			});

			setConflicts(foundConflicts);
			setResolutions(defaultResolutions);
		}
	}, [isOpen, items, t]);

	const handleMerge = () => {
		if (items.length < 2) return;

		// Sort items by updatedAt descending so we use the most recent as the base
		const sortedItems = [...items].sort((a, b) => {
			const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
			const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
			return dateB - dateA;
		});

		const baseItem = sortedItems[0];
		const mergedItem: PasswordItem = {
			...baseItem,
			metadata: { ...(baseItem.metadata || {}) },
			customFields: [...(baseItem.customFields || [])],
			notes: baseItem.notes || "",
		};

		// Merge non-conflicting fields
		const allFieldsToMerge = new Set<string>();
		sortedItems.forEach(i => {
			if (i.metadata) Object.keys(i.metadata).forEach(k => allFieldsToMerge.add(k));
			if (i.username) allFieldsToMerge.add("username");
			if (i.password) allFieldsToMerge.add("password");
			if (i.url) allFieldsToMerge.add("url");
		});

		sortedItems.forEach((item) => {
			// Merge notes
			if (item.id !== baseItem.id && item.notes && !mergedItem.notes?.includes(item.notes)) {
				mergedItem.notes = mergedItem.notes
					? `${mergedItem.notes}\n\n--- ${t("tools.password_manager_merged_from")} ${item.title} ---\n${item.notes}`
					: item.notes;
			}

			// Merge custom fields
			if (item.customFields) {
				item.customFields.forEach(cf => {
					if (!mergedItem.customFields?.some(mcf => mcf.name === cf.name && mcf.value === cf.value)) {
						mergedItem.customFields?.push({
							id: crypto.randomUUID(),
							name: cf.name,
							value: cf.value,
							type: cf.type
						});
					}
				});
			}
		});

		// Apply non-conflicting missing fields to base item
		const applyIfMissing = (field: string, isTopLevel: boolean) => {
			if (!conflicts.find(c => c.field === field)) {
				const itemWithValue = sortedItems.find(i => isTopLevel ? i[field as TopLevelStringField] : (i.metadata?.[field] || i[field as TopLevelStringField]));
				if (itemWithValue) {
					if (isTopLevel) {
						Object.assign(mergedItem, { [field]: itemWithValue[field as TopLevelStringField] });
					} else {
						mergedItem.metadata![field] = itemWithValue.metadata?.[field] || (itemWithValue[field as TopLevelStringField] as string);
					}
				}
			}
		};

		allFieldsToMerge.forEach(key => applyIfMissing(key, false));
		["title", "folderId", "collectionId"].forEach(key => applyIfMissing(key, true));

		// Apply conflict resolutions
		conflicts.forEach(conflict => {
			const chosenId = resolutions[conflict.field];
			const chosenOption = conflict.values.find(v => v.id === chosenId);
			if (chosenOption) {
				if (conflict.values[0].isTopLevel) {
					mergedItem[conflict.field as TopLevelStringField] = chosenOption.value;
				} else {
					mergedItem.metadata![conflict.field] = chosenOption.value;
				}
			}

			// Add the unchosen ones as custom fields so data isn't lost
			conflict.values.forEach(v => {
				if (v.id !== chosenId && conflict.field !== "folderId" && conflict.field !== "collectionId") {
					mergedItem.customFields?.push({
						id: crypto.randomUUID(),
						name: `${conflict.label} (${t("tools.password_manager_merged_old")})`,
						value: v.value,
						type: conflict.field === "password" ? "password" : "text"
					});
				}
			});
		});

		mergedItem.updatedAt = new Date().toISOString();

		onMerge(mergedItem, items.map(i => i.id));
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-125">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<GitMerge className="w-5 h-5" />
						{t("tools.password_manager_merge_items")}
					</DialogTitle>
					<DialogDescription>
						{t("tools.password_manager_merge_desc")}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[60vh] -mx-6 px-6">
					<div className="space-y-6 pb-4">
						{conflicts.length > 0 ? (
							<div className="space-y-4">
								<div className="flex items-start gap-2 p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-sm">
									<Info className="w-4 h-4 shrink-0 mt-0.5" />
									<p>{t("tools.password_manager_merge_conflict_desc")}</p>
								</div>

								{conflicts.map((conflict) => (
									<div key={conflict.field} className="space-y-2">
										<Label className="font-semibold text-sm">
											{conflict.label} {t("tools.password_manager_conflict")}
										</Label>
										<div className="flex flex-col gap-2">
											{conflict.values.map((v) => (
												<button
													key={v.id}
													type="button"
													onClick={() => setResolutions(prev => ({ ...prev, [conflict.field]: v.id }))}
													className={`flex items-center justify-between w-full overflow-hidden px-4 py-3 rounded-xl border text-left transition-all ${resolutions[conflict.field] === v.id
														? "border-primary bg-primary/5 ring-1 ring-primary/20"
														: "border-border hover:border-primary/50 hover:bg-muted/50"
														}`}
												>
													<span className={`text-sm truncate min-w-0 flex-1 mr-4 ${conflict.field === "password" ? "font-mono" : ""}`}>
														{conflict.field === "password" && resolutions[conflict.field] !== v.id
															? "••••••••"
															: v.value}
													</span>
													{resolutions[conflict.field] === v.id && (
														<Check className="w-4 h-4 text-primary shrink-0" />
													)}
												</button>
											))}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
								<Check className="w-8 h-8 text-green-500" />
								<p>{t("tools.password_manager_merge_no_conflicts")}</p>
							</div>
						)}
					</div>
				</ScrollArea>

				<DialogFooter className="mt-2">
					<Button variant="outline" onClick={onClose}>
						{t("tools.password_manager_cancel")}
					</Button>
					<Button onClick={handleMerge}>
						{t("tools.password_manager_confirm_merge")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
