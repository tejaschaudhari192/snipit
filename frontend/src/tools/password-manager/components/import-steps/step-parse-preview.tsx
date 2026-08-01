import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type {
	ParsedImportItem,
	DuplicateStrategy,
} from "../../utils/importers/types";
import { AlertCircle, FileX2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Props {
	items: ParsedImportItem[];
	duplicateStrategy: DuplicateStrategy;
	onDuplicateStrategyChange: (val: DuplicateStrategy) => void;
	onBack: () => void;
	onNext: (mode: "bulk" | "one_by_one") => void;
}

export default function StepParsePreview({
	items,
	duplicateStrategy,
	onDuplicateStrategyChange,
	onBack,
	onNext,
}: Props) {
	const { t } = useTranslation();
	const [mode, setMode] = useState<"bulk" | "one_by_one">("bulk");

	const duplicatesCount = items.filter((i) => i.isDuplicate).length;
	const skippedCount = items.filter((i) => i.isSkipped).length;
	const readyCount = items.length - duplicatesCount - skippedCount;

	const previewItems = items.slice(0, 10); // Show max 10 in preview

	const obfuscate = (str?: string) => {
		if (!str) return "";
		if (str.length <= 2) return "***";
		return str.slice(0, 2) + "***";
	};

	return (
		<div className="p-6 flex flex-col gap-6">
			<div className="flex items-center gap-4 text-sm bg-muted/50 p-4 rounded-lg">
				<div className="flex-1">
					<div className="font-semibold text-lg">
						{t("tools.password_manager.import.items_found", {
							count: items.length,
						})}
					</div>
					<div className="text-muted-foreground mt-1 flex gap-3">
						<span className="text-emerald-600 dark:text-emerald-400 font-medium">
							{readyCount}{" "}
							{t("tools.password_manager.import.ready")}
						</span>
						{duplicatesCount > 0 && (
							<span className="text-amber-600 dark:text-amber-400 font-medium">
								{duplicatesCount}{" "}
								{t("tools.password_manager.import.duplicates")}
							</span>
						)}
						{skippedCount > 0 && (
							<span>
								{skippedCount}{" "}
								{t("tools.password_manager.import.archived")}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="border border-pm-border rounded-lg overflow-hidden text-sm">
				<Table>
					<TableHeader className="bg-muted/50">
						<TableRow>
							<TableHead className="w-[40%]">Title</TableHead>
							<TableHead className="w-[40%]">Username</TableHead>
							<TableHead className="w-[20%]">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{previewItems.map((item, i) => (
							<TableRow
								key={i}
								className={item.isSkipped ? "opacity-50" : ""}
							>
								<TableCell className="font-medium truncate max-w-50">
									{item.mapped.title}
								</TableCell>
								<TableCell className="truncate max-w-50">
									{obfuscate(item.mapped.username)}
								</TableCell>
								<TableCell>
									{item.isSkipped ? (
										<span className="flex items-center gap-1 text-muted-foreground">
											<FileX2 className="w-3.5 h-3.5" />{" "}
											{t(
												"tools.password_manager.import.skipped",
											)}
										</span>
									) : item.isDuplicate ? (
										<span className="flex items-center gap-1 text-amber-600">
											<AlertCircle className="w-3.5 h-3.5" />{" "}
											{t(
												"tools.password_manager.import.duplicate",
											)}
										</span>
									) : (
										<span className="text-emerald-600">
											{t(
												"tools.password_manager.import.ready",
											)}
										</span>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{items.length > 10 && (
					<div className="p-2 text-center text-xs text-muted-foreground bg-muted/20">
						{t("tools.password_manager.import.more_items", {
							count: items.length - 10,
						})}
					</div>
				)}
			</div>

			<div className="grid sm:grid-cols-2 gap-6">
				<div className="space-y-3">
					<h3 className="text-sm font-semibold text-foreground">
						{t("tools.password_manager.import.duplicate_handling")}
					</h3>
					<RadioGroup
						value={duplicateStrategy}
						onValueChange={(val: DuplicateStrategy) =>
							onDuplicateStrategyChange(val)
						}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="ask" id="d-ask" />
							<Label
								htmlFor="d-ask"
								className="text-sm cursor-pointer font-normal"
							>
								{t("tools.password_manager.import.ask_each")}
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="skip" id="d-skip" />
							<Label
								htmlFor="d-skip"
								className="text-sm cursor-pointer font-normal"
							>
								{t("tools.password_manager.import.skip_all")}
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="overwrite" id="d-over" />
							<Label
								htmlFor="d-over"
								className="text-sm cursor-pointer font-normal"
							>
								{t("tools.password_manager.import.overwrite")}
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="keep_both" id="d-keep" />
							<Label
								htmlFor="d-keep"
								className="text-sm cursor-pointer font-normal"
							>
								{t("tools.password_manager.import.keep_both")}
							</Label>
						</div>
					</RadioGroup>
				</div>

				<div className="space-y-3">
					<h3 className="text-sm font-semibold text-foreground">
						{t("tools.password_manager.import.mode")}
					</h3>
					<RadioGroup
						value={mode}
						onValueChange={(val: "bulk" | "one_by_one") =>
							setMode(val)
						}
					>
						<div
							className="flex items-start space-x-3 bg-muted/30 p-3 rounded-lg border border-pm-border cursor-pointer hover:bg-muted/50 transition-colors"
							onClick={() => setMode("bulk")}
						>
							<RadioGroupItem
								value="bulk"
								id="m-bulk"
								className="mt-1"
							/>
							<Label
								htmlFor="m-bulk"
								className="text-sm cursor-pointer w-full leading-none"
							>
								<div className="font-medium mb-1">
									{t(
										"tools.password_manager.import.all_at_once",
									)}
								</div>
								<div className="text-muted-foreground text-xs leading-normal">
									{t(
										"tools.password_manager.import.all_at_once_desc",
									)}
								</div>
							</Label>
						</div>
						<div
							className="flex items-start space-x-3 bg-muted/30 p-3 rounded-lg border border-pm-border cursor-pointer mt-2 hover:bg-muted/50 transition-colors"
							onClick={() => setMode("one_by_one")}
						>
							<RadioGroupItem
								value="one_by_one"
								id="m-one"
								className="mt-1"
							/>
							<Label
								htmlFor="m-one"
								className="text-sm cursor-pointer w-full leading-none"
							>
								<div className="font-medium mb-1">
									{t(
										"tools.password_manager.import.one_by_one",
									)}
								</div>
								<div className="text-muted-foreground text-xs leading-normal">
									{t(
										"tools.password_manager.import.one_by_one_desc",
									)}
								</div>
							</Label>
						</div>
					</RadioGroup>
				</div>
			</div>

			<div className="flex justify-between pt-4 border-t border-pm-border">
				<Button variant="outline" onClick={onBack}>
					{t("common_back")}
				</Button>
				<Button onClick={() => onNext(mode)}>
					{t("tools.password_manager.import.start")}
				</Button>
			</div>
		</div>
	);
}
