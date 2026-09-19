import { useRef } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils";
import { Input } from "@/components/ui/input";

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
					const file = e.target.files?.[0] || null;
					onFileSelect(file);
				}}
			/>
		</div>
	);
}
