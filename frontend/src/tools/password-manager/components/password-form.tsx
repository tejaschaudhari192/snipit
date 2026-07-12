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
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/tools/password-manager/store";
import { selectVault } from "@/tools/password-manager/store/password-slice";
import { Upload } from "lucide-react";
import type { PasswordItem, CustomField } from "../types";
import { getFieldsForType } from "../utils/item-types";
export interface PasswordFormProps {
	onAdd: (item: PasswordItem) => void;
	editItem?: PasswordItem | null;
}

import {
	SchemaFieldsEditor,
	type SchemaField,
} from "./form-fields/schema-fields-editor";
import { CustomFieldsEditor } from "./form-fields/custom-fields-editor";

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
	const [metadata, setMetadata] = useState<Record<string, string>>(
		editItem?.metadata ?? {},
	);

	const vault = useAppSelector(selectVault);

	// Populate form when editing
	useEffect(() => {
		if (editItem) {
			setTitle(editItem.title ?? "");
			setNotes(editItem.notes ?? "");
			setItemType(editItem.itemType ?? "login");
			setFolderId(editItem.folderId ?? "none");
			setCustomFields(editItem.customFields ?? []);
			setMetadata(editItem.metadata ?? {});
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
		onAdd({
			id: editItem?.id ?? crypto.randomUUID(),
			title: title.trim(),
			...(notes.trim() && { notes: notes.trim() }),
			...(folderId !== "none" && { folderId }),
			...(itemType && itemType !== "other" && { itemType }),
			...(customFields.filter((f) => f.name.trim()).length > 0 && {
				customFields: customFields.filter((f) => f.name.trim()),
			}),
			...(Object.keys(metadata).length > 0 && { metadata }),
			createdAt: editItem?.createdAt ?? now,
			updatedAt: now,
		} as PasswordItem);
		resetForm();
	};

	const addField = () => {
		setCustomFields([
			...customFields,
			{ name: "", type: "text", value: "" },
		]);
	};

	const removeField = (index: number) => {
		setCustomFields(customFields.filter((_, i) => i !== index));
	};

	const updateField = (
		index: number,
		key: keyof CustomField,
		val: string,
	) => {
		const updated = [...customFields];
		if (key === "type") {
			updated[index].type = val as CustomField["type"];
		} else if (key === "name") {
			updated[index].name = val;
		} else if (key === "value") {
			updated[index].value = val;
		}
		setCustomFields(updated);
	};

	const updateMetadata = (key: string, value: string) => {
		setMetadata((prev) => ({ ...prev, [key]: value }));
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

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
		reader.readAsText(file);
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
								"tools.password_manager_title_placeholder",
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
							onValueChange={(val: string) => {
								setItemType(val as PasswordItem["itemType"]);
								// Keep metadata instead of clearing it, so user doesn't lose data on misclick
							}}
						>
							<SelectTrigger className="w-full bg-background border-border rounded-xl">
								<SelectValue
									placeholder={t(
										"tools.password_manager_type_login",
									)}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="login">
									{t("tools.password_manager_type_login")}
								</SelectItem>
								<SelectItem value="card">
									{t("tools.password_manager_type_card")}
								</SelectItem>
								<SelectItem value="apikey">
									{t("tools.password_manager_type_apikey")}
								</SelectItem>
								<SelectItem value="passkey">
									{t("tools.password_manager_type_passkey")}
								</SelectItem>
								<SelectItem value="credfile">
									{t("tools.password_manager_type_credfile")}
								</SelectItem>
								<SelectItem value="note">
									{t("tools.password_manager_type_note")}
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{vault?.folders && vault.folders.length > 0 && (
						<div className="space-y-1.5 flex-1">
							<Label className="text-xs text-muted-foreground">
								Folder
							</Label>
							<Select
								value={folderId}
								onValueChange={(val: string) =>
									setFolderId(val)
								}
							>
								<SelectTrigger className="w-full bg-background border-border rounded-xl">
									<SelectValue placeholder="No Folder" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">
										No category
									</SelectItem>
									{vault.folders.map(
										(f: { id: string; name: string }) => (
											<SelectItem key={f.id} value={f.id}>
												{f.name}
											</SelectItem>
										),
									)}
								</SelectContent>
							</Select>
						</div>
					)}
				</div>

				{/* Details Card */}
				<Card className="shadow-sm border-border">
					<CardHeader className="px-4 pt-4 pb-2">
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							{t("tools.password_manager_details_title")}
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4 space-y-4">
						{itemType === "credfile" && (
							<div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30 border-dashed">
								<div className="space-y-1">
									<Label className="text-sm font-medium">
										{t(
											"tools.password_manager_upload_file",
										)}
									</Label>
									<p className="text-xs text-muted-foreground">
										{t(
											"tools.password_manager_upload_file_desc",
										)}
									</p>
								</div>
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
										{t(
											"tools.password_manager_choose_file",
										)}
									</Label>
								</div>
							</div>
						)}
						{/* Dynamic Schema Fields */}
						<SchemaFieldsEditor
							schemaFields={schemaFields as SchemaField[]}
							metadata={metadata}
							updateMetadata={updateMetadata}
						/>

						{/* Global Notes */}
						<div className="space-y-1.5 pt-2">
							<Label className="text-xs text-muted-foreground">
								{t("tools.password_manager_notes_placeholder")}
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
