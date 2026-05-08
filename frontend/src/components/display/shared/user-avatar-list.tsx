import { useTranslation } from "react-i18next";
import type { ActiveUser } from "@/types";

interface UserAvatarListProps {
	users: ActiveUser[];
}

export const UserAvatarList = ({ users }: UserAvatarListProps) => {
	const { t } = useTranslation();

	if (users.length === 0) return null;

	const displayUsers = users.slice(0, 3);
	const remainingCount = users.length - 3;

	return (
		<div className="flex items-center gap-3 mr-2 sm:mr-4 border-l pl-3 sm:pl-4 border-border/30">
			<div className="flex items-center -space-x-2.5">
				{displayUsers.map((u) => (
					<div
						key={u.socketId}
						className="relative group cursor-pointer z-0 first:z-10 hover:z-50! transition-all duration-300"
					>
						<div
							className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black border-2 border-background shadow-lg shadow-black/10 transition-transform group-hover:-translate-y-1 relative`}
							style={{ backgroundColor: u.color, color: "white" }}
						>
							{u.isEditing && (
								<div
									className="absolute inset-0 rounded-full animate-pulse border-2 shadow-[0_0_8px_rgba(0,0,0,0.3)]"
									style={{ borderColor: "white" }}
								/>
							)}

							<span>{u.name.charAt(0).toUpperCase()}</span>

							{u.isEditing && (
								<span
									className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background ring-1 ring-white/50"
									style={{ backgroundColor: "#22c55e" }}
								/>
							)}
						</div>

						<div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-background/95 backdrop-blur-md border border-border text-foreground text-[10px] sm:text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none shadow-2xl transform origin-top scale-90 group-hover:scale-100 flex flex-col items-center min-w-[120px] z-999">
							<span className="font-bold whitespace-nowrap">
								{u.name} {u.isMe && `(${t("common.me")})`}
							</span>
							<span
								className={`text-[9px] opacity-70 ${u.isEditing ? "text-green-500 font-bold" : ""}`}
							>
								{u.isEditing
									? t("display.status_editing")
									: t("display.status_viewing")}
							</span>
							<div className="absolute bottom-[98%] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-background border-l border-t border-border" />
						</div>
					</div>
				))}
				{remainingCount > 0 && (
					<div className="relative group cursor-pointer z-0 hover:z-50! transition-all duration-300">
						<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 border-background shadow-lg shadow-black/10 bg-secondary text-secondary-foreground transition-transform group-hover:-translate-y-1">
							+{remainingCount}
						</div>
						<div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-background/95 backdrop-blur-md border border-border text-foreground text-[10px] sm:text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none shadow-2xl transform origin-top scale-90 group-hover:scale-100 flex flex-col items-center min-w-[80px] z-999">
							<span className="font-bold whitespace-nowrap">
								{remainingCount} {t("common.more_users")}
							</span>
							<div className="absolute bottom-[98%] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-background border-l border-t border-border" />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
