import { FileUp, X, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import FilePreview from "../common/file-preview";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { CONFIG } from "@/configurations";
import type { FileUploadStatus } from "@/lib/file-service";

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
									<p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
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
								<div
									key={file.id}
									className={cn(
										"relative p-4 rounded-2xl border transition-all duration-300 w-full sm:w-[240px] flex flex-col gap-3",
										file.isUploading
											? "border-primary/40 bg-primary/5 shadow-sm"
											: "border-border/50 bg-background/50 hover:bg-background hover:border-border shadow-sm",
									)}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="relative">
											{file.isUploading ? (
												<div className="p-2 rounded-xl bg-primary/10">
													<ShimmerSection
														type="loader"
														className="h-5 w-5 p-0"
													/>
												</div>
											) : file.progress === 100 ? (
												<div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
													<CheckCircle2 className="h-5 w-5" />
												</div>
											) : (
												<div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
													<FileTypeIcon
														fileName={file.fileName}
														mimeType={
															file.fileMimeType
														}
														className="h-5 w-5"
													/>
												</div>
											)}
										</div>
										{!isUploading && (
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													onRemoveFile?.(file.id)
												}
												className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0 -mt-1 -mr-1"
											>
												<X className="h-3.5 w-3.5" />
											</Button>
										)}
									</div>

									<div className="flex-1 min-w-0">
										<p className="font-bold text-sm truncate mb-1 text-foreground/90">
											{file.fileName}
										</p>
										<div className="flex flex-col gap-2">
											<div className="flex items-center justify-between text-[10px]">
												<div className="font-bold uppercase tracking-wider">
													{file.isUploading ? (
														<span className="text-primary flex items-center gap-1">
															{t(
																"home.file_uploading",
															)}
														</span>
													) : file.progress ===
													  100 ? (
														<span className="text-emerald-500">
															{t(
																"home.file_ready",
															)}
														</span>
													) : (
														<span className="text-muted-foreground">
															{t(
																"home.file_selected",
															)}
														</span>
													)}
												</div>
												{(file.isUploading ||
													file.progress > 0) && (
													<span className="font-black text-primary tabular-nums">
														{Math.round(
															file.progress,
														)}
														%
													</span>
												)}
											</div>
											<Progress
												value={file.progress}
												className="h-1.5 bg-muted/50 rounded-full overflow-hidden"
												indicatorClassName={cn(
													"transition-all duration-500 ease-out",
													file.isUploading
														? "bg-primary"
														: file.progress === 100
															? "bg-emerald-500"
															: "bg-primary/30",
												)}
											/>
										</div>
									</div>
								</div>
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
								<p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 pt-2">
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
