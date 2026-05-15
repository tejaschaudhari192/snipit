import { useTranslation } from "react-i18next";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileTypeIcon } from "@/components/common/file-type-icon";
import { ShimmerSection } from "./shimmer-section";
import { cn } from "@/utils";
import type { FileUploadStatus } from "@/lib/file-service";

interface FileUploadItemProps {
	file: FileUploadStatus;
	isUploading: boolean;
	onRemove?: (id: string) => void;
}

export const FileUploadItem = ({
	file,
	isUploading,
	onRemove,
}: FileUploadItemProps) => {
	const { t } = useTranslation();

	return (
		<div
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
								mimeType={file.fileMimeType}
								className="h-5 w-5"
							/>
						</div>
					)}
				</div>
				{!isUploading && (
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onRemove?.(file.id)}
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
									{t("home.file_uploading")}
								</span>
							) : file.progress === 100 ? (
								<span className="text-emerald-500">
									{t("home.file_ready")}
								</span>
							) : (
								<span className="text-muted-foreground">
									{t("home.file_selected")}
								</span>
							)}
						</div>
						{(file.isUploading || file.progress > 0) && (
							<span className="font-black text-primary tabular-nums">
								{Math.round(file.progress)}%
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
	);
};
