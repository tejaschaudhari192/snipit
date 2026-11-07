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
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/tools/password-manager/store";
import { selectMergedFolders } from "../store/password-slice";
import { selectUserId } from "../store/selectors";
import type { PasswordItem, CustomField, ItemAttachment } from "../types";
import { getFieldsForType } from "../utils/item-types";
import { FolderModal } from "./folder-modal";
import { useFolderMutations } from "../hooks/use-folder-mutations";
import { UI_DEFAULTS, ITEM_TYPE_OPTIONS } from "../utils/constants";
import { OptionDisplay } from "@/components/common/option-display";
import { Folder } from "lucide-react";
import { ItemAvatar } from "./item-avatar";

export interface PasswordFormProps {
	onAdd: (item: PasswordItem) => void;
	editItem?: PasswordItem | null;
}

import {
	SchemaFieldsEditor,
	type SchemaField,
} from "./form-fields/schema-fields-editor";
import { CustomFieldsEditor } from "./form-fields/custom-fields-editor";
import { AttachmentsEditor } from "./form-fields/attachments-editor";
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
	const userId = useAppSelector(selectUserId);
	const [customFields, setCustomFields] = useState<CustomField[]>(
		() => editItem?.customFields ?? [],
	);
	const [attachments, setAttachments] = useState<ItemAttachment[]>(
		() => editItem?.attachments ?? [],
	);
	const [metadata, setMetadata] = useState<Record<string, string>>(() => {
		const meta = { ...(editItem?.metadata ?? {}) };
		if (editItem?.username) meta.username = editItem.username;
		if (editItem?.password) meta.password = editItem.password;
		if (editItem?.url) meta.url = editItem.url;
		return meta;
	});

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
			setAttachments(editItem.attachments ?? []);
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
		setAttachments([]);
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

		const item: PasswordItem = {
			id: editItem?.id || crypto.randomUUID(),
			title,
			notes,
			itemType,
			folderId: folderId !== "none" ? folderId : undefined,
			collectionId: selectedFolder?.collectionId,
			customFields,
			attachments,
			metadata,
			createdAt: editItem?.createdAt || now,
			updatedAt: now,
			...rootFields,
		};
		onAdd(item);
	};

	const addField = () => {
		setCustomFields((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				name: "",
				type: "text",
				value: "",
			},
		]);
	};

	const removeField = (index: number) => {
		setCustomFields((prev) => prev.filter((_, i) => i !== index));
	};

	const updateField = (
		index: number,
		key: keyof CustomField,
		val: string,
	) => {
		setCustomFields((prev) =>
			prev.map((field, i) =>
				i === index ? { ...field, [key]: val } : field,
			),
		);
	};

	const handleAddAttachment = (att: ItemAttachment) => {
		setAttachments((prev) => [...prev, att]);
	};

	const handleRemoveAttachment = (id: string) => {
		setAttachments((prev) => prev.filter((a) => a.id !== id));
	};

	const handleReplaceAttachment = (id: string, newAtt: ItemAttachment) => {
		setAttachments((prev) => prev.map((a) => (a.id === id ? newAtt : a)));
	};

	const updateMetadata = (key: string, value: string) => {
		setMetadata((prev) => ({ ...prev, [key]: value }));
	};

	const schemaFields = getFieldsForType(itemType || "login");

	return (
		<form
			id="password-form"
			className="pb-10 space-y-6"
			onSubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			{/* Top Header Section: Avatar + Title Input + Selectors */}
			<div className="px-6 pt-5 pb-1 space-y-4">
				<div className="flex items-start gap-4">
					<ItemAvatar
						item={
							{
								id: editItem?.id || "",
								title: title || editItem?.title || "New",
								itemType,
								url: metadata.url || metadata.website,
								metadata,
							} as PasswordItem
						}
						className="w-14 h-14 flex shrink-0"
						imgClassName="w-14 h-14 object-contain rounded-2xl"
						fallbackClassName="w-14 h-14 rounded-2xl shadow-xs"
						fallbackTextClassName="text-white text-lg font-bold"
						useTwoLetters={true}
					/>

					<div className="min-w-0 flex-1 pt-1">
						<Input
							required
							placeholder={t(
								"tools.password_manager.title_placeholder",
								{ defaultValue: "Enter title..." },
							)}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							autoComplete="off"
							className="text-lg md:text-xl font-semibold h-10 bg-transparent border-0 border-b border-border/70 rounded-none focus-visible:ring-0 focus-visible:border-primary px-0 text-foreground transition-colors placeholder:text-muted-foreground/50"
						/>
					</div>
				</div>

				{/* Type & Folder Pill Dropdowns */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-muted-foreground">
							Type
						</Label>
						<Select
							value={itemType}
							onValueChange={(val: string | null) => {
								setItemType(val as PasswordItem["itemType"]);
							}}
						>
							<SelectTrigger className="w-full h-10 bg-background border-border/80 rounded-xl capitalize font-medium text-sm">
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

					<div className="space-y-1.5">
						<Label className="text-xs font-medium text-muted-foreground">
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
							<SelectTrigger className="w-full h-10 bg-background border-border/80 rounded-xl font-medium text-sm">
								<div className="flex items-center gap-2 truncate">
									<Folder className="w-4 h-4 text-muted-foreground shrink-0" />
									<SelectValue placeholder="No Folder">
										{folderId === "new_folder"
											? "+ Create folder"
											: folderId === "none" || !folderId
												? t(
														"tools.password_manager.no_folder",
														{
															defaultValue:
																"No Folder",
														},
													)
												: folders.find(
														(f: {
															id: string;
															name: string;
														}) => f.id === folderId,
													)?.name ||
													t(
														"tools.password_manager.no_folder",
														{
															defaultValue:
																"No Folder",
														},
													)}
									</SelectValue>
								</div>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">
									{t("tools.password_manager.no_folder", {
										defaultValue: "No Folder",
									})}
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
			</div>

			{/* Item Details Container Card matching the design */}
			<div className="px-6 space-y-2">
				<Label className="text-sm font-semibold text-foreground block">
					{t("tools.password_manager.details_title", {
						defaultValue: "Item Details",
					})}
				</Label>

				<Card className="shadow-xs border-border/70 rounded-2xl bg-card overflow-hidden">
					<CardContent className="p-5 space-y-4">
						<div className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">
							Core Account Details
						</div>

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

						{/* Additional Notes Field */}
						<div className="space-y-1.5 pt-2">
							<Label className="text-xs font-medium text-foreground/80">
								{t("tools.password_manager.notes_placeholder", {
									defaultValue: "Additional Notes",
								})}
							</Label>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Notes about this entry..."
								className="bg-background rounded-xl border border-border/80 min-h-24 text-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-y"
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
				}}
				onDelete={() => {}}
			/>

			{/* Custom Fields Section */}
			<CustomFieldsEditor
				customFields={customFields}
				addField={addField}
				removeField={removeField}
				updateField={updateField}
			/>

			{/* Dedicated Attachments Section */}
			<AttachmentsEditor
				attachments={attachments}
				userId={userId}
				itemId={editItem?.id}
				onAddAttachment={handleAddAttachment}
				onRemoveAttachment={handleRemoveAttachment}
				onReplaceAttachment={handleReplaceAttachment}
			/>
		</form>
	);
}
