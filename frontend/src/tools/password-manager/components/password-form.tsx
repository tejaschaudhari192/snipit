import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import PasswordGenerator from "@/tools/password-manager/components/password-generator";
import { useTranslation } from "react-i18next";
import { usePassword } from "@/tools/password-manager/context/password-context";
import { Plus, Trash2, RefreshCw, Eye, EyeOff, Upload } from "lucide-react";
import type { PasswordItem, CustomField } from "../types";
import { getFieldsForType } from "../utils/item-types";
import {
	CUSTOM_FIELD_TYPES,
	PASSWORD_STRENGTH_CONFIG,
} from "@/tools/password-manager/utils/constants";

export interface PasswordFormProps {
	onAdd: (item: PasswordItem) => void;
	editItem?: PasswordItem | null;
	onCancelEdit?: () => void;
}

function getPasswordStrength(password: string) {
	if (!password) return null;
	let score = 0;
	if (password.length > PASSWORD_STRENGTH_CONFIG.MIN_LENGTH_WEAK) score += 1;
	if (password.length > PASSWORD_STRENGTH_CONFIG.MIN_LENGTH_GOOD) score += 1;
	if (/[A-Z]/.test(password)) score += 1;
	if (/[0-9]/.test(password)) score += 1;
	if (/[^A-Za-z0-9]/.test(password)) score += 1;

	if (score <= PASSWORD_STRENGTH_CONFIG.SCORE_WEAK)
		return { label: "Weak", color: "bg-red-500", text: "text-red-500" };
	if (score <= PASSWORD_STRENGTH_CONFIG.SCORE_GOOD)
		return {
			label: "Good",
			color: "bg-yellow-500",
			text: "text-yellow-500",
		};
	return {
		label: "Ultimate!",
		color: "bg-green-500",
		text: "text-green-500",
	};
}

