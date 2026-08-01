import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Edit2,
	Trash2,
	Star,
	Folder,
	Globe,
	Share2,
	FolderPlus,
} from "lucide-react";
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
	selectMergedFolders,
	handleEdit,
} from "@/tools/password-manager/store/password-slice";
import {
	isOlderThan3Months,
	formatDate,
	getBrandColor,
} from "@/tools/password-manager/utils/formatters";
import { getFieldsForType } from "@/tools/password-manager/utils/item-types";
import { ITEM_TYPE_OPTIONS } from "@/tools/password-manager/utils/constants";
import { getFaviconUrl } from "@/tools/password-manager/utils/favicon";
import type { PasswordItem } from "@/tools/password-manager/types";
import { Skeleton } from "@/components/ui/skeleton";
import { SchemaFieldRenderer } from "./detail-fields/schema-field-renderer";
import { CustomFieldRenderer } from "./detail-fields/custom-field-renderer";
import { useDeleteItem } from "@/tools/password-manager/hooks/use-delete-item";
import { Label } from "@/components/ui/label";
import type { SchemaField } from "./form-fields/schema-fields-editor";
import ShareItemModal from "./share-item-modal";
const PasswordForm = lazy(
	() => import("@/tools/password-manager/components/password-form"),
);
const DeleteConfirmDialog = lazy(() =>
	import("@/components/common/delete-confirm-dialog").then((m) => ({
		default: m.DeleteConfirmDialog})),
);
import { FolderModal } from "./folder-modal";
import { useFolderMutations } from "../hooks/use-folder-mutations";
import { UI_DEFAULTS } from "../utils/constants";

interface PasswordDetailProps {
	item: PasswordItem | null | undefined;
	isNew: boolean;
	onSave: (item: PasswordItem) => void;
}

