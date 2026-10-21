import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileJson, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { PasswordItem, Folder } from "../types";
import { downloadVaultExportJson } from "../utils/export-vault";

interface ExportModalProps {
	isOpen: boolean;
	onClose: () => void;
	items: PasswordItem[];
	folders: Folder[];
	preselectedItems?: PasswordItem[];
}

export function ExportModal({
	isOpen,
	onClose,
	items,
	folders,
	preselectedItems,
}: ExportModalProps) {
	const { t } = useTranslation();
	const hasPreselection = !!(preselectedItems && preselectedItems.length > 0);

	const [exportScope, setExportScope] = useState<"all" | "selected">(
		hasPreselection ? "selected" : "all",
	);
	const [includeFolders, setIncludeFolders] = useState(true);
	const [confirmedRisk, setConfirmedRisk] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	const itemsToExport =
		exportScope === "selected" && hasPreselection
			? preselectedItems
			: items;

	const handleExport = () => {
		if (itemsToExport.length === 0) {
			toast.add({
				title: t("tools.password_manager.export.no_items"),
				type: "error",
			});
			return;
		}

		if (!confirmedRisk) {
			toast.add({
				title: t("tools.password_manager.export.confirm_warning"),
				type: "warning",
			});
			return;
		}

		try {
			setIsExporting(true);
			const foldersToExport = includeFolders ? folders : [];
			downloadVaultExportJson(itemsToExport, foldersToExport);

			toast.add({
				title: t("tools.password_manager.export.success_title"),
				description: t("tools.password_manager.export.success_desc", {
					count: itemsToExport.length,
					s: itemsToExport.length > 1 ? "s" : "",
				}),
				type: "success",
			});
			onClose();
		} catch (error) {
			console.error("Export error:", error);
			toast.add({
				title: t("tools.password_manager.export.failed_title"),
				type: "error",
			});
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md border-border bg-background">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-lg bg-primary/10 text-primary">
							<FileJson className="h-5 w-5" />
						</div>
						<DialogTitle className="text-lg font-bold">
							{t("tools.password_manager.export.title")}
						</DialogTitle>
					</div>
					<DialogDescription className="text-xs text-muted-foreground pt-1">
						{t("tools.password_manager.export.desc")}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					{/* Export Scope */}
					{hasPreselection && (
						<div className="space-y-2">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								{t("tools.password_manager.export.scope")}
							</Label>
							<RadioGroup
								value={exportScope}
								onValueChange={(val) =>
									setExportScope(val as "all" | "selected")
								}
								className="grid grid-cols-2 gap-2"
							>
								<Label
									htmlFor="scope-selected"
									className={`flex flex-col gap-1 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
										exportScope === "selected"
											? "border-primary bg-primary/5 text-foreground"
											: "border-border text-muted-foreground hover:bg-muted/50"
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="font-semibold">
											{t(
												"tools.password_manager.export.selected_items",
											)}
										</span>
										<RadioGroupItem
											value="selected"
											id="scope-selected"
										/>
									</div>
									<span className="text-[11px] text-muted-foreground">
										{preselectedItems.length} item
										{preselectedItems.length > 1 ? "s" : ""}
									</span>
								</Label>

								<Label
									htmlFor="scope-all"
									className={`flex flex-col gap-1 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
										exportScope === "all"
											? "border-primary bg-primary/5 text-foreground"
											: "border-border text-muted-foreground hover:bg-muted/50"
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="font-semibold">
											{t(
												"tools.password_manager.export.entire_vault",
											)}
										</span>
										<RadioGroupItem
											value="all"
											id="scope-all"
										/>
									</div>
									<span className="text-[11px] text-muted-foreground">
										{items.length} item
										{items.length > 1 ? "s" : ""}
									</span>
								</Label>
							</RadioGroup>
						</div>
					)}

					{/* Format Preview Box */}
					<div className="rounded-xl border border-border p-3.5 bg-muted/30 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-xs text-primary">
								JSON
							</div>
							<div>
								<div className="text-xs font-semibold text-foreground">
									Snipit Vault JSON (.json)
								</div>
								<div className="text-[11px] text-muted-foreground">
									{itemsToExport.length} item
									{itemsToExport.length > 1 ? "s" : ""}{" "}
									{includeFolders && folders.length > 0
										? `• ${folders.length} folder${folders.length > 1 ? "s" : ""}`
										: ""}
								</div>
							</div>
						</div>
						<ShieldCheck className="h-4 w-4 text-primary" />
					</div>

					{/* Include Folders Checkbox */}
					{folders.length > 0 && (
						<div className="flex items-center space-x-2 pt-1">
							<Checkbox
								id="include-folders"
								checked={includeFolders}
								onCheckedChange={(checked) =>
									setIncludeFolders(!!checked)
								}
							/>
							<Label
								htmlFor="include-folders"
								className="text-xs cursor-pointer text-muted-foreground font-normal"
							>
								{t(
									"tools.password_manager.export.include_folders",
								)}
							</Label>
						</div>
					)}

					{/* Plaintext Warning Box */}
					<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex gap-2.5 items-start text-amber-500">
						<AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
						<div className="space-y-1">
							<div className="text-xs font-semibold">
								{t(
									"tools.password_manager.export.security_warning_title",
								)}
							</div>
							<div className="text-[11px] leading-relaxed text-amber-500/90">
								{t(
									"tools.password_manager.export.security_warning_desc",
								)}
							</div>
						</div>
					</div>

					{/* Acknowledgment Checkbox */}
					<div className="flex items-center space-x-2 pt-1">
						<Checkbox
							id="confirm-risk"
							checked={confirmedRisk}
							onCheckedChange={(checked) =>
								setConfirmedRisk(!!checked)
							}
						/>
						<Label
							htmlFor="confirm-risk"
							className="text-xs cursor-pointer font-medium text-foreground leading-tight"
						>
							{t("tools.password_manager.export.acknowledge")}
						</Label>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0 pt-2">
					<Button variant="outline" size="sm" onClick={onClose}>
						{t("tools.password_manager.cancel", {
							defaultValue: "Cancel",
						})}
					</Button>
					<Button
						size="sm"
						onClick={handleExport}
						disabled={
							!confirmedRisk ||
							itemsToExport.length === 0 ||
							isExporting
						}
						className="gap-2"
					>
						<Download className="h-4 w-4" />
						{t("tools.password_manager.export.download_btn")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
