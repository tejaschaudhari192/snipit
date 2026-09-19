import { useState, useRef, useEffect } from "react";
import { FileService } from "@/lib/file-service";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

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
	const [uploadProgress, setUploadProgress] = useState(0);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const clearProgressInterval = () => {
		if (progressIntervalRef.current) {
			clearInterval(progressIntervalRef.current);
			progressIntervalRef.current = null;
		}
	};

	useEffect(() => {
		return () => clearProgressInterval();
	}, []);

	const handleClose = () => {
		clearProgressInterval();
		setLinkUrl("");
		setSelectedFile(null);
		setIsUploading(false);
		setUploadProgress(0);
		onClose();
	};

	const handleUpload = async () => {
		if (!selectedFile) return;
		try {
			setIsUploading(true);
			setUploadProgress(5);

			clearProgressInterval();
			progressIntervalRef.current = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) return prev;
					const remaining = 90 - prev;
					const step = Math.max(1, Math.round(remaining / 6));
					return Math.min(90, prev + step);
				});
			}, 150);

			let targetUrl: string | null = null;

			// Try cloud storage if configured
			if (isSupabaseConfigured) {
				const { url } = await FileService.upload(selectedFile);
				if (url) {
					targetUrl = url;
				}
			}

			// Fallback to client Data URL for seamless local embedding
			if (!targetUrl) {
				targetUrl = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(selectedFile);
				});
			}

			clearProgressInterval();
			setUploadProgress(100);

			if (targetUrl) {
				const sizeStr =
					selectedFile.size > 1024 * 1024
						? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
						: `${(selectedFile.size / 1024).toFixed(1)} KB`;

				// Short delay so user sees 100% completion before closing
				await new Promise((resolve) => setTimeout(resolve, 250));

				onInsert(targetUrl, selectedFile.name, sizeStr);
				toast.add({
					title: "Embedded successfully!",
					type: "success",
				});
				handleClose();
			}
		} catch (err) {
			clearProgressInterval();
			console.error(err);
			toast.add({
				title: "An error occurred during upload",
				type: "error",
			});
			setIsUploading(false);
			setUploadProgress(0);
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
						<div
							onClick={() =>
								!isUploading && fileInputRef.current?.click()
							}
							className={cn(
								"border-2 border-dashed border-border/60 hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 transition-colors bg-muted/20",
								isUploading
									? "pointer-events-none opacity-80"
									: "cursor-pointer",
							)}
						>
							<div className="p-3 bg-muted rounded-full border border-border/60 text-primary transition-transform">
								{uploadProgress === 100 ? (
									<CheckCircle2 className="h-7 w-7 text-emerald-500" />
								) : (
									<UploadCloud className="h-7 w-7 text-primary" />
								)}
							</div>
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
								disabled={isUploading}
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
									if (file) {
										setSelectedFile(file);
										setUploadProgress(0);
									}
								}}
							/>
						</div>

						{isUploading && (
							<div className="flex flex-col gap-1.5 w-full bg-muted/30 p-3 rounded-lg border border-border/40 animate-in fade-in duration-200">
								<div className="flex items-center justify-between text-xs font-medium">
									<span className="text-foreground flex items-center gap-1.5">
										<span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
										Uploading media...
									</span>
									<span className="font-bold tabular-nums text-primary">
										{uploadProgress}%
									</span>
								</div>
								<Progress
									value={uploadProgress}
									className="h-1.5 w-full"
								/>
							</div>
						)}

						<Button
							onClick={handleUpload}
							disabled={!selectedFile || isUploading}
							className="w-full h-9 font-medium"
						>
							{isUploading
								? `Uploading ${uploadProgress}%...`
								: "Upload"}
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
