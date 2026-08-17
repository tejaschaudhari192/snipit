import {
	User,
	Edit2,
	Check,
	X,
	LogOut,
	MoreHorizontal,
	Eye,
	Files,
} from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import type { User as UserType, PasteData } from "@/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProfileInfoProps {
	user: UserType;
	isEditingName: boolean;
	setIsEditingName: (v: boolean) => void;
	newName: string;
	setNewName: (v: string) => void;
	handleUpdateName: () => void;
	isUpdating: boolean;
	pastes: PasteData[];
	onLogout: () => void;
	stats: {
		totalSnippets: number;
		totalViews: number;
		mostUsedLanguage: string;
	} | null;
}

export const ProfileInfo = ({
	user,
	isEditingName,
	setIsEditingName,
	newName,
	setNewName,
	handleUpdateName,
	isUpdating,
	pastes,
	onLogout,
	stats,
}: ProfileInfoProps) => {
	const { t } = useTranslation();

	const totalViews = stats?.totalViews ?? 0;
	const totalSnippets = stats?.totalSnippets ?? pastes.length;

	const isGuest = user.email === "Guest User";

	return (
		<div className="w-full">
			<DropdownMenu>
				<DropdownMenuTrigger className="w-full h-auto flex items-center justify-between transition-all duration-200 p-2.5 rounded-xl border border-transparent hover:border-sidebar-border hover:bg-muted/50 cursor-pointer text-left outline-none">
					<Avatar className="h-9 w-9 rounded-xl ring-1 ring-primary/20 shrink-0 bg-primary/10">
						<AvatarImage src="" />
						<AvatarFallback className="rounded-xl bg-background flex items-center justify-center">
							<User className="h-5 w-5 text-primary" />
						</AvatarFallback>
					</Avatar>

					<div className="flex flex-col gap-0.5 leading-none mr-auto min-w-0 text-left pl-2">
						<span className="font-bold text-sm truncate">
							{user.username}
						</span>
						<span className="text-xs text-muted-foreground truncate">
							{user.email}
						</span>
					</div>

					<MoreHorizontal className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
				</DropdownMenuTrigger>

				<DropdownMenuContent
					side="top"
					align="start"
					sideOffset={8}
					className="w-64 p-2 rounded-2xl shadow-xl border-border/60 bg-background/95 backdrop-blur-xl"
				>
					{/* User Info Header / Edit Name */}
					<div className="px-2 py-1.5 space-y-1">
						{isEditingName && !isGuest ? (
							<div className="flex items-center gap-1.5 w-full pt-1">
								<Input
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									className="text-xs h-7 bg-background px-2"
									autoFocus
									onKeyDown={(e) => {
										if (e.key === "Enter")
											handleUpdateName();
										if (e.key === "Escape")
											setIsEditingName(false);
									}}
								/>
								<Button
									onClick={handleUpdateName}
									disabled={isUpdating}
									size="icon"
									className="h-7 w-7 shrink-0"
								>
									{isUpdating ? (
										<ShimmerSection type="mini-loader" />
									) : (
										<Check className="h-3 w-3" />
									)}
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 shrink-0"
									onClick={() => setIsEditingName(false)}
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						) : (
							<div className="flex items-center justify-between">
								<div className="min-w-0 flex-1">
									<div className="text-xs font-bold text-foreground truncate">
										{user.username}
									</div>
									<div className="text-[10px] text-muted-foreground truncate">
										{user.email}
									</div>
								</div>
								{!isGuest && (
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-muted-foreground hover:text-primary shrink-0"
										onClick={() => setIsEditingName(true)}
									>
										<Edit2 className="h-3 w-3" />
									</Button>
								)}
							</div>
						)}
					</div>

					<DropdownMenuSeparator className="my-1.5" />

					{/* Quick Stats Grid */}
					<div className="grid grid-cols-2 gap-1.5 px-1 py-1">
						<div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/10">
							<div className="flex justify-center mb-0.5">
								<Files className="h-3 w-3 text-primary/70" />
							</div>
							<div className="text-xs font-black text-primary">
								{totalSnippets}
							</div>
							<div className="text-[9px] uppercase font-bold text-muted-foreground">
								{t("profile.snippets_count")}
							</div>
						</div>
						<div className="bg-muted/40 rounded-lg p-2 text-center border border-border/40">
							<div className="flex justify-center mb-0.5">
								<Eye className="h-3 w-3 text-muted-foreground" />
							</div>
							<div className="text-xs font-black text-foreground">
								{totalViews}
							</div>
							<div className="text-[9px] uppercase font-bold text-muted-foreground">
								{t("profile.views")}
							</div>
						</div>
					</div>

					<DropdownMenuSeparator className="my-1.5" />

					{/* Logout or Login/Signup Actions */}
					{isGuest ? (
						<div className="flex gap-1.5 p-1">
							<a
								href="/signup"
								className="flex-1 h-7 text-xs rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
							>
								{t("header.signup")}
							</a>
							<a
								href="/login"
								className="flex-1 h-7 text-xs rounded-lg font-bold border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center"
							>
								{t("header.login")}
							</a>
						</div>
					) : (
						<DropdownMenuItem
							className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg p-2 font-bold text-xs"
							onClick={onLogout}
						>
							<LogOut className="h-3.5 w-3.5" />
							<span>{t("header.logout")}</span>
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