export default function PasswordForm({
	onAdd,
	editItem,
	onCancelEdit,
}: PasswordFormProps) {
	const { t } = useTranslation();
	const [title, setTitle] = useState("");
	const [notes, setNotes] = useState("");
	const [itemType, setItemType] = useState<PasswordItem["itemType"]>("login");
	const [folderId, setFolderId] = useState<string>("none");
	const [customFields, setCustomFields] = useState<CustomField[]>([]);
	const [metadata, setMetadata] = useState<Record<string, string>>({});

	const [showGeneratorFor, setShowGeneratorFor] = useState<string | null>(
		null,
	);
	const [showPasswordFor, setShowPasswordFor] = useState<
		Record<string, boolean>
	>({});
	const { vault } = usePassword();

	// Populate form when editing
	useEffect(() => {
		if (editItem) {
			setTitle(editItem.title);
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
		onCancelEdit?.();
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
							{t(
								"tools.password_manager_details_title",
								"Details",
							)}
						</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4 space-y-4">
						{itemType === "credfile" && (
							<div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30 border-dashed">
								<div className="space-y-1">
									<Label className="text-sm font-medium">
										Upload File
									</Label>
									<p className="text-xs text-muted-foreground">
										Select a file to automatically fill
										details
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
										Choose File
									</Label>
								</div>
							</div>
						)}
						{/* Dynamic Schema Fields */}
						{schemaFields.map((field) => {
							const pwdVal = metadata[field.key] || "";
							const strength =
								field.type === "password"
									? getPasswordStrength(pwdVal)
									: null;

							return (
								<div key={field.key} className="space-y-1.5">
									<div className="flex items-center justify-between">
										<Label className="text-xs text-muted-foreground">
											{field.placeholder
												? t(field.placeholder) ||
													field.label
												: field.label}
										</Label>
										{field.type === "password" && (
											<Drawer
												open={
													showGeneratorFor ===
													field.key
												}
												onOpenChange={(open) =>
													setShowGeneratorFor(
														open ? field.key : null,
													)
												}
											>
												<DrawerTrigger asChild>
													<Button
														variant="link"
														type="button"
														className="h-auto p-0 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium"
													>
														<RefreshCw className="h-3 w-3" />
														Generate
													</Button>
												</DrawerTrigger>
												<DrawerContent className="p-4 bg-background max-h-[85vh]">
													<div className="mx-auto w-full max-w-sm">
														<DrawerHeader className="px-0">
															<DrawerTitle>
																{t(
																	"tools.password_generator_title",
																)}
															</DrawerTitle>
														</DrawerHeader>
														<div className="mt-2">
															<PasswordGenerator
																onGenerate={(
																	pwd,
																) => {
																	updateMetadata(
																		field.key,
																		pwd,
																	);
																	setShowGeneratorFor(
																		null,
																	);
																}}
																onClose={() =>
																	setShowGeneratorFor(
																		null,
																	)
																}
															/>
														</div>
													</div>
												</DrawerContent>
											</Drawer>
										)}
									</div>

									{field.type === "multiline" ? (
										<Textarea
											value={metadata[field.key] || ""}
											onChange={(e) =>
												updateMetadata(
													field.key,
													e.target.value,
												)
											}
											className="bg-background rounded-xl border border-border min-h-[100px] font-mono text-sm"
										/>
									) : field.type === "password" ? (
										<div className="space-y-1">
											<div className="relative">
												<Input
													type={
														showPasswordFor[
															field.key
														]
															? "text"
															: "password"
													}
													value={pwdVal}
													onChange={(e) =>
														updateMetadata(
															field.key,
															e.target.value,
														)
													}
													autoComplete="new-password"
													className="bg-background rounded-xl border border-border font-mono pr-10"
												/>
												<Button
													variant="ghost"
													size="icon"
													type="button"
													onClick={() =>
														setShowPasswordFor(
															(prev) => ({
																...prev,
																[field.key]:
																	!prev[
																		field
																			.key
																	],
															}),
														)
													}
													className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
												>
													{showPasswordFor[
														field.key
													] ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</Button>
											</div>
											{strength && (
												<div className="pt-1 flex items-center justify-between">
													<div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
														<div
															className={`h-full ${strength.color} transition-all duration-300`}
															style={{
																width: `${strength.label === "Weak" ? 33 : strength.label === "Good" ? 66 : 100}%`,
															}}
														/>
													</div>
													<span
														className={`text-[10px] font-medium ml-2 ${strength.text}`}
													>
														Password strength:{" "}
														{strength.label}
													</span>
												</div>
											)}
										</div>
									) : (
										<Input
											type={field.type}
											value={metadata[field.key] || ""}
											onChange={(e) =>
												updateMetadata(
													field.key,
													e.target.value,
												)
											}
											autoComplete="off"
											className="bg-background rounded-xl border border-border"
										/>
									)}
								</div>
							);
						})}

						{/* Global Notes */}
						<div className="space-y-1.5 pt-2">
							<Label className="text-xs text-muted-foreground">
								{t("tools.password_manager_notes_placeholder")}
							</Label>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="bg-background rounded-xl border border-border min-h-[100px]"
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Custom Fields */}
			<div className="space-y-2 px-5">
				<div className="flex items-center justify-between">
					<Label className="text-sm font-medium">
						{t("tools.password_manager_custom_fields")}
					</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addField}
					>
						<Plus className="h-3 w-3 mr-1" />
						{t("tools.password_manager_add_field")}
					</Button>
				</div>
				{customFields.map((field, i) => (
					<div key={i} className="flex gap-2 items-start">
						<Input
							placeholder={t("tools.password_manager_field_name")}
							value={field.name}
							onChange={(e) =>
								updateField(i, "name", e.target.value)
							}
							className="flex-1"
						/>
						<Select
							value={field.type}
							onValueChange={(val) => updateField(i, "type", val)}
						>
							<SelectTrigger className="w-28">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{CUSTOM_FIELD_TYPES.map((ft) => (
									<SelectItem key={ft} value={ft}>
										{ft}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
								"tools.password_manager_field_value",
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
		</form>
	);
}
