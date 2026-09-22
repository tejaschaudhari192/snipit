import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { useMediaUpload, MediaDropzone, MediaLinkForm } from "./media";

interface MediaDialogProps {
	isOpen: boolean;
	onClose: () => void;
	type: "image" | "video" | "attachment";
	onInsert: (url: string, filename?: string, filesize?: string) => void;
}

export function MediaDialog({
	isOpen,
	onClose,
	type,
	onInsert,
}: MediaDialogProps) {
	const [tab, setTab] = useState<"upload" | "link">("upload");

	const handleSuccess = (url: string, filename: string, filesize: string) => {
		onInsert(url, filename, filesize);
		handleClose();
	};

	const {
		selectedFile,
		isUploading,
		uploadProgress,
		selectFile,
		upload,
		reset,
	} = useMediaUpload({ onSuccess: handleSuccess });

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleEmbedLink = (url: string) => {
		const name = url.split("/").pop() || "Link Attachment";
		onInsert(url, name, "");
		handleClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="sm:max-w-md border border-border/50 bg-background shadow-2xl rounded-2xl overflow-hidden p-6 gap-0">
				<DialogHeader className="mb-4">
					<DialogTitle className="text-base font-semibold text-foreground text-center sm:text-left">
						{type === "image"
							? "Embed or upload an image"
							: type === "video"
								? "Embed or upload a video"
								: "Embed or upload an attachment"}
					</DialogTitle>
				</DialogHeader>

				{/* Tab Selector */}
				<div className="flex bg-muted/80 p-1 rounded-lg w-full mb-4 border border-border/10 select-none">
					<Button
						variant="ghost"
						onClick={() => !isUploading && setTab("upload")}
						disabled={isUploading}
						className={cn(
							"flex-1 h-8 text-xs font-semibold rounded-md transition-all cursor-pointer",
							tab === "upload"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground hover:bg-transparent",
						)}
					>
						Upload
					</Button>
					<Button
						variant="ghost"
						onClick={() => !isUploading && setTab("link")}
						disabled={isUploading}
						className={cn(
							"flex-1 h-8 text-xs font-semibold rounded-md transition-all cursor-pointer",
							tab === "link"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground hover:bg-transparent",
						)}
					>
						Link
					</Button>
				</div>

				{/* Tab Content */}
				{tab === "upload" ? (
					<div className="flex flex-col gap-4">
						<MediaDropzone
							type={type}
							selectedFile={selectedFile}
							isUploading={isUploading}
							uploadProgress={uploadProgress}
							onFileSelect={selectFile}
						/>

						{!isUploading && (
							<Button
								onClick={upload}
								disabled={!selectedFile || isUploading}
								className="w-full h-9 font-medium cursor-pointer"
							>
								Upload
							</Button>
						)}
					</div>
				) : (
					<MediaLinkForm type={type} onSubmit={handleEmbedLink} />
				)}
			</DialogContent>
		</Dialog>
	);
}
