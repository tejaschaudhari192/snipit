import { useTranslation } from "react-i18next";
import { MoreVertical, Pencil, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PasswordItem } from "@/tools/password-manager/types";

interface ItemActionsProps {
	item: PasswordItem;
	onEdit: (item: PasswordItem) => void;
	onDelete: (id: string) => void;
}

export function ItemActions({ item, onEdit, onDelete }: ItemActionsProps) {
	const { t } = useTranslation();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						className="h-8 w-8 p-0"
						onClick={(e) => e.stopPropagation()}
					/>
				}
			>
				<span className="sr-only">Open menu</span>
				<MoreVertical className="h-4 w-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				<DropdownMenuItem
					onClick={(e) => {
						e.stopPropagation();
						onEdit(item);
					}}
				>
					<Pencil className="mr-2 h-4 w-4" />
					<span>{t("tools.password_manager.edit")}</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={(e) => {
						e.stopPropagation();
						if (item.password) {
							navigator.clipboard.writeText(item.password);
						}
					}}
					disabled={!item.password}
				>
					<Copy className="mr-2 h-4 w-4" />
					<span>{t("tools.password_manager.copy_password")}</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					className="text-destructive focus:text-destructive"
					onClick={(e) => {
						e.stopPropagation();
						onDelete(item.id);
					}}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					<span>{t("tools.password_manager.delete")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
