import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/tools/password-manager/store";
import { selectMergedFolders } from "../store/password-slice";
import { Upload, FileText as FileTextIcon, X } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { PasswordItem, CustomField } from "../types";
import { getFieldsForType } from "../utils/item-types";
import { FolderModal } from "./folder-modal";
import { useFolderMutations } from "../hooks/use-folder-mutations";
import { UI_DEFAULTS, ITEM_TYPE_OPTIONS } from "../utils/constants";
import { OptionDisplay } from "@/components/common/option-display";
export interface PasswordFormProps {
	onAdd: (item: PasswordItem) => void;
	editItem?: PasswordItem | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

import {
	SchemaFieldsEditor,
	type SchemaField,
} from "./form-fields/schema-fields-editor";
import { CustomFieldsEditor } from "./form-fields/custom-fields-editor";
import { CreditCardFormEditor } from "./form-fields/credit-card-form-editor";

export default function PasswordForm({ onAdd, editItem }: PasswordFormProps) {
	const { t } = useTranslation();
	const [title, setTitle] = useState("");
	const [notes, setNotes] = useState("");
	const [itemType, setItemType] = useState<PasswordItem["itemType"]>(
		editItem?.itemType ?? "login",
	);
	const [folderId, setFolderId] = useState<string>(
		editItem?.folderId ?? "none",
	);
	const [customFields, setCustomFields] = useState<CustomField[]>(
		editItem?.customFields ?? [],
	);
	const [metadata, setMetadata] = useState<Record<string, string>>(() => {
		const meta = { ...(editItem?.metadata ?? {}) };
		if (editItem?.username) meta.username = editItem.username;
		if (editItem?.password) meta.password = editItem.password;
		if (editItem?.url) meta.url = editItem.url;
		return meta;
	});

	// --- NEW: Drag and Drop State/Handlers ---
	const [isDragging, setIsDragging] = useState(false);

	const handleFiles = (files: FileList | File) => {
		const file = files instanceof File ? files : files[0];
		if (!file) return;

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
			setMetadata((prev) => ({
				...prev,
				fileName: file.name,
				fileContent: content,
			}));
			if (!title) {
				setTitle(file.name);
			}
		};
		reader.readAsDataURL(file);
	};

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
		handleFiles(files);
	};
	// ------------------------------------------

	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const { createFolder } = useFolderMutations();

	const folders = useAppSelector(selectMergedFolders) || [];

	// Populate form when editing
	useEffect(() => {
		if (editItem) {
			setTitle(editItem.title ?? "");
			setNotes(editItem.notes ?? "");
			setItemType(editItem.itemType ?? "login");
			setFolderId(editItem.folderId ?? "none");
			setCustomFields(editItem.customFields ?? []);
			const meta = { ...(editItem.metadata ?? {}) };
			if (editItem.username) meta.username = editItem.username;
			if (editItem.password) meta.password = editItem.password;
			if (editItem.url) meta.url = editItem.url;
			setMetadata(meta);
		} else {
			resetForm();
		}
	}, [editItem]);

	const resetForm = () => {
		setTitle("");
		setNotes("");
		setItemType("login");
		setFolderId("none");
		setCustomFields([]);
		setMetadata({});
	};

	const handleSubmit = () => {
		if (!title) return;
		const now = new Date().toISOString();
		const selectedFolder =
			folderId !== "none"
				? folders.find(
						(f: { id: string; collectionId?: string }) =>
							f.id === folderId,
					)
				: null;

		// Extract root fields from metadata
		const rootFields = {
			...(metadata.username && { username: metadata.username }),
			...(metadata.password && { password: metadata.password }),
			...(metadata.url && { url: metadata.url }),
		};

		// Remove root fields from metadata before saving
		const cleanMetadata = { ...metadata };
		delete cleanMetadata.username;
		delete cleanMetadata.password;
		delete cleanMetadata.url;

		onAdd({
			id: editItem?.id ?? crypto.randomUUID(),
			title: title.trim(),
			...(notes.trim() && { notes: notes.trim() }),
			...rootFields,
			...(folderId !== "none" && { folderId }),
			...(selectedFolder?.collectionId && {
				collectionId: selectedFolder.collectionId,
			}),
			...(itemType && itemType !== "other" && { itemType }),
			...(customFields.filter((f) => f.name.trim()).length > 0 && {
				customFields: customFields.filter((f) => f.name.trim()),
			}),
			...(Object.keys(cleanMetadata).length > 0 && {
				metadata: cleanMetadata,
			}),
			createdAt: editItem?.createdAt ?? now,
			updatedAt: now,
		} as PasswordItem);
		resetForm();
	};

	const addField = () => {
		setCustomFields([
			...customFields,
			{ id: crypto.randomUUID(), name: "", type: "text", value: "" },
		]);
	};

	const removeField = (index: number) => {
		setCustomFields(customFields.filter((_, i) => i !== index));
	};

	const updateField = (
		index: number,
		key: keyof CustomField,
		val: string | File,
	) => {
		const updated = [...customFields];
		if (key === "type") {
			updated[index].type = val as CustomField["type"];
		} else if (key === "name") {
			updated[index].name = val as string;
		} else if (key === "value") {
			updated[index].value = val as string;
		} else if (key === "fileName") {
			updated[index].fileName = val as string;
		} else if (key === "fileContent") {
			updated[index].fileContent = val as string;
		}
		setCustomFields(updated);
	};

	const updateMetadata = (key: string, value: string) => {
		setMetadata((prev) => ({ ...prev, [key]: value }));
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		handleFiles(file);
	};

	const schemaFields = getFieldsForType(itemType || "login");

	return (
		<form
			id="password-form"
			className="pb-8"
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<div className="px-5 pt-6 pb-2">
				{/* Title */}
				<div className="flex items-start gap-4">
					<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
						<span className="text-primary text-2xl font-bold">
							{title ? title.substring(0, 2).toUpperCase() : "?"}
						</span>
					</div>
					<div className="min-w-0 flex-1 space-y-3 pt-1">
						<Input
							required
							placeholder={t(
								"tools.password_manager.title_placeholder",
							)}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							autoComplete="off"
							className="text-xl font-bold h-8 bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary px-0"
						/>
					</div>
				</div>
			</div>

			<div className="p-5 space-y-5">
				{/* Type & Category Selections */}
				<div className="flex gap-3 pb-2">
					<div className="space-y-1.5 flex-1">
						<Label className="text-xs text-muted-foreground">
							Type
						</Label>
						<Select
							value={itemType}
							onValueChange={(val: string | null) => {
								setItemType(val as PasswordItem["itemType"]);
								// Keep metadata instead of clearing it, so user doesn't lose data on misclick
							}}
						>
							<SelectTrigger className="w-full bg-background border-border rounded-xl capitalize">
								<SelectValue>
									{(() => {
										const opt = ITEM_TYPE_OPTIONS.find(
											(o) => o.id === itemType,
										);
										return opt ? (
											<OptionDisplay
												icon={opt.icon}
												label={t(opt.label)}
											/>
										) : null;
									})()}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{ITEM_TYPE_OPTIONS.map((opt) => (
									<SelectItem key={opt.id} value={opt.id}>
										<OptionDisplay
											icon={opt.icon}
											label={t(opt.label)}
										/>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5 flex-1">
						<Label className="text-xs text-muted-foreground">
							Folder
						</Label>
						<Select
							value={folderId}
							onValueChange={(val: string | null) => {
								if (val === "new_folder") {
									setFolderModalOpen(true);
								} else {
									setFolderId(val!);
								}
							}}
						>
							<SelectTrigger className="w-full bg-background border-border rounded-xl">
								<SelectValue placeholder="No Folder">
									{folderId === "new_folder"
										? "+ Create folder"
										: folderId === "none" || !folderId
											? t(
													"tools.password_manager.no_folder",
												)
											: folders.find(
													(f: {
														id: string;
														name: string;
													}) => f.id === folderId,
												)?.name ||
												t(
													"tools.password_manager.no_folder",
												)}
								</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">
									{t("tools.password_manager.no_folder")}
								</SelectItem>
								{folders.map(
									(f: { id: string; name: string }) => (
										<SelectItem key={f.id} value={f.id}>
											{f.name}
										</SelectItem>
									),
								)}
								<SelectItem
									value="new_folder"
									className="text-primary font-medium"
								>
									+ Create folder
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Details Card */}
				<Card className="shadow-sm border-border gap-0 py-0 overflow-hidden">
					<CardHeader className="px-4 py-3 bg-muted/20 border-b border-border/40">
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							{t("tools.password_manager.details_title")}
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 py-4 space-y-4">
						{itemType === "credfile" && (
							<div
								className={`flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30 border-dashed transition-colors ${
									isDragging
										? "border-primary bg-primary/10"
										: ""
								}`}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
							>
								{metadata.fileName ? (
									<div className="flex items-center gap-2 w-full">
										<FileTextIcon className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm text-foreground truncate max-w-50">
											{metadata.fileName}
										</span>
										<span className="text-xs text-muted-foreground">
											{formatFileSize(
												getFileSizeFromBase64(
													metadata.fileContent,
												),
											)}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => {
												setMetadata((prev) => {
													const rest = { ...prev };
													delete rest.fileName;
													delete rest.fileContent;
													return rest;
												});
											}}
											aria-label="Remove file"
											className="h-6 w-6 p-0"
										>
											<X className="w-3 h-3 text-red-500" />
										</Button>
									</div>
								) : (
									<div className="space-y-1">
										<Label className="text-sm font-medium">
											{t(
												"tools.password_manager.upload_file",
											)}
										</Label>
										<p className="text-xs text-muted-foreground">
											{t(
												"tools.password_manager.upload_file_desc",
											)}
										</p>
									</div>
								)}
								<div>
									<Input
										type="file"
										id="credfile-upload"
										className="hidden"
										onChange={handleFileUpload}
									/>
									<Label
										htmlFor="credfile-upload"
										className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3"
									>
										<Upload className="mr-2 h-4 w-4" />
										{metadata.fileName
											? t(
													"tools.password_manager.replace_file",
												)
											: t(
													"tools.password_manager.choose_file",
												)}
									</Label>
								</div>
							</div>
						)}
						{/* Dynamic Schema Fields or Credit Card Editor */}
						{itemType === "card" ? (
							<CreditCardFormEditor
								metadata={metadata}
								updateMetadata={updateMetadata}
								bankName={title}
							/>
						) : (
							<SchemaFieldsEditor
								schemaFields={schemaFields as SchemaField[]}
								metadata={metadata}
								updateMetadata={updateMetadata}
							/>
						)}

						{/* Global Notes */}
						<div className="space-y-1.5 pt-2">
							<Label className="text-xs text-muted-foreground">
								{t("tools.password_manager.notes_placeholder")}
							</Label>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="bg-background rounded-xl border border-border min-h-25"
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			<FolderModal
				open={folderModalOpen}
				onOpenChange={setFolderModalOpen}
				mode="create"
				initialFolderName=""
				initialFolderColor={UI_DEFAULTS.FOLDER_COLOR}
				onSave={(name, color) => {
					createFolder(name, color);
					setFolderModalOpen(false);
					// Since we don't return the ID from createFolder synchronously and it generates one,
					// the folder will appear in the list asynchronously. We could just leave folderId as "none" for now,
					// or we can just let the user select it once it appears.
				}}
				onDelete={() => {}}
			/>

			{/* Custom Fields */}
			<CustomFieldsEditor
				customFields={customFields}
				addField={addField}
				removeField={removeField}
				updateField={updateField}
			/>
		</form>
	);
}
