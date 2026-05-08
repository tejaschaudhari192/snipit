import { FileUp, X, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import FilePreview from "../common/file-preview";
import { ShimmerSection } from "@/components/common/shimmer-section";

interface FileUploadViewProps {
	uploadedFileName?: string | null;
	previewUrl?: string | null;
	fileMimeType?: string | null;
	isUploading: boolean;
	uploadProgress: number;
	uploadError?: string | null;
	onClearFile?: () => void;
	handleDragOver: (e: React.DragEvent) => void;
	handleDrop: (e: React.DragEvent) => void;
	handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isEdit?: boolean;
}

export const FileUploadView = ({
	uploadedFileName,
	previewUrl,
	fileMimeType,
	isUploading,
	uploadProgress,
	uploadError,
	onClearFile,
	handleDragOver,
	handleDrop,
	handleFileInputChange,
	isEdit = false,
}: FileUploadViewProps) => {
	const { t } = useTranslation();

	return (
		<div
			className="h-full w-full flex items-center justify-center p-6 bg-muted/5 overflow-y-auto"
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<div className="w-full max-w-xl my-auto">
				{uploadedFileName ? (
					<div className="space-y-6">
						{previewUrl && (
							<FilePreview
								url={previewUrl}
								fileName={uploadedFileName}
								mimeType={fileMimeType || ""}
								maxHeight="180px"
							/>
						)}
						{!previewUrl && (
							<div className="flex flex-col items-center gap-2 text-center">
								<div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
									<FileUp className="h-5 w-5" />
								</div>
								<h2 className="text-lg font-bold tracking-tight">
									{t("home.tab_file")}
								</h2>
							</div>
						)}
						<div
							className={cn(
								"relative p-6 rounded-2xl border-2 transition-all duration-300",
								isUploading
									? "border-primary/30 bg-primary/5"
									: "border-primary/10 bg-background shadow-sm",
							)}
						>
							<div className="flex items-center gap-5 relative z-10">
								<div className="relative">
									{isUploading ? (
										<div className="p-3.5 rounded-xl transition-colors duration-300">
											<ShimmerSection
												type="loader"
												className="h-6 w-6 p-0"
											/>
										</div>
									) : uploadProgress === 100 ? (
										<div className="p-3.5 rounded-xl bg-emerald-500 text-white transition-colors duration-300">
											<CheckCircle2 className="h-6 w-6" />
										</div>
									) : (
										<div className="p-3.5 rounded-xl bg-primary/10 text-primary transition-colors duration-300">
											<FileTypeIcon
												fileName={uploadedFileName}
												mimeType={fileMimeType}
												className="h-6 w-6"
											/>
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-1.5">
										<p className="font-semibold text-lg truncate pr-3 text-foreground/90">
											{uploadedFileName}
										</p>
										{!isUploading && (
											<Button
												variant="ghost"
												size="icon"
												onClick={onClearFile}
												className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0"
											>
												<X className="h-4 w-4" />
											</Button>
										)}
									</div>
									<div className="flex flex-col gap-2.5">
										<div className="flex items-center justify-between text-xs">
											<div className="font-medium">
												{isUploading ? (
													<span className="text-primary flex items-center gap-1.5">
														<span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
														{t(
															"home.file_uploading",
														)}
													</span>
												) : uploadProgress === 100 ? (
													<span className="text-emerald-500 flex items-center gap-1.5">
														<CheckCircle2 className="h-3.5 w-3.5" />
														{t("home.file_ready")}
													</span>
												) : (
													<span className="text-muted-foreground flex items-center gap-1.5">
														<div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
														{isEdit &&
														uploadProgress === 0 &&
														!previewUrl?.startsWith(
															"blob:",
														)
															? t(
																	"home.file_previously_uploaded",
																)
															: t(
																	"home.file_selected",
																)}
													</span>
												)}
											</div>
											{isUploading && (
												<span className="font-bold text-primary tabular-nums">
													{Math.round(uploadProgress)}
													%
												</span>
											)}
										</div>
										<Progress
											value={
												isEdit &&
												uploadProgress === 0 &&
												!previewUrl?.startsWith("blob:")
													? 100
													: uploadProgress
											}
											className="h-1.5 bg-muted/50 rounded-full"
											indicatorClassName={cn(
												"transition-all duration-500 ease-out",
												isUploading
													? "bg-primary"
													: uploadProgress === 100 ||
														  (isEdit &&
																uploadProgress ===
																	0 &&
																!previewUrl?.startsWith(
																	"blob:",
																))
														? "bg-emerald-500"
														: "bg-primary/30",
											)}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="w-full">
						<label
							className={cn(
								"relative flex flex-col items-center justify-center gap-6 p-10 min-h-[300px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
								"hover:bg-primary/5 hover:border-primary/30 group/upload",
							)}
						>
							<input
								type="file"
								className="hidden"
								onChange={handleFileInputChange}
							/>
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
									{t("home.file_max_size")}
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