function DetailAvatar({ item }: { item: PasswordItem }) {
	const faviconUrl = getFaviconUrl(item.url || item.metadata?.url || item.metadata?.website);
	const [imgError, setImgError] = useState(false);

	if (faviconUrl && !imgError) {
		return (
			<div className="w-20 h-20 rounded-2xl border border-border/50 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 relative">
				<img
					src={faviconUrl}
					alt=""
					className="w-16 h-16 object-contain relative z-10"
					onError={() => setImgError(true)}
				/>
			</div>
		);
	}

	return (
		<div
			className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10 relative overflow-hidden ${getBrandColor(item.title)}`}
		>
			<span className="text-white text-3xl font-black tracking-tight drop-shadow-md relative z-10">
				{item.title
					? item.title.substring(0, 2).toUpperCase()
					: "?"}
			</span>
		</div>
	);
}

export default function PasswordDetail({
	item,
	isNew,
	onSave,
}: PasswordDetailProps) {
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const { createFolder } = useFolderMutations();
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const folders = useAppSelector(selectMergedFolders) || [];
	const { isDeleteDialogOpen, confirmDelete, handleConfirm, cancelDelete } =
		useDeleteItem();

	if (!item && !isNew) return null;

	if (isNew) {
		const isExistingItem = !!(item && item.createdAt);
		return (
			<div className="flex flex-col h-full bg-background">
				<div className="flex items-center justify-between p-5 border-b border-border">
					<h2 className="text-sm font-semibold flex-1">
						{isExistingItem
							? t("tools.password_manager_edit_title")
							: t("tools.password_manager_new_title")}
					</h2>
					<Button
						type="submit"
						form="password-form"
						size="sm"
						className="h-8 px-4"
					>
						{isExistingItem
							? t("tools.password_manager_save")
							: t("tools.password_manager_add")}
					</Button>
				</div>
				<div className="flex-1 overflow-y-auto no-scrollbar scroll-fade-b">
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
							editItem={item}
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
		<>
			<div className="flex flex-col h-full bg-background/95 backdrop-blur-xl text-foreground">
				{/* Header Actions */}
				<div className="flex items-center gap-3 p-5 border-b border-border/40 bg-muted/20">
					<div className="flex-1 min-w-0 flex items-center justify-end gap-2">
						<div className="w-32">
							<Select
								value={item.folderId || "none"}
								onValueChange={(val) => {
									if (val === "new_folder") {
										setFolderModalOpen(true);
									} else {
										const selectedFolder = folders.find(
											(f: {
												id: string;
												collectionId?: string;
											}) => f.id === val,
										);
										onSave({
											...item,
											folderId:
												val === "none"
													? undefined
													: val,
											collectionId:
												selectedFolder?.collectionId});
									}
								}}
							>
								<SelectTrigger className="h-8 text-xs bg-background border-border">
									<Folder className="h-3 w-3 mr-2 text-muted-foreground" />
									<SelectValue placeholder="Folder" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">
										No folder
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
										className="text-primary font-medium flex items-center gap-2"
									>
										<FolderPlus className="h-4 w-4" />
										{t("tools.password_manager_add_folder")}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => {
											onSave({
												...item,
												isFavorite: !item.isFavorite});
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
											: t(
													"tools.password_manager_favorites",
												)}
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
										onClick={() =>
											setIsShareModalOpen(true)
										}
										className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
									>
										<Share2 className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>Share</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										onClick={() =>
											dispatch(handleEdit(item))
										}
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

				<div className="flex-1 overflow-y-auto no-scrollbar scroll-fade-b">
					{/* Title & Subtitle */}
					<div className="px-8 pt-10 pb-6 relative overflow-hidden border-b border-border/20">
						
						<div className="flex items-center gap-6 relative z-10">
							<DetailAvatar item={item} />
							<div className="min-w-0 flex-1">
								<h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 mb-2.5 text-foreground/90">
									<span className="truncate drop-shadow-sm">
										{item.title}
									</span>
								</h2>
								{item.itemType && (
									<Badge
										variant="outline"
										className="bg-background/80 backdrop-blur-md border-border text-muted-foreground text-[11px] px-2.5 py-1 rounded-md leading-none font-semibold shadow-xs transition-colors hover:bg-muted"
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
						<div className="mx-8 mt-4 p-4 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-between shadow-sm border border-amber-200 dark:border-amber-800">
							<p className="text-[15px] font-medium text-amber-900 dark:text-amber-200 tracking-tight">
								It's time to update your password.
							</p>
							<a
								href="#"
								className="text-sm font-semibold text-amber-800 dark:text-amber-300 hover:opacity-80 flex items-center gap-1.5 transition-opacity"
							>
								Update now <Globe className="h-4 w-4" />
							</a>
						</div>
					)}

					<div className="px-8 pt-6 pb-12 space-y-8 relative z-10">
						{/* Details Section */}
						<div className="bg-muted/20 border border-border/40 rounded-2xl p-6 shadow-xs space-y-6">
							{/* Dynamic Schema Fields */}
							{schemaFields.map((field) => {
								const itemKey = field.key as keyof PasswordItem;
								const value =
									item[itemKey] !== undefined && item[itemKey] !== "" && item[itemKey] !== null
										? (item[itemKey] as string)
										: item.metadata
											? (item.metadata[field.key] as string)
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
								<div className="pt-2">
									<Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
										{t("tools.password_detail_notes_label")}
									</Label>
									<p className="text-[14px] leading-relaxed text-foreground/90 whitespace-pre-wrap wrap-break-word bg-background/50 p-4 rounded-xl border border-border/50">
										{item.notes}
									</p>
								</div>
							)}

							{/* Created & Last Modified */}
							{(item.createdAt || item.updatedAt) && (
								<>
									<Separator className="bg-border/50 my-2" />
									<div className="space-y-2">
										{item.createdAt && (
											<div className="flex items-center justify-between">
												<span className="text-[13px] font-medium text-muted-foreground/80">
													{t(
														"tools.password_detail_created_label",
													)}
												</span>
												<span className="text-[13px] text-muted-foreground font-mono">
													{formatDate(item.createdAt)}
												</span>
											</div>
										)}
										{item.updatedAt && (
											<div className="flex items-center justify-between">
												<span className="text-[13px] font-medium text-muted-foreground/80">
													{t(
														"tools.password_detail_modified_label",
													)}
												</span>
												<span className="text-[13px] text-muted-foreground font-mono">
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
							<div className="bg-muted/20 border border-border/40 rounded-2xl p-6 shadow-xs">
								<Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4 block">
									{t(
										"tools.password_detail_custom_fields_label",
									)}
								</Label>
								<div className="space-y-3">
									{item.customFields.map((field, i) => (
										<CustomFieldRenderer
											key={i}
											field={field}
										/>
									))}
								</div>
							</div>
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
							title={t("tools.password_manager_delete_confirm")}
							description={t(
								"tools.password_manager_delete_desc",
							)}
						/>
						<ShareItemModal
							isOpen={isShareModalOpen}
							onClose={() => setIsShareModalOpen(false)}
							item={item}
						/>
					</Suspense>
				)}
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
		</>
	);
}
