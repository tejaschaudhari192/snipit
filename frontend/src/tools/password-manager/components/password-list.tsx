import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePassword } from "@/tools/password-manager/context/password-context";
import { usePasswordUI } from "@/tools/password-manager/context/password-ui-context";
import { encryptVault } from "@/tools/password-manager/utils/vault";
import { getFieldsForType } from "@/tools/password-manager/utils/item-types";
import { Copy, Pencil, Trash2, Star, Menu } from "lucide-react";
import {
	getDomain,
	getInitials,
	getBrandColor,
} from "@/tools/password-manager/utils/formatters";
import type { PasswordItem } from "@/tools/password-manager/types";
import { useIsMobile } from "@/hooks/use-mobile";

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
	const { vault, setVault, masterPassword } = usePassword();
	const { activeFilter, setIsSidebarDrawerOpen } = usePasswordUI();
	const [search, setSearch] = useState("");

	const items = vault?.items ?? [];

	// First apply sidebar filter
	const categoryFiltered = items.filter((item) => {
		if (activeFilter === "all") return true;
		if (activeFilter === "favorites") {
			// we don't have a favorites flag yet, maybe we just return false for now or if we add it later
			return false;
		}
		if (activeFilter === "recent") {
			// just a placeholder for recent logic
			return true;
		}
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

	const copyToClipboard = async (text: string) => {
		await navigator.clipboard.writeText(text);
	};

	const deleteItem = async (id: string) => {
		if (!vault) return;
		const updated = {
			...vault,
			items: vault.items.filter((i) => i.id !== id),
		};
		setVault(updated);
		await encryptVault(updated, masterPassword);
	};

	return (
		<div className="flex flex-col h-full bg-card overflow-hidden w-full min-w-0">
			{/* Search bar & Mobile Menu */}
			<div className="p-4 border-b border-border flex items-center gap-2">
				{isMobile && (
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsSidebarDrawerOpen(true)}
						className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
					>
						<Menu className="h-5 w-5" />
					</Button>
				)}
				<Input
					placeholder={t("tools.password_manager_search")}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="bg-background border-border flex-1"
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
							className={`group w-full overflow-hidden text-left p-3 rounded-xl transition-all ${
								isActive
									? "bg-primary text-primary-foreground shadow-md"
									: "hover:bg-muted"
							}`}
						>
							<div className="flex items-center justify-between mb-1 min-w-0 w-full gap-2">
								<div className="flex items-center gap-3 min-w-0 flex-1">
									<div
										className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
											isActive
												? "bg-primary-foreground/20"
												: getBrandColor(item.title)
										}`}
									>
										<span className="text-white text-xs font-bold">
											{getInitials(item.title)}
										</span>
									</div>
									<div className="min-w-0">
										<h3
											className={`font-semibold text-sm truncate ${isActive ? "text-primary-foreground" : "text-foreground"}`}
										>
											{item.title}
										</h3>
										<p
											className={`text-xs truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}
										>
											{subtitle ||
												item.username ||
												domain ||
												"No details"}
										</p>
									</div>
								</div>
								{item.isFavorite && (
									<Star
										className={`h-3 w-3 ${isActive ? "text-primary-foreground" : "text-amber-400"}`}
									/>
								)}
							</div>

							{/* Actions (visible on hover) */}
							<div className="hidden group-hover:flex items-center gap-0.5 justify-end mt-2">
								<Button
									variant="ghost"
									size="icon"
									onClick={(e) => {
										e.stopPropagation();
										copyToClipboard(item.password || "");
									}}
									className={`h-7 w-7 rounded-lg transition-colors ${
										isActive
											? "hover:bg-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground"
											: "hover:bg-muted text-muted-foreground hover:text-foreground"
									}`}
									disabled={!item.password}
								>
									<Copy className="h-3.5 w-3.5" />
								</Button>
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
								<Button
									variant="ghost"
									size="icon"
									onClick={(e) => {
										e.stopPropagation();
										deleteItem(item.id);
									}}
									className={`h-7 w-7 rounded-lg transition-colors ${
										isActive
											? "hover:bg-primary-foreground/20 text-primary-foreground/70 hover:text-red-300"
											: "hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
									}`}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
