import { useRef } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { MediaCircularProgress } from "./media-circular-progress";

interface MediaDropzoneProps {
	type: "image" | "video" | "attachment";
	selectedFile: File | null;
	isUploading: boolean;
	uploadProgress: number;
	onFileSelect: (file: File | null) => void;
}

export function MediaDropzone({
	type,
	selectedFile,
	isUploading,
	uploadProgress,
	onFileSelect,
}: MediaDropzoneProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<div
			onClick={() => !isUploading && fileInputRef.current?.click()}
			className={cn(
				"border-2 border-dashed border-border/60 hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 transition-colors bg-muted/20 relative",
				isUploading
					? "pointer-events-none opacity-80"
					: "cursor-pointer",
			)}
		>
			<div className="relative flex items-center justify-center transition-transform">
				{isUploading ? (
					<MediaCircularProgress
						progress={uploadProgress}
						size={76}
						strokeWidth={6}
					/>
				) : uploadProgress === 100 ? (
					<div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-500">
						<CheckCircle2 className="h-7 w-7" />
					</div>
				) : (
					<div className="p-3 bg-muted rounded-full border border-border/60 text-primary">
						<UploadCloud className="h-7 w-7" />
					</div>
				)}
			</div>
			{isUploading ? (
				<div className="flex flex-col items-center gap-0.5 max-w-full px-2">
					<p className="text-xs font-semibold text-foreground text-center truncate max-w-70">
						{selectedFile?.name || "Uploading media..."}
					</p>
					<p className="text-[11px] text-muted-foreground text-center">
						{uploadProgress >= 99
							? "Processing file in cloud..."
							: "Uploading media, please wait..."}
					</p>
				</div>
			) : (
				<p className="text-xs font-medium text-foreground text-center max-w-70 truncate">
					{selectedFile
						? selectedFile.name
						: `Drag & drop or click to upload ${type}`}
				</p>
			)}
			{!isUploading && (
				<p className="text-[10px] text-muted-foreground text-center">
					Max file size 50MB
				</p>
			)}
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
					const file = e.target.files?.[0] || null;
					onFileSelect(file);
				}}
			/>
		</div>
	);
}
