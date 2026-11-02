import { useState, useMemo } from "react";
import {
	Shield,
	ChevronRight,
	Plus,
	ArrowUpDown,
	Check,
	GripVertical,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch, useAppSelector } from "../store";
import {
	selectActiveFilter,
	selectIsCloudSyncEnabled,
	selectIsSyncing,
	setActiveFilter,
	setCloudSyncEnabled,
	selectMergedFolders,
	selectVault,
} from "../store/password-slice";
import { useFolderMutations } from "@/tools/password-manager/hooks/use-folder-mutations";
import {
	SIDEBAR_NAV_ITEMS,
	ITEM_TYPE_OPTIONS,
	UI_DEFAULTS,
} from "@/tools/password-manager/utils/constants";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuBadge,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Reorder, useDragControls } from "motion/react";
import { Button } from "@/components/ui/button";
import { FolderModal, type FolderModalMode } from "./folder-modal";
import { FolderList } from "./sidebar/folder-list";
import { SettingsMenu } from "./sidebar/settings-menu";
import ShareFolderModal from "./share-folder-modal";

const CATEGORY_ORDER_KEY = "snipit_pm_category_order";

function CategoryItemRow({
	item,
	count,
	activeFilter,
	isReorderMode,
	onSelect,
	label,
}: {
	item: (typeof ITEM_TYPE_OPTIONS)[0];
	count: number;
	activeFilter: string;
	isReorderMode: boolean;
	onSelect: () => void;
	label: string;
}) {
	const dragControls = useDragControls();

	const content = (
		<SidebarMenuItem className="relative select-none list-none">
			<SidebarMenuButton
				isActive={activeFilter === item.id}
				onClick={() => {
					if (!isReorderMode) onSelect();
				}}
				tooltip={label}
				className={`group flex items-center justify-between w-full pr-8 ${isReorderMode ? "cursor-default" : ""}`}
			>
				<div className="flex items-center gap-2 min-w-0 flex-1">
					<item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
					<span className="truncate">{label}</span>
				</div>
				{count > 0 && !isReorderMode && (
					<SidebarMenuBadge>{count}</SidebarMenuBadge>
				)}
			</SidebarMenuButton>

			{isReorderMode && (
				<button
					type="button"
					aria-label="Reorder category"
					onPointerDown={(e) => dragControls.start(e)}
					className="absolute right-1 top-1.5 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground active:text-primary cursor-grab active:cursor-grabbing rounded hover:bg-sidebar-accent touch-none"
				>
					<GripVertical className="h-4 w-4" />
				</button>
			)}
		</SidebarMenuItem>
	);

	if (isReorderMode) {
		return (
			<Reorder.Item
				value={item}
				id={item.id}
				dragListener={false}
				dragControls={dragControls}
				className="relative list-none"
				whileDrag={{
					scale: 1.02,
					boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
					zIndex: 50,
				}}
			>
				{content}
			</Reorder.Item>
		);
	}

	return content;
}

