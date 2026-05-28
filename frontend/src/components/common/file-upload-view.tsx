import { FileUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import FilePreview from "@/components/common/file-preview";
import { FileUploadItem } from "./file-upload-item";
import type { FileUploadStatus } from "@/lib/file-service";
import { CONFIG } from "@/configurations";

interface FileUploadViewProps {
	files: FileUploadStatus[];
	isUploading: boolean;
	uploadError?: string | null;
	onClearFile?: () => void;
	onRemoveFile?: (id: string) => void;
	handleDragOver: (e: React.DragEvent) => void;
	handleDrop: (e: React.DragEvent) => void;
	handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	previewUrl?: string | null;
}

export const FileUploadView = ({
	files,
	isUploading,
	uploadError,
	onClearFile,
	onRemoveFile,
	handleDragOver,
	handleDrop,
	handleFileInputChange,
	previewUrl,
}: FileUploadViewProps) => {
	const { t } = useTranslation();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleAddClick = () => {
		fileInputRef.current?.click();
	};

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileInputChange(e);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div
			className="h-full w-full flex items-center justify-center p-6 bg-muted/5 overflow-y-auto"
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<div className="w-full max-w-xl my-auto">
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					multiple
					onChange={onInputChange}
				/>
				{files.length > 0 ? (
					<div className="space-y-6">
						{files.length === 1 && previewUrl && (
							<FilePreview
								url={previewUrl}
								fileName={files[0].fileName}
								mimeType={files[0].fileMimeType || ""}
								maxHeight="180px"
							/>
						)}
						<div className="flex items-center justify-between pb-4 border-b border-border/50">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
									<FileUp className="h-5 w-5" />
								</div>
								<div>
									<h2 className="text-sm font-bold tracking-tight">
										{t("home.tab_file")}
									</h2>
									<p className="text-[10px] text-muted-foreground font-bold">
										{t("home.files_selected", {
											count: files.length,
										})}
									</p>
								</div>
							</div>

							{!isUploading && (
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={handleAddClick}
										className="h-8 text-[11px] font-bold rounded-lg px-4 border-primary/20 hover:bg-primary/5 text-primary"
									>
										{t("home.add_files")}
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={onClearFile}
										className="h-8 text-[11px] font-bold rounded-lg px-4 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
									>
										{t("common.clear_all")}
									</Button>
								</div>
							)}
						</div>

						<div className="flex flex-wrap justify-center gap-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar py-2">
							{files.map((file) => (
								<FileUploadItem
									key={file.id}
									file={file}
									isUploading={isUploading}
									onRemove={onRemoveFile}
								/>
							))}
						</div>
					</div>
				) : (
					<div className="w-full">
						<label
							onClick={handleAddClick}
							className={cn(
								"relative flex flex-col items-center justify-center gap-6 p-10 min-h-[300px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
								"hover:bg-primary/5 hover:border-primary/30 group/upload",
							)}
						>
							<div className="flex flex-col items-center gap-4 text-center">
								<div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover/upload:scale-110 group-hover/upload:bg-primary group-hover/upload:text-white transition-all duration-500">
									<FileUp className="h-8 w-8" />
								</div>
								<h2 className="text-xl font-bold tracking-tight">
									{t("home.tab_file")}
								</h2>
								<p className="text-muted-foreground text-sm font-medium">
									{t("home.file_drop")}
								</p>
								<p className="text-[10px] font-bold text-muted-foreground/60 pt-2">
									{t("home.file_max_size", {
										size: `${CONFIG.defaults.maxFileSize / (1024 * 1024)}MB`,
									})}
								</p>
							</div>
							<div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/60">
								<div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/50">
									<span className="text-emerald-500">✓</span>{" "}
									{t("home.file_features.secure")}
								</div>
								<div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50 border border-border/50">
									<span className="text-emerald-500">✓</span>{" "}
									{t("home.file_features.share")}
								</div>
							</div>
						</label>
					</div>
				)}

				{uploadError && (
					<div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
						{uploadError}
					</div>
				)}
			</div>
		</div>
	);
};
