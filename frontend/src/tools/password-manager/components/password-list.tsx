import { useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import {
	selectVault,
	selectActiveFilter,
} from "@/tools/password-manager/store/password-slice";
import { setSidebarDrawerOpen } from "@/tools/password-manager/store/password-slice";
import { getFieldsForType } from "@/tools/password-manager/utils/item-types";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2, Star, Menu } from "lucide-react";
import { ITEM_TYPE_OPTIONS } from "@/tools/password-manager/utils/constants";
import {
	getDomain,
	getInitials,
	getBrandColor,
} from "@/tools/password-manager/utils/formatters";
import type { PasswordItem } from "@/tools/password-manager/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteItem } from "@/tools/password-manager/hooks/use-delete-item";
const DeleteConfirmDialog = lazy(() =>
	import("@/components/common/delete-confirm-dialog").then((m) => ({
		default: m.DeleteConfirmDialog,
	})),
);

interface PasswordListProps {
	activeId: string | null;
	onSelect: (item: PasswordItem) => void;
	onEdit: (item: PasswordItem) => void;
}

export default function PasswordList({
	activeId,
	onSelect,
	onEdit,
}: PasswordListProps) {
	const { t } = useTranslation();
	const isMobile = useIsMobile();
	const dispatch = useAppDispatch();
	const vault = useAppSelector(selectVault);
	const activeFilter = useAppSelector(selectActiveFilter);
	const [search, setSearch] = useState("");
	const {
		isDeleteDialogOpen,
		deleteTargetId,
		confirmDelete,
		handleConfirm,
		cancelDelete,
	} = useDeleteItem();
	const items = vault?.items ?? [];

	// First apply sidebar filter
	const categoryFiltered = items.filter((item) => {
		if (activeFilter === "all") return true;
		if (activeFilter === "favorites") {
			return item.isFavorite === true;
		}
		if (activeFilter === "recent") {
			// just a placeholder for recent logic
			return true;
		}
		// Filter by folder
		if (item.folderId === activeFilter) return true;
		// Filter by item type (login, card, etc.)
		return (
			item.itemType === activeFilter ||
			(!item.itemType && activeFilter === "login")
		);
	});

	const filtered = search
		? categoryFiltered.filter(
				(i) =>
					i.title.toLowerCase().includes(search.toLowerCase()) ||
					i.username?.toLowerCase().includes(search.toLowerCase()) ||
					i.url?.toLowerCase().includes(search.toLowerCase()),
			)
		: categoryFiltered;

	const handleDeleteConfirm = () => {
		handleConfirm();
	};

	return (
		<div className="h-full flex flex-col">
			{/* Search bar & Mobile Menu */}
			<div className="p-4 flex items-center gap-2">
				{isMobile && (
					<Button
						variant="ghost"
						size="icon"
						onClick={() => dispatch(setSidebarDrawerOpen(true))}
						className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/5"
					>
						<Menu className="h-5 w-5" />
					</Button>
				)}
				<Input
					placeholder={t("tools.password_manager_search")}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="bg-vault-card border-white/5 text-white placeholder:text-white/30 rounded-xl flex-1"
				/>
			</div>

			{/* List */}
			<div className="flex-1 overflow-y-auto no-scrollbar scroll-fade-bottom p-2 space-y-1">
				{filtered.length === 0 && (
					<div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
						<p className="text-sm">
							{search
								? t("tools.password_manager_no_results")
								: t("tools.password_manager_no_passwords")}
						</p>
					</div>
				)}
				{filtered.map((item) => {
					const isActive = activeId === item.id;
					const domain = getDomain(item.url);
					const schemaFields = getFieldsForType(
						item.itemType || "login",
					);
					const subtitleField = schemaFields.find(
						(f) => f.type === "text" || f.type === "email",
					);
					const subtitle =
						subtitleField && item.metadata
							? item.metadata[subtitleField.key]
							: null;

					return (
						<div
							key={item.id}
							onClick={() => onSelect(item)}
							className={`group w-full overflow-hidden text-left p-3 rounded-2xl transition-all cursor-pointer border border-transparent ${
								isActive
									? "bg-vault-active text-white shadow-lg"
									: "hover:bg-white/5 text-white/90"
							}`}
						>
							<div className="flex items-center justify-between mb-0 min-w-0 w-full gap-3">
								<div className="flex items-center gap-3 min-w-0 flex-1">
									<div
										className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
											isActive
												? "bg-white/20"
												: getBrandColor(item.title)
										}`}
									>
										<span className="text-white text-sm font-bold">
											{getInitials(item.title)}
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<h3
											className={`font-semibold text-[15px] tracking-tight truncate flex items-center gap-1.5 ${isActive ? "text-white" : "text-white"}`}
										>
											<span className="truncate">
												{item.title}
											</span>
											{item.itemType &&
												item.itemType !== "login" && (
													<Badge
														variant="outline"
														className={`shrink-0 text-[9px] px-1.5 py-0 leading-none border-transparent ${isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/70"}`}
													>
														{t(
															ITEM_TYPE_OPTIONS.find(
																(o) =>
																	o.id ===
																	item.itemType,
															)?.label ||
																item.itemType,
														)}
													</Badge>
												)}
										</h3>
										<p
											className={`text-[13px] truncate ${isActive ? "text-white/80" : "text-white/50"}`}
										>
											{subtitle ||
												item.username ||
												domain ||
												"No details"}
										</p>
									</div>
								</div>
								<div className="shrink-0 flex items-center">
									{item.isFavorite && (
										<Star
											className={`h-4 w-4 ${isActive ? "text-white" : "text-amber-400"}`}
											fill={
												isActive
													? "currentColor"
													: "none"
											}
										/>
									)}
								</div>
							</div>

							{/* Actions (visible on hover) */}
							<div className="hidden group-hover:flex items-center gap-0.5 justify-end mt-2">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<CopyButton
												content={item.password || ""}
												variant="ghost"
												size="sm"
												onClick={(e) =>
													e.stopPropagation()
												}
												className={`h-7 w-7 rounded-lg transition-colors ${
													isActive
														? "hover:bg-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground"
														: "hover:bg-muted text-muted-foreground hover:text-foreground"
												}`}
												disabled={!item.password}
											/>
										</TooltipTrigger>
										<TooltipContent side="top">
											<p>
												{t(
													"tools.password_manager_copy_password",
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
												onClick={(e) => {
													e.stopPropagation();
													onEdit(item);
												}}
												className={`h-7 w-7 rounded-lg transition-colors ${
													isActive
														? "hover:bg-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground"
														: "hover:bg-muted text-muted-foreground hover:text-foreground"
												}`}
											>
												<Pencil className="h-3.5 w-3.5" />
											</Button>
										</TooltipTrigger>
										<TooltipContent side="top">
											<p>
												{t(
													"tools.password_manager_edit",
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
												onClick={(e) => {
													e.stopPropagation();
													confirmDelete(item.id);
												}}
												className={`h-7 w-7 rounded-lg transition-colors ${
													isActive
														? "hover:bg-primary-foreground/20 text-primary-foreground/70 hover:text-red-300"
														: "hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
												}`}
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</TooltipTrigger>
										<TooltipContent side="top">
											<p>
												{t(
													"tools.password_manager_delete",
												)}
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					);
				})}
			</div>
			{deleteTargetId && (
				<Suspense fallback={null}>
					<DeleteConfirmDialog
						isOpen={isDeleteDialogOpen}
						onOpenChange={(open) => {
							if (!open) cancelDelete();
						}}
						onConfirm={handleDeleteConfirm}
						title={t("display.delete_button")}
						description={t("tools.password_manager_delete_confirm")}
					/>
				</Suspense>
			)}
		</div>
	);
}
