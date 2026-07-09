import { memo, useState, useEffect } from "react";
import { Film, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FileUploadStatus } from "@/lib/file-service";
import { checkStreamableLink } from "@/utils/video-utils";
import { useTranslation } from "react-i18next";

interface VideoSetupViewProps {
	textValue: string;
	setTextValue: (value: string) => void;
	files: FileUploadStatus[];
	removeFile: (id: string) => void;
	onFileSelect?: (files: File[]) => void;
}

export const VideoSetupView = memo(
	({
		textValue,
		setTextValue,
		files,
		removeFile,
		onFileSelect,
	}: VideoSetupViewProps) => {
		const { t } = useTranslation();
		const [isValidating, setIsValidating] = useState(false);
		const [validationError, setValidationError] = useState<string | null>(
			null,
		);

		useEffect(() => {
			if (!textValue) {
				setValidationError(null);
				return;
			}
			const timer = setTimeout(async () => {
				setIsValidating(true);
				const res = await checkStreamableLink(textValue);
				setIsValidating(false);
				if (!res.ok) {
					setValidationError(
						res.error || t("home.video.invalid_url"),
					);
				} else {
					setValidationError(null);
				}
			}, 600);
			return () => clearTimeout(timer);
		}, [textValue, t]);

		return (
			<div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 w-full h-full bg-background/20 backdrop-blur-3xl overflow-y-auto">
				<div className="w-full max-w-xl bg-card/45 border border-border/40 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
					<div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
						<Film className="w-8 h-8 text-primary" />
					</div>
					<div className="text-center space-y-2">
						<h2 className="text-2xl font-bold tracking-tight">
							{t("home.video.setup_party")}
						</h2>
						<p className="text-sm text-muted-foreground">
							{t("home.video.setup_desc")}
						</p>
					</div>

					{/* Video URL Input */}
					<div className="w-full space-y-2.5">
						<label className="text-xs font-bold tracking-wider text-muted-foreground">
							{t("home.video.stream_link")}
						</label>
						<div className="relative flex items-center w-full">
							<Input
								placeholder="https://example.com/movie.mp4..."
								value={textValue}
								onChange={(e) => setTextValue(e.target.value)}
								className={`flex-1 h-11 pr-10 ${
									validationError
										? "border-destructive/50 focus-visible:ring-destructive/30"
										: textValue && !isValidating
											? "border-green-500/50 focus-visible:ring-green-500/30"
											: ""
								}`}
							/>
							<div className="absolute right-3 flex items-center pointer-events-none">
								{isValidating && (
									<Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
								)}
								{!isValidating && validationError && (
									<AlertCircle className="w-4 h-4 text-destructive" />
								)}
								{!isValidating &&
									textValue &&
									!validationError && (
										<CheckCircle2 className="w-4 h-4 text-green-500" />
									)}
							</div>
						</div>
						{validationError && (
							<p className="text-xs font-semibold text-destructive flex items-center gap-1 animate-in slide-in-from-top-1 duration-200">
								<AlertCircle className="w-3.5 h-3.5" />
								{validationError}
							</p>
						)}
					</div>

					<div className="flex items-center gap-4 w-full">
						<div className="h-px bg-border/40 flex-1" />
						<span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
							{t("home.video.or")}
						</span>
						<div className="h-px bg-border/40 flex-1" />
					</div>

					{/* Upload Video File */}
					<div className="w-full space-y-2.5">
						<label className="text-xs font-bold tracking-wider text-muted-foreground">
							{t("home.video.upload_local")}
						</label>
						{files.length > 0 ? (
							<div className="border border-border/50 bg-muted/10 p-4 rounded-2xl flex items-center justify-between w-full">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary/10 rounded-xl">
										<Film className="w-5 h-5 text-primary" />
									</div>
									<div className="flex flex-col">
										<span className="text-sm font-bold truncate max-w-50">
											{files[0].fileName}
										</span>
										<span className="text-xs text-muted-foreground">
											{Math.round(
												files[0].fileSize /
													(1024 * 1024),
											)}{" "}
											MB
										</span>
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => removeFile(files[0].id)}
									className="text-red-500 hover:text-red-600 font-semibold"
								>
									{t("home.video.remove")}
								</Button>
							</div>
						) : (
							<div
								onClick={() => {
									const input =
										document.createElement("input");
									input.type = "file";
									input.accept = "video/*";
									input.onchange = (e) => {
										const selected = (
											e.target as HTMLInputElement
										).files;
										if (
											selected &&
											selected.length > 0 &&
											onFileSelect
										) {
											onFileSelect(Array.from(selected));
										}
									};
									input.click();
								}}
								className="border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer w-full bg-muted/5 hover:bg-muted/10"
							>
								<Film className="w-8 h-8 text-muted-foreground" />
								<span className="text-sm font-bold">
									{t("home.video.select_file")}
								</span>
								<span className="text-xs text-muted-foreground">
									{t("home.video.supports")}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	},
);
