import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Edit2, Trash2, Star, Folder, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import {
	selectVault,
	handleEdit,
} from "@/tools/password-manager/store/password-slice";
import {
	isOlderThan3Months,
	formatDate,
	getBrandColor,
} from "@/tools/password-manager/utils/formatters";
import { getFieldsForType } from "@/tools/password-manager/utils/item-types";
import { ITEM_TYPE_OPTIONS } from "@/tools/password-manager/utils/constants";
import type { PasswordItem } from "@/tools/password-manager/types";
import { Skeleton } from "@/components/ui/skeleton";
import { SchemaFieldRenderer } from "./detail-fields/schema-field-renderer";
import { CustomFieldRenderer } from "./detail-fields/custom-field-renderer";
import { useDeleteItem } from "@/tools/password-manager/hooks/use-delete-item";
import { Label } from "@/components/ui/label";
import type { SchemaField } from "./form-fields/schema-fields-editor";
const PasswordForm = lazy(
	() => import("@/tools/password-manager/components/password-form"),
);
const DeleteConfirmDialog = lazy(() =>
	import("@/components/common/delete-confirm-dialog").then((m) => ({
		default: m.DeleteConfirmDialog,
	})),
);

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
	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);
	const { isDeleteDialogOpen, confirmDelete, handleConfirm, cancelDelete } =
		useDeleteItem();

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
					<Suspense
						fallback={
							<div className="p-5 space-y-5 animate-pulse">
								<div className="flex items-center gap-4 pt-6 px-0">
									<Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
									<Skeleton className="h-8 flex-1 rounded-xl" />
								</div>
								<div className="space-y-3">
									<Skeleton className="h-10 w-full rounded-xl" />
									<Skeleton className="h-10 w-full rounded-xl" />
									<Skeleton className="h-10 w-full rounded-xl" />
									<Skeleton className="h-24 w-full rounded-xl" />
								</div>
							</div>
						}
					>
						<PasswordForm
							key={item?.id ?? `new_${item?.itemType || "login"}`}
							onAdd={onSave}
							editItem={isEditing ? item : undefined}
						/>
					</Suspense>
				</div>
			</div>
		);
	}

	if (!item) return null; // Satisfy TypeScript

	const showWarning = isOlderThan3Months(item.updatedAt);
	const schemaFields = getFieldsForType(item.itemType || "login");

	return (
		<div className="flex flex-col h-full bg-transparent text-white">
			{/* Header Actions */}
			<div className="flex items-center gap-3 p-4 border-b border-white/5">
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
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => {
										onSave({
											...item,
											isFavorite: !item.isFavorite,
										});
									}}
									className={`h-8 w-8 rounded-lg transition-colors ${
										item.isFavorite
											? "text-amber-400 hover:text-amber-500 hover:bg-amber-400/10"
											: "text-muted-foreground hover:text-foreground hover:bg-muted"
									}`}
								>
									<Star
										className="h-4 w-4"
										fill={
											item.isFavorite
												? "currentColor"
												: "none"
										}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>
									{item.isFavorite
										? t("remove")
										: t("tools.password_manager_favorites")}
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => dispatch(handleEdit(item))}
									className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								>
									<Edit2 className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>{t("tools.password_manager_edit")}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => confirmDelete(item.id)}
									className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>{t("tools.password_manager_delete")}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto no-scrollbar scroll-fade-bottom">
				{/* Title & Subtitle */}
				<div className="px-8 pt-8 pb-4">
					<div className="flex items-center gap-4">
						<div
							className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${getBrandColor(item.title)}`}
						>
							<span className="text-white text-3xl font-bold">
								{item.title
									? item.title.substring(0, 2).toUpperCase()
									: "?"}
							</span>
						</div>
						<div className="min-w-0 flex-1">
							<h2 className="text-[28px] font-bold text-white tracking-tight flex items-center gap-2 mb-1">
								<span className="truncate">{item.title}</span>
							</h2>
							{item.itemType && (
								<Badge
									variant="outline"
									className="bg-white/10 text-emerald-400 border-transparent text-[11px] px-2 py-0.5 rounded-md leading-none font-medium"
								>
									{t(
										ITEM_TYPE_OPTIONS.find(
											(o) => o.id === item.itemType,
										)?.label || item.itemType,
									)}
								</Badge>
							)}
						</div>
					</div>
				</div>

				{/* Expiry warning */}
				{showWarning && (
					<div className="mx-8 mt-4 p-4 rounded-xl bg-vault-warning flex items-center justify-between shadow-sm">
						<p className="text-[15px] font-medium text-white tracking-tight">
							It's time to update your password.
						</p>
						<a
							href="#"
							className="text-sm font-semibold text-white/90 hover:text-white flex items-center gap-1.5 transition-colors"
						>
							Update now <Globe className="h-4 w-4" />
						</a>
					</div>
				)}

				<div className="px-8 pt-8 pb-10 space-y-8">
					{/* Details Section */}
					<div className="space-y-6">
						{/* Dynamic Schema Fields */}
						{schemaFields.map((field) => {
							const value = item.metadata
								? item.metadata[field.key]
								: undefined;

							return (
								<SchemaFieldRenderer
									key={field.key}
									field={field as SchemaField}
									value={value}
									fileName={item.metadata?.fileName}
								/>
							);
						})}

						{/* Notes */}
						{item.notes && (
							<div>
								<Label className="text-xs text-muted-foreground mb-1.5 block">
									{t("tools.password_detail_notes_label")}
								</Label>
								<p className="text-sm text-foreground whitespace-pre-wrap wrap-break-word">
									{item.notes}
								</p>
							</div>
						)}

						{/* Created & Last Modified */}
						{(item.createdAt || item.updatedAt) && (
							<>
								<Separator className="bg-border" />
								<div className="space-y-1.5">
									{item.createdAt && (
										<div className="flex items-center justify-between">
											<span className="text-xs text-muted-foreground">
												{t(
													"tools.password_detail_created_label",
												)}
											</span>
											<span className="text-xs text-muted-foreground/80 font-mono">
												{formatDate(item.createdAt)}
											</span>
										</div>
									)}
									{item.updatedAt && (
										<div className="flex items-center justify-between">
											<span className="text-xs text-muted-foreground">
												{t(
													"tools.password_detail_modified_label",
												)}
											</span>
											<span className="text-xs text-muted-foreground/80 font-mono">
												{formatDate(item.updatedAt)}
											</span>
										</div>
									)}
								</div>
							</>
						)}
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
										<CustomFieldRenderer
											key={i}
											field={field}
										/>
									))}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
			{item && (
				<Suspense fallback={null}>
					<DeleteConfirmDialog
						isOpen={isDeleteDialogOpen}
						onOpenChange={(open) => {
							if (!open) cancelDelete();
						}}
						onConfirm={() => {
							handleConfirm();
						}}
						title={t("display.delete_button")}
						description={t("tools.password_manager_delete_confirm")}
					/>
				</Suspense>
			)}
		</div>
	);
}
