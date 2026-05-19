import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic } from "@/context/use-music";

interface DownloadDropdownProps {
	videoId: string;
	title: string;
	size?: "sm" | "md";
}

const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
	videoId,
	title,
	size = "md",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const { downloadTrack } = useMusic();

	const buttonSizeClass = size === "sm" ? "h-7 w-7" : "h-8 w-8";
	const iconSizeClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
	const dropdownTopClass = size === "sm" ? "top-8" : "top-9";

	return (
		<div className="relative shrink-0 select-none">
			<Button
				variant="ghost"
				size="icon"
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen(!isOpen);
				}}
				className={`${buttonSizeClass} text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/30 transition-colors`}
				title="Download MP3"
			>
				<Download className={iconSizeClass} />
			</Button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-110"
						onClick={(e) => {
							e.stopPropagation();
							setIsOpen(false);
						}}
					/>
					<div
						className={`absolute right-0 ${dropdownTopClass} z-120 bg-background/95 border border-border/80 rounded-md shadow-xl backdrop-blur-md py-1 min-w-[120px] animate-in fade-in slide-in-from-top-1 duration-150`}
					>
						<button
							onClick={(e) => {
								e.stopPropagation();
								downloadTrack(videoId, title, "128");
								setIsOpen(false);
							}}
							className="w-full text-left px-3.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/65 transition-colors font-sans"
						>
							Medium (128 kbps)
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								downloadTrack(videoId, title, "320");
								setIsOpen(false);
							}}
							className="w-full text-left px-3.5 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/65 transition-colors font-sans"
						>
							High (320 kbps)
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default DownloadDropdown;
