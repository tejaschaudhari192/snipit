import { useTranslation } from "react-i18next";
import type { ActiveUser } from "@/types";
import { cn } from "@/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserAvatarListProps {
	users: ActiveUser[];
}

export const UserAvatarList = ({ users }: UserAvatarListProps) => {
	const { t } = useTranslation();

	const filteredUsers = users.filter((u) => !u.isMe);

	if (filteredUsers.length === 0) return null;

	const displayUsers = filteredUsers.slice(0, 3);
	const remainingCount = filteredUsers.length - 3;

	return (
		<TooltipProvider>
			<div className="flex items-center gap-3 mr-2 sm:mr-4 border-l pl-3 sm:pl-4 border-border/30">
				<div className="flex items-center -space-x-2.5">
					{displayUsers.map((u) => (
						<Tooltip key={u.socketId}>
							<TooltipTrigger asChild>
								<div className="relative group cursor-pointer z-0 first:z-10 hover:z-50! transition-all duration-300">
									<div
										className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black border-2 border-background shadow-lg shadow-black/10 transition-transform group-hover:-translate-y-1 relative`}
										style={{
											backgroundColor: u.color,
											color: "white",
										}}
									>
										{(u.isEditing || u.isRecording) && (
											<div
												className={cn(
													"absolute inset-0 rounded-full animate-pulse border-2 shadow-[0_0_8px_rgba(0,0,0,0.3)]",
													u.isRecording &&
														"animate-[pulse_1s_infinite] border-red-500 shadow-red-500/50",
												)}
												style={{
													borderColor: u.isRecording
														? undefined
														: "white",
												}}
											/>
										)}

										<span>
											{u.name.charAt(0).toUpperCase()}
										</span>

										{u.isEditing && !u.isRecording && (
											<span
												className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background ring-1 ring-white/50"
												style={{
													backgroundColor: "#22c55e",
												}}
											/>
										)}
										{u.isRecording && (
											<span
												className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background ring-1 ring-white/50 animate-pulse"
												style={{
													backgroundColor: "#ef4444",
												}}
											/>
										)}
									</div>
								</div>
							</TooltipTrigger>
							<TooltipContent
								side="top"
								align="center"
								className="flex flex-col items-center min-w-[120px] px-3 py-2 bg-background/95 backdrop-blur-md border border-border text-foreground rounded-xl shadow-2xl"
							>
								<span className="font-bold whitespace-nowrap text-[10px] sm:text-xs">
									{u.name} {u.isMe && `(${t("common.me")})`}
								</span>
								<span
									className={cn(
										"text-[9px] opacity-70 mt-0.5",
										u.isRecording
											? "text-red-500 font-bold"
											: u.isEditing
												? "text-green-500 font-bold"
												: "",
									)}
								>
									{u.isRecording
										? t("display.status_recording")
										: u.isEditing
											? t("display.status_editing")
											: t("display.status_viewing")}
								</span>
							</TooltipContent>
						</Tooltip>
					))}

					{remainingCount > 0 && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="relative group cursor-pointer z-0 hover:z-50! transition-all duration-300">
									<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold border-2 border-background shadow-lg shadow-black/10 bg-secondary text-secondary-foreground transition-transform group-hover:-translate-y-1">
										+{remainingCount}
									</div>
								</div>
							</TooltipTrigger>
							<TooltipContent
								side="top"
								align="center"
								className="flex flex-col items-center min-w-[80px] px-3 py-2 bg-background/95 backdrop-blur-md border border-border text-foreground rounded-xl shadow-2xl"
							>
								<span className="font-bold whitespace-nowrap text-[10px] sm:text-xs">
									{remainingCount} {t("common.more_users")}
								</span>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</div>
		</TooltipProvider>
	);
};
