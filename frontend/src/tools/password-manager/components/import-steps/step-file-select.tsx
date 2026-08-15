import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ParsedImportItem } from "../../utils/importers/types";
import { parseChromeCSV } from "../../utils/importers/chrome-csv-parser";
import { parseEnpassJSON } from "../../utils/importers/enpass-json-parser";
import { normalizeImportItem } from "../../utils/importers/normalizer";
import { useAppSelector } from "../../store";
import { UploadCloud, FileType } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Props {
	onNext: (items: ParsedImportItem[]) => void;
	onCancel: () => void;
}

export default function StepFileSelect({ onNext, onCancel }: Props) {
	const { t } = useTranslation();
	const [sourceApp, setSourceApp] = useState<"chrome" | "enpass">("chrome");
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const existingItems = useAppSelector(
		(state) => state.passwordManager.personalItems,
	);

	const handleFile = async (file: File) => {
		setError(null);
		setLoading(true);

		try {
			const text = await file.text();
			let parsed: ParsedImportItem[] = [];

			if (sourceApp === "chrome") {
				if (!file.name.endsWith(".csv")) {
					throw new Error(
						t("tools.password_manager.import.chrome_export_desc"),
					);
				}
				parsed = parseChromeCSV(text);
			} else if (sourceApp === "enpass") {
				if (!file.name.endsWith(".json")) {
					throw new Error(
						t("tools.password_manager.import.enpass_export_desc"),
					);
				}
				parsed = parseEnpassJSON(text);
			}

			if (parsed.length === 0) {
				throw new Error(t("tools.password_manager.import.no_items"));
			}

			// Normalize and check duplicates
			const normalized = parsed.map((item) =>
				normalizeImportItem(item, existingItems),
			);
			onNext(normalized);
		} catch (e) {
			setError((e as Error).message || "Failed to read file.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-6 flex flex-col gap-6">
			<div className="flex gap-4">
				<div className="flex-1 space-y-2">
					<Label className="text-sm font-medium">
						{t("tools.password_manager.import.source_app")}
					</Label>
					<Select
						value={sourceApp}
						onValueChange={(val: "chrome" | "enpass" | null) =>
							setSourceApp(val!)
						}
					>
						<SelectTrigger>
							<SelectValue>
								{sourceApp === "chrome"
									? t(
											"tools.password_manager.import.chrome_csv",
										)
									: t(
											"tools.password_manager.import.enpass_json",
										)}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="chrome">
								{t("tools.password_manager.import.chrome_csv")}
							</SelectItem>
							<SelectItem value="enpass">
								{t("tools.password_manager.import.enpass_json")}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex-1 space-y-2">
					<Label className="text-sm font-medium">
						{t("tools.password_manager.import.file_type")}
					</Label>
					<div className="h-10 px-3 flex items-center border border-pm-border rounded-md bg-muted/50 text-muted-foreground">
						{sourceApp === "chrome" ? ".csv" : ".json"}
					</div>
				</div>
			</div>

			<div
				className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-colors ${
					isDragging
						? "border-primary bg-primary/5"
						: "border-pm-border hover:border-primary/50"
				}`}
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setIsDragging(false);
					const file = e.dataTransfer.files[0];
					if (file) handleFile(file);
				}}
				onClick={() => fileInputRef.current?.click()}
			>
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					accept={sourceApp === "chrome" ? ".csv" : ".json"}
					onChange={(e) => {
						const file = e.target.files?.[0];
						if (file) handleFile(file);
					}}
				/>
				<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
					{sourceApp === "chrome" ? (
						<FileType className="w-6 h-6" />
					) : (
						<UploadCloud className="w-6 h-6" />
					)}
				</div>
				<div className="text-center">
					<p className="font-medium">
						{t("tools.password_manager.import.upload")}
					</p>
					<p className="text-sm text-muted-foreground mt-1">
						{sourceApp === "chrome"
							? t(
									"tools.password_manager.import.chrome_export_desc",
								)
							: t(
									"tools.password_manager.import.enpass_export_desc",
								)}
					</p>
				</div>
			</div>

			{error && (
				<div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
					{error}
				</div>
			)}

			<div className="flex justify-end gap-3 pt-4 border-t border-pm-border">
				<Button variant="outline" onClick={onCancel}>
					{t("tools.password_manager.import.cancel")}
				</Button>
				<Button
					disabled={loading}
					className="pointer-events-none opacity-50"
				>
					{loading
						? t("tools.password_manager.import.processing")
						: t("tools.password_manager.import.next")}
				</Button>
			</div>
		</div>
	);
}
