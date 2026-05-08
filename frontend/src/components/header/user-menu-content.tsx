import { Link } from "react-router-dom";
import { User, LogOut, ChevronRight } from "lucide-react";
import {
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import type { User as UserType } from "@/types";

interface UserMenuContentProps {
	user: UserType;
	onLogout: () => void;
}

export const UserMenuContent = ({ user, onLogout }: UserMenuContentProps) => {
	const { t } = useTranslation();

	return (
		<div className="w-64 p-1 select-none">
			<div className="px-3 py-3 mb-1 bg-muted/30 rounded-lg border border-border/5">
				<p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.15em] mb-2.5">
					{t("header.account")}
				</p>
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/5">
						<User className="h-5 w-5" />
					</div>
					<div className="flex flex-col min-w-0">
						<p className="text-sm font-bold truncate text-foreground leading-tight">
							{user.username}
						</p>
						<p className="text-[10px] text-muted-foreground truncate opacity-70 mt-0.5 font-medium">
							{user.email}
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-0.5">
				<DropdownMenuItem
					asChild
					className="rounded-lg cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors"
				>
					<Link
						to="/profile"
						className="flex items-center justify-between w-full p-2"
					>
						<div className="flex items-center gap-2.5">
							<div className="w-7 h-7 rounded-md bg-primary/5 flex items-center justify-center text-primary/70 group-focus:text-primary">
								<User className="h-3.5 w-3.5" />
							</div>
							<span className="text-sm font-semibold">
								{t("header.profile")}
							</span>
						</div>
						<ChevronRight className="h-3.5 w-3.5 opacity-30" />
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator className="bg-border/5 mx-1 my-1.5" />

				<DropdownMenuItem
					className="rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/5 cursor-pointer p-2 transition-colors"
					onClick={onLogout}
				>
					<div className="flex items-center gap-2.5">
						<div className="w-7 h-7 rounded-md bg-red-500/5 flex items-center justify-center text-red-500">
							<LogOut className="h-3.5 w-3.5" />
						</div>
						<span className="text-sm font-bold">
							{t("header.logout")}
						</span>
					</div>
				</DropdownMenuItem>
			</div>
		</div>
	);
};
