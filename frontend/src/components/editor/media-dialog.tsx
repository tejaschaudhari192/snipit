import { useState, useRef } from "react";
import { FileService } from "@/lib/file-service";
import { toast } from "@/components/ui/toast";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UploadCloud } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
				toast.add({ title: error, type: "error" });
				return;
			}
			if (url) {
				const sizeStr =
					selectedFile.size > 1024 * 1024
						? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
						: `${(selectedFile.size / 1024).toFixed(1)} KB`;
				onInsert(url, selectedFile.name, sizeStr);
				toast.add({
					title: "Uploaded and embedded successfully!",
					type: "success",
				});
				handleClose();
			}
		} catch (err) {
			console.error(err);
			toast.add({
				title: "An error occurred during upload",
				type: "error",
			});
		} finally {
			setIsUploading(false);
		}
	};

	const handleEmbedLink = () => {
		if (!linkUrl.trim()) return;
		const name = linkUrl.split("/").pop() || "Link Attachment";
		onInsert(linkUrl.trim(), name, "");
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

				{/* Custom Tabs */}
				<div className="flex bg-muted/80 p-1 rounded-lg w-full mb-4 border border-border/10 select-none">
					<Button
						variant="ghost"
						onClick={() => setTab("upload")}
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
						onClick={() => setTab("link")}
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
							<Input
								type="file"
								ref={fileInputRef}
								className="hidden"
								accept={
									type === "image"
										? "image/*"
										: type === "video"
											? "video/*"
											: undefined
								}
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) setSelectedFile(file);
								}}
							/>
						</div>

						<Button
							onClick={handleUpload}
							disabled={!selectedFile || isUploading}
							className={cn(
								"w-full h-9",
								isUploading && "animate-pulse",
							)}
						>
							{isUploading ? "Uploading..." : "Upload"}
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						<Input
							type="text"
							placeholder={
								type === "image"
									? "https://example.com/image.jpg"
									: type === "video"
										? "https://youtube.com/watch?v=..."
										: "https://example.com/document.pdf"
							}
							value={linkUrl}
							onChange={(e) => setLinkUrl(e.target.value)}
							className="w-full h-9"
						/>

						<Button
							onClick={handleEmbedLink}
							disabled={!linkUrl.trim()}
							className="w-full h-9"
							type="button"
						>
							Embed Link
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
