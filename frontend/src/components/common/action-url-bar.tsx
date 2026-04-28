import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { QRDialog } from "./qr-dialog";
import { cn } from "@/utils";

interface ActionUrlBarProps {
	url: string;
	className?: string;
}

export const ActionUrlBar = ({ url, className }: ActionUrlBarProps) => {
	const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);

	return (
		<div
			className={cn(
				"action-url-bar flex items-center h-9 md:h-8 gap-2 min-w-0 flex-1 px-3 rounded-full glass-card max-w-sm overflow-hidden",
				className,
			)}
		>
			<p className="text-xs text-muted-foreground truncate flex-1 min-w-0">
				{url}
			</p>
			<div className="w-px h-3 bg-border mx-1 shrink-0" />
			<CopyButton
				content={url}
				variant="ghost"
				className="h-6 w-6 p-0 hover:bg-transparent shrink-0"
			/>
			<Button
				variant="ghost"
				size="icon"
				className="h-6 w-6 p-0 hover:bg-transparent shrink-0"
				onClick={() => setIsQRDialogOpen(true)}
			>
				<QrCode className="h-3.5 w-3.5" />
			</Button>

			<QRDialog
				url={url}
				isOpen={isQRDialogOpen}
				onOpenChange={setIsQRDialogOpen}
			/>
		</div>
	);
};
