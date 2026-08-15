import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppDispatch } from "@/tools/password-manager/store";
import { setSidebarDrawerOpen } from "@/tools/password-manager/store/password-slice";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Menu,
	Share2,
	Upload,
	Search,
	GitMerge,
	MoreVertical,
	MailWarning,
	Copy,
} from "lucide-react";
import type { Folder as FolderType } from "@/tools/password-manager/types";

interface PasswordListHeaderProps {
	pageTitle: string;
	hasSelection: boolean;
	selectedCount: number;
	searchQuery: string;
	onSearchChange?: (val: string) => void;
	activeFolder: FolderType | undefined;
	onMergeModalOpen: () => void;
	onShareModalOpen: () => void;
	onImport: () => void;
	onFindDuplicatesOpen: () => void;
	onFieldCleanerOpen: () => void;
	onNewItem: () => void;
}

export function PasswordListHeader({
	pageTitle,
	hasSelection,
	selectedCount,
	searchQuery,
	onSearchChange,
	activeFolder,
	onMergeModalOpen,
	onShareModalOpen,
	onImport,
	onFindDuplicatesOpen,
	onFieldCleanerOpen,
	onNewItem,
}: PasswordListHeaderProps) {
	const { t } = useTranslation();
	const isMobile = useIsMobile();
	const dispatch = useAppDispatch();

	return (
		<>
			<div className="flex items-center justify-between p-6 pb-4">
				<div className="flex items-center gap-3 whitespace-nowrap">
					{isMobile && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => dispatch(setSidebarDrawerOpen(true))}
							className="h-9 w-9 text-muted-foreground hover:text-foreground"
						>
							<Menu className="h-5 w-5" />
						</Button>
					)}
					{hasSelection ? (
						<div className="flex items-center gap-4">
							<span className="text-sm font-medium text-muted-foreground">
								{selectedCount} item
								{selectedCount > 1 ? "s" : ""} selected
							</span>
							{selectedCount > 1 && (
								<Button
									size="sm"
									variant="secondary"
									onClick={onMergeModalOpen}
								>
									<GitMerge className="w-4 h-4 mr-2" />
									{t("tools.password_manager.merge")}
								</Button>
							)}
						</div>
					) : (
						<h1 className="text-2xl font-bold text-foreground">
							{pageTitle}
						</h1>
					)}
				</div>
				{!hasSelection && onSearchChange && (
					<div className="relative flex-1 max-w-md mx-6 hidden sm:block">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder={t("tools.password_manager.search")}
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="w-full bg-background pl-10 border-border rounded-xl h-9 shadow-sm"
						/>
					</div>
				)}
				<div className="flex items-center gap-2 shrink-0">
					{activeFolder && !hasSelection && (
						<Button
							variant="outline"
							className="gap-2 h-9 hidden sm:flex"
							size="sm"
							onClick={onShareModalOpen}
						>
							<Share2 className="h-4 w-4" />{" "}
							{t("tools.password_manager.share_btn")}
						</Button>
					)}
					<DropdownMenu>
						<DropdownMenuTrigger
							className={`${buttonVariants({ variant: "outline", size: "sm" })} h-9 gap-2 hidden sm:flex`}
							disabled={hasSelection}
						>
							<MoreVertical className="w-4 h-4 mr-1" />{" "}
							{t("tools.password_manager.more")}
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={onImport}>
								<Upload className="w-4 h-4 mr-2" />
								<span>
									{t("tools.password_manager.import_action")}
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onFindDuplicatesOpen}>
								<Copy className="w-4 h-4 mr-2" />
								<span>
									{t(
										"tools.password_manager.find_duplicates",
									)}
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onFieldCleanerOpen}>
								<MailWarning className="w-4 h-4 mr-2" />
								<span>
									{t("tools.password_manager.clean_fields")}
								</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						className="h-9 gap-2"
						size="sm"
						onClick={onNewItem}
						disabled={hasSelection}
					>
						<span className="mr-1">+</span>{" "}
						<span className="hidden sm:inline">
							{t("tools.password_manager.new_item")}
						</span>
					</Button>
				</div>
			</div>

			{/* Mobile search bar if applicable */}
			{!hasSelection && onSearchChange && (
				<div className="sm:hidden px-6 pb-4">
					<div className="relative w-full">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder={t("tools.password_manager.search")}
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="w-full bg-background pl-10 border-border rounded-xl h-9 shadow-sm"
						/>
					</div>
				</div>
			)}
		</>
	);
}