export default function PasswordSidebar() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const activeFilter = useAppSelector(selectActiveFilter);
	const isCloudSyncEnabled = useAppSelector(selectIsCloudSyncEnabled);
	const isSyncing = useAppSelector(selectIsSyncing);
	const { user } = useAuth();

	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const [folderModalMode, setFolderModalMode] =
		useState<FolderModalMode>("create");
	const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
	const [folderName, setFolderName] = useState("");
	const [folderColor, setFolderColor] = useState(UI_DEFAULTS.FOLDER_COLOR);
	const [folderIcon, setFolderIcon] = useState("folder");
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [isReorderMode, setIsReorderMode] = useState(false);

	const [categoriesOpen, setCategoriesOpen] = useState(true);
	const [foldersOpen, setFoldersOpen] = useState(true);

	const rawFolders = useAppSelector(selectMergedFolders);
	const vault = useAppSelector(selectVault);
	const folders = useMemo(() => rawFolders || [], [rawFolders]);
	const items = useMemo(() => vault?.items || [], [vault?.items]);

	// Ordered categories state (persisted to localStorage)
	const [orderedCategories, setOrderedCategories] = useState(() => {
		try {
			const saved = localStorage.getItem(CATEGORY_ORDER_KEY);
			if (saved) {
				const ids: string[] = JSON.parse(saved);
				const sorted = [...ITEM_TYPE_OPTIONS].sort((a, b) => {
					const indexA = ids.indexOf(a.id);
					const indexB = ids.indexOf(b.id);
					if (indexA === -1 && indexB === -1) return 0;
					if (indexA === -1) return 1;
					if (indexB === -1) return -1;
					return indexA - indexB;
				});
				return sorted;
			}
		} catch (e) {
			console.error("Failed to load category order", e);
		}
		return ITEM_TYPE_OPTIONS;
	});

	const handleReorderCategories = (
		newCategories: typeof ITEM_TYPE_OPTIONS,
	) => {
		setOrderedCategories(newCategories);
		try {
			localStorage.setItem(
				CATEGORY_ORDER_KEY,
				JSON.stringify(newCategories.map((c) => c.id)),
			);
		} catch (e) {
			console.error("Failed to save category order", e);
		}
	};

	// Compute item counts for nav items, categories, and folders
	const counts = useMemo(() => {
		const total = items.length;
		const favorites = items.filter((i) => i.isFavorite).length;

		const categoryCounts: Record<string, number> = {};
		ITEM_TYPE_OPTIONS.forEach((cat) => {
			categoryCounts[cat.id] = items.filter(
				(i) => (i.itemType || "login") === cat.id,
			).length;
		});

		const folderCounts: Record<string, number> = {};
		folders.forEach((f) => {
			folderCounts[f.id] = items.filter(
				(i) => i.folderId === f.id,
			).length;
		});

		return {
			total,
			favorites,
			categories: categoryCounts,
			folders: folderCounts,
		};
	}, [items, folders]);

	const { createFolder, editFolder, deleteFolder, reorderFolders } =
		useFolderMutations();

	const handleSaveFolder = (
		name: string,
		color: string,
		iconName: string,
		deletePasswordsInside = false,
	) => {
		if (folderModalMode === "delete") {
			if (!activeFolderId) return;
			deleteFolder(activeFolderId, deletePasswordsInside);
			setFolderModalOpen(false);
			return;
		}

		if (folderModalMode === "create") {
			createFolder(name, color, iconName);
		} else if (folderModalMode === "edit" && activeFolderId) {
			editFolder(activeFolderId, name, color, iconName);
		}

		setFolderModalOpen(false);
	};

	return (
		<div className="flex flex-col h-full w-full bg-sidebar overflow-hidden">
			<SidebarHeader className="p-4 border-b border-sidebar-border bg-sidebar h-16 flex items-center justify-center shrink-0">
				<div className="flex items-center gap-2.5 w-full pl-1">
					<div className="bg-primary/15 text-primary p-1.5 rounded-lg flex items-center justify-center shadow-xs">
						<Shield className="h-5 w-5" />
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-sm leading-tight text-foreground">
							Snipit Vault
						</span>
						<span className="text-[11px] text-muted-foreground leading-tight">
							Zero-Knowledge E2EE
						</span>
					</div>
				</div>
			</SidebarHeader>

			{/* Unified single scroll container according to shadcn sidebar specs */}
			<SidebarContent className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-1 p-2 bg-sidebar">
				{/* Navigation Items (All, Favorites, Recent, Sharing) */}
				<SidebarGroup className="p-0">
					<SidebarGroupContent>
						<SidebarMenu>
							{SIDEBAR_NAV_ITEMS.map((item) => {
								const badgeCount =
									item.id === "all"
										? counts.total
										: item.id === "favorites"
											? counts.favorites
											: undefined;

								return (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton
											isActive={activeFilter === item.id}
											onClick={() =>
												dispatch(
													setActiveFilter(item.id),
												)
											}
											tooltip={t(item.label)}
										>
											<item.icon className="h-4 w-4 shrink-0" />
											<span className="truncate">
												{t(item.label)}
											</span>
											{badgeCount !== undefined &&
												badgeCount > 0 && (
													<SidebarMenuBadge>
														{badgeCount}
													</SidebarMenuBadge>
												)}
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Collapsible Categories Section */}
				<Collapsible
					open={categoriesOpen}
					onOpenChange={setCategoriesOpen}
					className="group/collapsible"
				>
					<SidebarGroup className="p-0 pt-2">
						<div className="flex items-center justify-between px-2">
							<CollapsibleTrigger className="flex items-center gap-1.5 flex-1 min-w-0">
								<SidebarGroupLabel className="cursor-pointer select-none text-xs font-semibold tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors uppercase p-0 flex items-center gap-1.5">
									<span>
										{t("tools.password_manager.categories")}
									</span>
									<ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarGroupLabel>
							</CollapsibleTrigger>
							<Button
								variant={isReorderMode ? "default" : "ghost"}
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									setIsReorderMode(!isReorderMode);
								}}
								className={`h-5 w-5 rounded p-0 transition-colors ${
									isReorderMode
										? "bg-primary text-primary-foreground hover:bg-primary/90"
										: "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
								}`}
								title={
									isReorderMode
										? t("tools.password_manager.done")
										: t("tools.password_manager.reorder")
								}
							>
								{isReorderMode ? (
									<Check className="h-3 w-3" />
								) : (
									<ArrowUpDown className="h-3 w-3" />
								)}
								<span className="sr-only">
									{isReorderMode
										? t("tools.password_manager.done")
										: t("tools.password_manager.reorder")}
								</span>
							</Button>
						</div>

						<CollapsibleContent>
							<SidebarGroupContent className="pt-1">
								{isReorderMode ? (
									<Reorder.Group
										axis="y"
										values={orderedCategories}
										onReorder={handleReorderCategories}
										className="flex flex-col gap-1 p-0 m-0 list-none"
									>
										{orderedCategories.map((item) => {
											const count =
												counts.categories[item.id] || 0;
											return (
												<CategoryItemRow
													key={item.id}
													item={item}
													count={count}
													activeFilter={activeFilter}
													isReorderMode={
														isReorderMode
													}
													onSelect={() =>
														dispatch(
															setActiveFilter(
																item.id,
															),
														)
													}
													label={t(item.label)}
												/>
											);
										})}
									</Reorder.Group>
								) : (
									<SidebarMenu>
										{orderedCategories.map((item) => {
											const count =
												counts.categories[item.id] || 0;
											return (
												<CategoryItemRow
													key={item.id}
													item={item}
													count={count}
													activeFilter={activeFilter}
													isReorderMode={false}
													onSelect={() =>
														dispatch(
															setActiveFilter(
																item.id,
															),
														)
													}
													label={t(item.label)}
												/>
											);
										})}
									</SidebarMenu>
								)}
							</SidebarGroupContent>
						</CollapsibleContent>
					</SidebarGroup>
				</Collapsible>

				{/* Collapsible Folders Section */}
				<Collapsible
					open={foldersOpen}
					onOpenChange={setFoldersOpen}
					className="group/collapsible"
				>
					<SidebarGroup className="p-0 pt-2">
						<div className="flex items-center justify-between px-2">
							<CollapsibleTrigger className="flex items-center gap-1.5 flex-1 min-w-0">
								<SidebarGroupLabel className="cursor-pointer select-none text-xs font-semibold tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors uppercase p-0 flex items-center gap-1.5">
									<span>
										{t("tools.password_manager.folders")}
									</span>
									<ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarGroupLabel>
							</CollapsibleTrigger>
							<div className="flex items-center gap-1">
								<Button
									variant={
										isReorderMode ? "default" : "ghost"
									}
									size="icon"
									onClick={(e) => {
										e.stopPropagation();
										setIsReorderMode(!isReorderMode);
									}}
									className={`h-5 w-5 rounded p-0 transition-colors ${
										isReorderMode
											? "bg-primary text-primary-foreground hover:bg-primary/90"
											: "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
									}`}
									title={
										isReorderMode
											? t("tools.password_manager.done")
											: t(
													"tools.password_manager.reorder",
												)
									}
								>
									{isReorderMode ? (
										<Check className="h-3 w-3" />
									) : (
										<ArrowUpDown className="h-3 w-3" />
									)}
									<span className="sr-only">
										{isReorderMode
											? t("tools.password_manager.done")
											: t(
													"tools.password_manager.reorder",
												)}
									</span>
								</Button>
								<SidebarGroupAction
									title={t(
										"tools.password_manager.add_folder",
									)}
									onClick={() => {
										setFolderModalMode("create");
										setFolderName("");
										setFolderColor(
											UI_DEFAULTS.FOLDER_COLOR,
										);
										setFolderIcon("folder");
										setFolderModalOpen(true);
									}}
									className="static top-auto right-auto h-5 w-5 hover:bg-sidebar-accent"
								>
									<Plus className="h-3.5 w-3.5" />
									<span className="sr-only">
										{t("tools.password_manager.add_folder")}
									</span>
								</SidebarGroupAction>
							</div>
						</div>

						<CollapsibleContent>
							<SidebarGroupContent className="pt-1">
								<FolderList
									folders={folders}
									activeFilter={activeFilter}
									folderCounts={counts.folders}
									isReorderMode={isReorderMode}
									onReorderFolders={(newFolders) => {
										reorderFolders(newFolders);
									}}
									onSelectFolder={(id) =>
										dispatch(setActiveFilter(id))
									}
									onEditFolder={(
										id,
										name,
										color,
										iconName,
									) => {
										setFolderModalMode("edit");
										setActiveFolderId(id);
										setFolderName(name);
										setFolderColor(
											color || UI_DEFAULTS.FOLDER_COLOR,
										);
										setFolderIcon(iconName || "folder");
										setFolderModalOpen(true);
									}}
									onDeleteFolder={(id, name) => {
										setFolderModalMode("delete");
										setActiveFolderId(id);
										setFolderName(name);
										setFolderModalOpen(true);
									}}
									onShareFolder={(id, name) => {
										setActiveFolderId(id);
										setFolderName(name);
										setShareModalOpen(true);
									}}
								/>
							</SidebarGroupContent>
						</CollapsibleContent>
					</SidebarGroup>
				</Collapsible>
			</SidebarContent>

			<SidebarFooter className="p-2 border-t border-sidebar-border mt-auto shrink-0">
				<SettingsMenu
					user={user}
					isCloudSyncEnabled={isCloudSyncEnabled}
					isSyncing={isSyncing}
					onSetCloudSync={(enabled) =>
						dispatch(setCloudSyncEnabled(enabled))
					}
				/>
			</SidebarFooter>

			<FolderModal
				open={folderModalOpen}
				onOpenChange={setFolderModalOpen}
				mode={folderModalMode}
				initialFolderName={folderName}
				initialFolderColor={folderColor}
				initialFolderIcon={folderIcon}
				onSave={handleSaveFolder}
				onDelete={(deletePasswords) =>
					handleSaveFolder("", "", "", deletePasswords)
				}
			/>
			{activeFolderId && (
				<ShareFolderModal
					isOpen={shareModalOpen}
					onClose={() => setShareModalOpen(false)}
					folderId={activeFolderId}
					folderName={folderName}
				/>
			)}
		</div>
	);
}
