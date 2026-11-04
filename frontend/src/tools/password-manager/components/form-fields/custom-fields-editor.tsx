import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Plus,
	Trash2,
	Upload,
	X,
	FileText as FileTextIcon,
} from "lucide-react";
import { CUSTOM_FIELD_TYPES } from "@/tools/password-manager/utils/constants";
import type { CustomField } from "@/tools/password-manager/types";

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getFileSizeFromBase64(base64: string | null | undefined): number {
	if (!base64) return 0;
	const data = base64.split(",")[1] ?? base64;
	return Math.round((data.length * 3) / 4);
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES =
	".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg";

function FileUploadButton({
	i,
	updateField,
	labelKey,
}: {
	i: number;
	updateField: (index: number, key: keyof CustomField, val: string) => void;
	labelKey: "choose_file" | "replace_file";
}) {
	const { t } = useTranslation();
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFile(files[0]);
		}
	};

	const handleFile = (file: File) => {
		if (file.size > MAX_FILE_SIZE) {
			toast.add({
				title: t("tools.password_manager.file_too_large"),
				type: "error",
			});
			return;
		}
		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result as string;
			updateField(i, "fileName", file.name);
			updateField(i, "fileContent", content);
			updateField(i, "value", file.name);
		};
		reader.readAsDataURL(file);
	};

	return (
		<>
			<Input
				type="file"
				id={`custom-file-${i}`}
				className="hidden"
				accept={ACCEPTED_FILE_TYPES}
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (!file) return;
					handleFile(file);
				}}
			/>
			<div
				className={`flex items-center justify-center p-3 border border-border rounded-xl transition-colors ${
					isDragging
						? "border-primary bg-primary/10"
						: "border-dashed bg-muted/30"
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<Label
					htmlFor={`custom-file-${i}`}
					className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
				>
					<Upload className="mr-2 h-4 w-4" />
					{t(`tools.password_manager.${labelKey}`)}
				</Label>
			</div>
			<p className="text-xs text-muted-foreground mt-1">
				{t("tools.password_manager.accepted_types", {
					types: ACCEPTED_FILE_TYPES,
					maxSize: formatFileSize(MAX_FILE_SIZE),
				})}
			</p>
		</>
	);
}

interface CustomFieldsEditorProps {
	customFields: CustomField[];
	addField: () => void;
	removeField: (index: number) => void;
	updateField: (index: number, key: keyof CustomField, val: string) => void;
}

export function CustomFieldsEditor({
	customFields,
	addField,
	removeField,
	updateField,
}: CustomFieldsEditorProps) {
	const { t } = useTranslation();

	return (
		<div className="space-y-2 px-5">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">
					{t("tools.password_manager.custom_fields")}
				</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={addField}
				>
					<Plus className="h-3 w-3 mr-1" />
					{t("tools.password_manager.add_field")}
				</Button>
			</div>
			{customFields.map((field, i) => (
				<div key={i} className="flex gap-2 items-start">
					<Input
						placeholder={t("tools.password_manager.field_name")}
						value={field.name}
						onChange={(e) => updateField(i, "name", e.target.value)}
						className="flex-1"
					/>
					<Select
						value={field.type}
						onValueChange={(val) => updateField(i, "type", val!)}
					>
						<SelectTrigger className="w-28">
							<SelectValue>{field.type}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{CUSTOM_FIELD_TYPES.map((ft) => (
								<SelectItem key={ft} value={ft}>
									{ft}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{field.type === "file" ? (
						field.fileName ? (
							<div className="flex-1 flex flex-col gap-2 items-start">
								<div className="flex items-center gap-2 w-full">
									<FileTextIcon className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm text-foreground truncate max-w-37.5">
										{field.fileName}
									</span>
									<span className="text-xs text-muted-foreground">
										{formatFileSize(
											getFileSizeFromBase64(
												field.fileContent,
											),
										)}
									</span>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => {
											updateField(i, "fileName", "");
											updateField(i, "fileContent", "");
											updateField(i, "value", "");
										}}
										aria-label="Remove file"
										className="h-6 w-6 p-0"
									>
										<X className="w-3 h-3 text-red-500" />
									</Button>
								</div>
								<FileUploadButton
									i={i}
									updateField={updateField}
									labelKey="replace_file"
								/>
							</div>
						) : (
							<div className="flex-1 flex items-center gap-2">
								<FileUploadButton
									i={i}
									updateField={updateField}
									labelKey="choose_file"
								/>
							</div>
						)
					) : (
						<Input
							type={
								field.type === "password"
									? "password"
									: field.type === "number"
										? "number"
										: field.type === "color"
											? "color"
											: "text"
							}
							placeholder={t(
								"tools.password_manager.field_value",
							)}
							value={field.value}
							onChange={(e) =>
								updateField(i, "value", e.target.value)
							}
							className={
								field.type === "color"
									? "w-12 h-9 p-1"
									: "flex-1"
							}
						/>
					)}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => removeField(i)}
						className="shrink-0"
					>
						<Trash2 className="h-4 w-4 text-red-500" />
					</Button>
				</div>
			))}
		</div>
	);
}
