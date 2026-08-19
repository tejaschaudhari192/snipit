import { Edit2, Check, X, LogOut, MoreHorizontal } from "lucide-react";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import type { User as UserType } from "@/types";
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
	onLogout: () => void;
}

export const ProfileInfo = ({
	user,
	isEditingName,
	setIsEditingName,
	newName,
	setNewName,
	handleUpdateName,
	isUpdating,
	onLogout,
}: ProfileInfoProps) => {
	const { t } = useTranslation();

	const isGuest = user.email === "Guest User";
	const initials = (user.username || "G").charAt(0).toUpperCase();

	return (
		<div className="w-full">
			{/* Account Summary Header */}
			<div className="p-3 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-md transition-all">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2.5 min-w-0 flex-1">
						<Avatar className="h-10 w-10 rounded-xl ring-2 ring-primary/20 shrink-0 bg-linear-to-br from-primary/20 via-primary/10 to-accent/20">
							<AvatarImage src="" />
							<AvatarFallback className="rounded-xl font-black text-primary text-sm bg-primary/10">
								{initials}
							</AvatarFallback>
						</Avatar>

						<div className="flex flex-col min-w-0 flex-1">
							{isEditingName && !isGuest ? (
								<div className="flex items-center gap-1 w-full">
									<Input
										value={newName}
										onChange={(e) =>
											setNewName(e.target.value)
										}
										className="text-xs h-7 bg-background px-2 font-bold"
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
								<>
									<div className="flex items-center gap-1.5 min-w-0">
										<span className="font-extrabold text-sm text-foreground truncate">
											{user.username}
										</span>
										{!isGuest && (
											<button
												onClick={() =>
													setIsEditingName(true)
												}
												className="p-1 text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer rounded-md hover:bg-muted"
												title="Edit Username"
											>
												<Edit2 className="h-3 w-3" />
											</button>
										)}
									</div>
									<span className="text-[11px] text-muted-foreground truncate">
										{user.email}
									</span>
								</>
							)}
						</div>
					</div>

					{/* Actions Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-none shrink-0">
							<MoreHorizontal className="h-4 w-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent
							side="top"
							align="end"
							className="w-48 p-1 rounded-xl shadow-xl border-border/60 bg-background/95 backdrop-blur-xl text-xs"
						>
							{!isGuest && (
								<DropdownMenuItem
									onClick={() => setIsEditingName(true)}
									className="gap-2 cursor-pointer"
								>
									<Edit2 className="h-3.5 w-3.5" />
									<span>{t("profile.edit_name")}</span>
								</DropdownMenuItem>
							)}
							{!isGuest && <DropdownMenuSeparator />}
							{isGuest ? (
								<div className="p-1 space-y-1">
									<a
										href="/signup"
										className="w-full h-8 text-xs rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
									>
										{t("header.signup")}
									</a>
									<a
										href="/login"
										className="w-full h-8 text-xs rounded-lg font-bold border border-input bg-background hover:bg-accent flex items-center justify-center"
									>
										{t("header.login")}
									</a>
								</div>
							) : (
								<DropdownMenuItem
									className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg p-2 font-bold"
									onClick={onLogout}
								>
									<LogOut className="h-3.5 w-3.5" />
									<span>{t("header.logout")}</span>
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
};
