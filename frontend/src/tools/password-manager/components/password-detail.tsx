import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Eye,
	EyeOff,
	Copy,
	ArrowLeft,
	Edit2,
	Trash2,
	Star,
	Folder,
	Globe,
	AlertTriangle,
	Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import PasswordForm from "@/tools/password-manager/components/password-form";
import { usePassword } from "@/tools/password-manager/context/use-password";
import { usePasswordUI } from "@/tools/password-manager/context/password-ui-context";
import { isOlderThan3Months } from "@/tools/password-manager/utils/formatters";
import { getFieldsForType } from "@/tools/password-manager/utils/item-types";
import type { PasswordItem } from "@/tools/password-manager/types";

interface PasswordDetailProps {
	item: PasswordItem | null | undefined;
	isNew: boolean;
	onSave: (item: PasswordItem) => void;
	onCancel: () => void;
}

export default function PasswordDetail({
	item,
	isNew,
	onSave,
	onCancel,
}: PasswordDetailProps) {
	const { t } = useTranslation();
	const { vault, deleteItem } = usePassword();
	const { handleEdit } = usePasswordUI();
	const [showField, setShowField] = useState<Record<string, boolean>>({});

	if (!item && !isNew) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6 bg-card">
				<div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
					<Globe className="h-8 w-8 text-muted-foreground/60" />
				</div>
				<p className="text-sm font-medium">
					{t("tools.password_detail_empty_title")}
				</p>
				<p className="text-xs mt-1 text-center">
					{t("tools.password_detail_empty_desc")}
				</p>
			</div>
		);
	}

	if (isNew) {
		const isEditing = !!(item && item.id);
		return (
			<div className="flex flex-col h-full bg-card">
				<div className="flex items-center gap-3 p-4 border-b border-border">
					<Button
						variant="ghost"
						size="icon"
						onClick={onCancel}
						className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h2 className="text-sm font-semibold flex-1">
						{isEditing
							? t("tools.password_manager_edit_title")
							: t("tools.password_manager_new_title")}
					</h2>
					<Button
						type="submit"
						form="password-form"
						size="sm"
						className="h-8 px-4"
					>
						{isEditing
							? t("tools.password_manager_save")
							: t("tools.password_manager_add")}
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto no-scrollbar scroll-fade-bottom">
					<PasswordForm
						key={item?.id ?? `new_${item?.itemType || "login"}`}
						onAdd={onSave}
						editItem={isEditing ? item : undefined}
						onCancelEdit={onCancel}
					/>
				</div>
			</div>
		);
	}

	if (!item) return null; // Satisfy TypeScript

	const showWarning = isOlderThan3Months(item.updatedAt);
	const schemaFields = getFieldsForType(item.itemType || "login");

	// Determine the subtitle (usually the first text field, e.g. username, cardNumber, etc)
	const subtitleField = schemaFields.find(
		(f) => f.type === "text" || f.type === "email",
	);
	const subtitle =
		subtitleField && item.metadata
			? item.metadata[subtitleField.key]
			: "No details";

	return (
		<div className="flex flex-col h-full bg-card">
			{/* Header */}
			<div className="flex items-center gap-3 p-4 border-b border-border">
				<Button
					variant="ghost"
					size="icon"
					onClick={onCancel}
					className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="flex-1 min-w-0 flex items-center justify-end gap-2">
					{vault?.folders && vault.folders.length > 0 && (
						<div className="w-32">
							<Select
								value={item.folderId || "none"}
								onValueChange={(val) =>
									onSave({
										...item,
										folderId:
											val === "none" ? undefined : val,
									})
								}
							>
								<SelectTrigger className="h-8 text-xs bg-background border-border">
									<Folder className="h-3 w-3 mr-2 text-muted-foreground" />
									<SelectValue placeholder="Folder" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">
										No folder
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
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							onSave({ ...item, isFavorite: !item.isFavorite });
						}}
						className={`h-8 w-8 rounded-lg transition-colors ${
							item.isFavorite
								? "text-amber-400 hover:text-amber-500 hover:bg-amber-400/10"
								: "text-muted-foreground hover:text-foreground hover:bg-muted"
						}`}
					>
						<Star
							className="h-4 w-4"
							fill={item.isFavorite ? "currentColor" : "none"}
						/>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => handleEdit(item)}
						className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
						title={t("common.edit")}
					>
						<Edit2 className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							if (
								window.confirm(
									"Are you sure you want to delete this item?",
								)
							) {
								deleteItem(item.id);
							}
						}}
						className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
						title={t("remove") || "Delete"}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto no-scrollbar scroll-fade-bottom">
				{/* Title & Subtitle */}
				<div className="px-5 pt-6 pb-2">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
							<span className="text-primary text-2xl font-bold">
								{item.title
									? item.title.substring(0, 2).toUpperCase()
									: "?"}
							</span>
						</div>
						<div className="min-w-0 flex-1">
							<h2 className="text-2xl font-bold text-foreground truncate mb-1">
								{item.title}
							</h2>
							<p className="text-sm text-muted-foreground truncate">
								{subtitle}
							</p>
						</div>
					</div>
				</div>

				{/* Expiry warning */}
				{showWarning && (
					<div className="mx-5 mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
						<AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
						<div>
							<p className="text-sm font-medium text-orange-300">
								{t("tools.password_detail_update_warning")}
							</p>
							<p className="text-xs text-orange-400/80 mt-0.5">
								{t("tools.password_detail_update_desc")}
							</p>
						</div>
					</div>
				)}

				<div className="p-5 space-y-5">
					{/* Details Card */}
					<div className="border border-border rounded-xl p-4 bg-background shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
								{t("tools.password_manager_details_title")}
							</h3>
						</div>
						<div className="space-y-4">
							{/* Dynamic Schema Fields */}
							{schemaFields.map((field) => {
								const value = item.metadata
									? item.metadata[field.key]
									: undefined;
								if (!value) return null;

								if (field.type === "url") {
									return (
										<div key={field.key}>
											<Label className="text-xs text-muted-foreground mb-1.5 block">
												{t(field.placeholder || "") ||
													field.label}
											</Label>
											<a
												href={
													value.startsWith("http")
														? value
														: `https://${value}`
												}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors min-w-0"
											>
												<Globe className="h-3.5 w-3.5 shrink-0" />
												<span className="truncate min-w-0">
													{value}
												</span>
											</a>
										</div>
									);
								}

								if (field.type === "password") {
									return (
										<div key={field.key}>
											<Label className="text-xs text-muted-foreground mb-1.5 block">
												{t(field.placeholder || "") ||
													field.label}
											</Label>
											<div className="flex items-center gap-2 min-w-0">
												<div className="flex-1 flex items-center gap-2 bg-background rounded-xl px-3 py-2.5 border border-border min-w-0">
													<span className="text-sm font-mono text-foreground flex-1 truncate">
														{showField[field.key]
															? value
															: "•".repeat(
																	value.length,
																)}
													</span>
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															setShowField(
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
														className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
													>
														{showField[
															field.key
														] ? (
															<EyeOff className="h-4 w-4" />
														) : (
															<Eye className="h-4 w-4" />
														)}
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() =>
															navigator.clipboard.writeText(
																value,
															)
														}
														className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
													>
														<Copy className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</div>
									);
								}

								if (field.type === "multiline") {
									const isCredFile =
										item.itemType === "credfile" &&
										field.key === "fileContent";
									return (
										<div key={field.key}>
											<div className="flex items-center justify-between mb-1.5">
												<Label className="text-xs text-muted-foreground block">
													{t(
														field.placeholder || "",
													) || field.label}
												</Label>
												{isCredFile && value && (
													<Button
														variant="ghost"
														size="sm"
														className="h-6 text-xs text-primary hover:text-primary/80 px-2"
														onClick={() => {
															const blob =
																new Blob(
																	[value],
																	{
																		type: "text/plain",
																	},
																);
															const url =
																URL.createObjectURL(
																	blob,
																);
															const a =
																document.createElement(
																	"a",
																);
															a.href = url;
															a.download =
																item.metadata
																	?.fileName ||
																"credentials.txt";
															document.body.appendChild(
																a,
															);
															a.click();
															document.body.removeChild(
																a,
															);
															URL.revokeObjectURL(
																url,
															);
														}}
													>
														<Download className="h-3 w-3 mr-1" />
														Download
													</Button>
												)}
											</div>
											<p className="text-sm font-mono text-foreground whitespace-pre-wrap break-words bg-background rounded-xl px-3 py-2.5 border border-border">
												{value}
											</p>
										</div>
									);
								}

								return (
									<div key={field.key}>
										<Label className="text-xs text-muted-foreground mb-1.5 block">
											{t(field.placeholder || "") ||
												field.label}
										</Label>
										<div className="flex items-center gap-2 min-w-0">
											<div className="flex-1 flex items-center gap-2 bg-background rounded-xl px-3 py-2.5 border border-border min-w-0">
												<span className="text-sm text-foreground flex-1 truncate">
													{value}
												</span>
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														navigator.clipboard.writeText(
															value,
														)
													}
													className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
												>
													<Copy className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								);
							})}

							{/* Notes */}
							{item.notes && (
								<div>
									<Label className="text-xs text-muted-foreground mb-1.5 block">
										{t("tools.password_detail_notes_label")}
									</Label>
									<p className="text-sm text-foreground whitespace-pre-wrap break-words">
										{item.notes}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Custom Fields */}
					{item.customFields && item.customFields.length > 0 && (
						<>
							<Separator className="bg-border" />
							<div>
								<Label className="text-xs text-muted-foreground mb-2 block">
									{t(
										"tools.password_detail_custom_fields_label",
									)}
								</Label>
								<div className="space-y-2">
									{item.customFields.map((field, i) => (
										<div
											key={i}
											className="bg-background rounded-xl px-3 py-2.5 border border-border overflow-hidden"
										>
											<p className="text-xs text-muted-foreground mb-0.5 truncate">
												{field.name}
											</p>
											{field.type === "password" ? (
												<span className="text-sm font-mono text-foreground">
													••••••••
												</span>
											) : field.type === "color" ? (
												<span className="inline-flex items-center gap-2 text-sm text-foreground">
													<span
														className="w-4 h-4 rounded-full border border-border"
														style={{
															backgroundColor:
																field.value,
														}}
													/>
													{field.value}
												</span>
											) : field.type === "url" ? (
												<a
													href={field.value}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm text-primary hover:text-primary/80 truncate block"
												>
													{field.value}
												</a>
											) : (
												<span className="text-sm text-foreground break-words block">
													{field.value}
												</span>
											)}
										</div>
									))}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
