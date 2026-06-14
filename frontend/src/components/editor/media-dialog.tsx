import { useState, useRef } from "react";
import { FileService } from "@/lib/file-service";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UploadCloud } from "lucide-react";
import { cn } from "@/utils";

interface MediaDialogProps {
	isOpen: boolean;
	onClose: () => void;
	type: "image" | "video";
	onInsert: (url: string) => void;
}

export function MediaDialog({
	isOpen,
	onClose,
	type,
	onInsert,
}: MediaDialogProps) {
	const [tab, setTab] = useState<"upload" | "link">("upload");
	const [linkUrl, setLinkUrl] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleClose = () => {
		setLinkUrl("");
		setSelectedFile(null);
		setIsUploading(false);
		onClose();
	};

	const handleUpload = async () => {
		if (!selectedFile) return;
		try {
			setIsUploading(true);
			const { url, error } = await FileService.upload(selectedFile);
			if (error) {
				toast.error(error);
				return;
			}
			if (url) {
				onInsert(url);
				toast.success("Uploaded and embedded successfully!");
				handleClose();
			}
		} catch (err) {
			console.error(err);
			toast.error("An error occurred during upload");
		} finally {
			setIsUploading(false);
		}
	};

	const handleEmbedLink = () => {
		if (!linkUrl.trim()) return;
		onInsert(linkUrl.trim());
		handleClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="sm:max-w-md border border-border/50 bg-background shadow-2xl rounded-2xl overflow-hidden p-6 gap-0">
				<DialogHeader className="mb-4">
					<DialogTitle className="text-base font-semibold text-foreground text-center sm:text-left">
						{type === "image"
							? "Embed or upload an image"
							: "Embed or upload a video"}
					</DialogTitle>
				</DialogHeader>

				{/* Custom Tabs */}
				<div className="flex bg-muted/80 p-1 rounded-lg w-full mb-4 border border-border/10 select-none">
					<button
						onClick={() => setTab("upload")}
						className={cn(
							"flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
							tab === "upload"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Upload
					</button>
					<button
						onClick={() => setTab("link")}
						className={cn(
							"flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
							tab === "link"
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Link
					</button>
				</div>

				{/* Tab Content */}
				{tab === "upload" ? (
					<div className="flex flex-col gap-4">
						<div
							onClick={() => fileInputRef.current?.click()}
							className="border-2 border-dashed border-border/60 hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/20"
						>
							<UploadCloud className="h-8 w-8 text-muted-foreground animate-bounce" />
							<p className="text-xs font-medium text-foreground text-center">
								{selectedFile
									? selectedFile.name
									: `Drag & drop or click to upload ${type}`}
							</p>
							<p className="text-[10px] text-muted-foreground text-center">
								Max file size 50MB
							</p>
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								accept={
									type === "image" ? "image/*" : "video/*"
								}
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) setSelectedFile(file);
								}}
							/>
						</div>

						<button
							onClick={handleUpload}
							disabled={!selectedFile || isUploading}
							className={cn(
								"w-full h-9 bg-primary text-primary-foreground text-xs font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
								isUploading && "animate-pulse",
							)}
						>
							{isUploading ? "Uploading..." : "Upload"}
						</button>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						<input
							type="text"
							placeholder={
								type === "image"
									? "https://example.com/image.jpg"
									: "https://youtube.com/watch?v=..."
							}
							value={linkUrl}
							onChange={(e) => setLinkUrl(e.target.value)}
							className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
						/>

						<button
							onClick={handleEmbedLink}
							disabled={!linkUrl.trim()}
							className="w-full h-9 bg-primary text-primary-foreground text-xs font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
							type="button"
						>
							Embed Link
						</button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
