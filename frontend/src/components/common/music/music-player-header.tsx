import React from "react";
import { useTranslation } from "react-i18next";
import { Share2 } from "lucide-react";
import { cn } from "@/utils";
import { useMusic } from "@/context/use-music";
import {
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const MusicPlayerHeader: React.FC = () => {
	const { t } = useTranslation();
	const { searchResults, playlist, pasteId, isShared, toggleShare } =
		useMusic();

	return (
		<DialogHeader className="flex flex-row items-center justify-between space-y-0 pr-8 w-full min-w-0 font-sans">
			<div className="flex flex-col text-left min-w-0 flex-1 pr-2">
				<DialogTitle className="text-sm font-semibold tracking-tight truncate">
					{t("music.now_playing")}
				</DialogTitle>
				<DialogDescription className="text-[11px] text-muted-foreground truncate">
					{searchResults.length > 0
						? `${searchResults.length} search results found`
						: `${playlist.length} ${t("music.tracks_available")}`}
				</DialogDescription>
			</div>

			<div className="flex items-center gap-1.5 shrink-0">
				{pasteId && (
					<Button
						variant={isShared ? "default" : "outline"}
						size="sm"
						onClick={toggleShare}
						className={cn(
							"h-8 px-2.5 text-xs font-semibold gap-1.5 transition-all duration-300 border",
							isShared
								? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-lg shadow-primary/20 border-primary"
								: "text-muted-foreground border-border hover:text-foreground hover:bg-muted/30",
						)}
					>
						<Share2
							className={cn(
								"w-3.5 h-3.5",
								isShared && "animate-pulse",
							)}
						/>
						{isShared ? "Shared" : "Share"}
					</Button>
				)}
			</div>
		</DialogHeader>
	);
};

export default MusicPlayerHeader;
