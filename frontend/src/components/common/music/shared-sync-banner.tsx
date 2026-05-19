import React from "react";
import { useMusic } from "@/context/use-music";

export const SharedSyncBanner: React.FC = () => {
	const { isShared, isInitiator, sharedByUser } = useMusic();

	if (!isShared) return null;

	return (
		<div className="text-[10px] text-primary/80 bg-primary/5 px-2.5 py-1.5 rounded border border-primary/10 w-full text-center flex items-center justify-center gap-1.5 select-none">
			<span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
			{isInitiator
				? "Broadcasting playback live to room members..."
				: `Synced to shared room stream (${sharedByUser || "DJ"})`}
		</div>
	);
};

export default SharedSyncBanner;
