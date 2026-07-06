import { type Editor } from "@tiptap/core";
import {
	Link as LinkIcon,
	Sigma,
	Image as ImageIcon,
	Video as VideoIcon,
	Paperclip,
} from "lucide-react";
import { TooltipButton } from "./tooltip-button";
import { cn } from "@/utils";

interface MediaControlsProps {
	editor: Editor;
	onOpenLinkDialog: () => void;
	onOpenLatexDialog: () => void;
	onAddImage: () => void;
	onAddVideo: () => void;
	onAddAttachment: () => void;
}

export function MediaControls({
	editor,
	onOpenLinkDialog,
	onOpenLatexDialog,
	onAddImage,
	onAddVideo,
	onAddAttachment,
}: MediaControlsProps) {
	return (
		<>
			<TooltipButton
				onClick={onOpenLinkDialog}
				className={cn(
					"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent cursor-pointer",
					editor.isActive("link") &&
						"bg-accent border-border/40 text-accent-foreground shadow-sm",
				)}
				title="Hyperlink"
			>
				<LinkIcon className="h-4 w-4" />
			</TooltipButton>

			<TooltipButton
				onClick={onOpenLatexDialog}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
				title="LaTeX Formula"
			>
				<Sigma className="h-4 w-4" />
			</TooltipButton>

			<TooltipButton
				onClick={onAddImage}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
				title="Insert Image"
			>
				<ImageIcon className="h-4 w-4" />
			</TooltipButton>

			<TooltipButton
				onClick={onAddVideo}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
				title="Insert Video"
			>
				<VideoIcon className="h-4 w-4" />
			</TooltipButton>

			<TooltipButton
				onClick={onAddAttachment}
				className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
				title="Insert Attachment"
			>
				<Paperclip className="h-4 w-4" />
			</TooltipButton>
		</>
	);
}
