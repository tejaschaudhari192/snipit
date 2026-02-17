import { Editor, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link, FileUp, X, File, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/configurations";

interface EditorContentProps {
	contentType: "text" | "code" | "link" | "file";
	language: string;
	textValue: string;
	setTextValue: (val: string) => void;
	theme: string;
	fontSize: number;
	editorContainerRef: (node: HTMLElement | null) => void;
	userInputRef: RefObject<HTMLTextAreaElement | null>;
	handleEditorWillMount: BeforeMount;
	handleEditorMount: OnMount;
	handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
	// File upload props
	onFileSelect?: (file: File) => void;
	uploadProgress?: number;
	isUploading?: boolean;
	uploadedFileName?: string | null;
	uploadError?: string | null;
	onClearFile?: () => void;
}

export const EditorContent = ({
	contentType,
	language,
	textValue,
	setTextValue,
	theme,
	fontSize,
	editorContainerRef,
	userInputRef,
	handleEditorWillMount,
	handleEditorMount,
	handlePaste,
	onFileSelect,
	uploadProgress = 0,
	isUploading = false,
	uploadedFileName,
	uploadError,
	onClearFile,
}: EditorContentProps) => {
	const { t } = useTranslation();

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const file = e.dataTransfer.files[0];
		if (file && onFileSelect) {
			onFileSelect(file);
		}
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && onFileSelect) {
			onFileSelect(file);
		}
	};

	return (
		<div
			ref={editorContainerRef}
			className="m-3 sm:m-5 h-[60vh] border rounded-md overflow-hidden touch-none"
		>
			{contentType === "code" ? (
				<Editor
					height="100%"
					language={language}
					value={textValue}
					onChange={(value) => setTextValue(value || "")}
					theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
					beforeMount={handleEditorWillMount}
					onMount={handleEditorMount}
					options={{
						minimap: { enabled: false },
						fontSize: fontSize,
						padding: { top: 16 },
						mouseWheelZoom: true,
						wordWrap: "on",
					}}
				/>
			) : contentType === "file" ? (
				<div
					className="h-full w-full bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center"
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<div className="w-full max-w-2xl space-y-6 relative z-10 px-4">
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="p-4 rounded-full bg-primary/10 text-primary backdrop-blur-sm border border-primary/20">
								<FileUp className="h-8 w-8" />
							</div>
							<h2 className="text-2xl font-bold tracking-tight">
								{t("home.tab_file", "Upload File")}
							</h2>
							<p className="text-muted-foreground">
								{t(
									"home.file_desc",
									"Upload any file to share with a unique link",
								)}
							</p>
						</div>

						{uploadedFileName ? (
							<div
								className={cn(
									"relative p-6 rounded-xl border-2 border-primary/30 bg-primary/5 backdrop-blur-md transition-all",
									isUploading &&
										"border-primary/50 bg-primary/10 shadow-lg shadow-primary/10",
								)}
							>
								<div className="flex items-center gap-4">
									<div className="p-3 rounded-lg bg-primary/20">
										{isUploading ? (
											<Loader2 className="h-6 w-6 text-primary animate-spin" />
										) : uploadProgress === 100 ? (
											<CheckCircle2 className="h-6 w-6 text-primary" />
										) : (
											<File className="h-6 w-6 text-primary" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">
											{uploadedFileName}
										</p>
										<div className="flex flex-col gap-1.5">
											<p className="text-sm text-muted-foreground flex items-center gap-2">
												{isUploading ? (
													<span className="flex items-center gap-2">
														<Loader2 className="h-4 w-4 animate-spin" />
														{t(
															"home.file_uploading",
															"Uploading...",
														)}
													</span>
												) : uploadProgress === 100 ? (
													<span className="text-primary font-medium">
														{t(
															"home.file_ready",
															"Uploaded successfully",
														)}
													</span>
												) : (
													<span className="text-amber-500 font-medium italic">
														{t(
															"home.file_pending",
															"Selected, click Paste to upload",
														)}
													</span>
												)}
											</p>
											{isUploading && (
												<Progress
													value={undefined}
													className="h-1.5"
												/>
											)}
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={onClearFile}
										className="shrink-0"
										disabled={isUploading}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
						) : (
							<label
								className={cn(
									"relative flex flex-col items-center justify-center gap-4 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all",
									"border-primary/20 hover:border-primary/50 hover:bg-primary/5",
									"backdrop-blur-md bg-background/50 shadow-inner",
								)}
							>
								<input
									type="file"
									className="absolute inset-0 opacity-0 cursor-pointer"
									onChange={handleFileInputChange}
								/>
								<div className="p-4 rounded-full bg-primary/10">
									<File className="h-8 w-8 text-primary" />
								</div>
								<div className="text-center">
									<p className="font-bold text-lg">
										{t(
											"home.file_drop",
											"Drop your file here or click to browse",
										)}
									</p>
									<p className="text-sm text-muted-foreground mt-1">
										{t(
											"home.file_max_size",
											`Maximum file size: ${CONFIG.DEFAULTS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
										)}
									</p>
								</div>
							</label>
						)}

						{uploadError && (
							<div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
								{uploadError}
							</div>
						)}

						<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground font-medium">
							<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/20">
								✅{" "}
								{t(
									"home.file_features.secure",
									"Secure Upload",
								)}
							</span>
							<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/20">
								✅{" "}
								{t("home.file_features.share", "Easy Sharing")}
							</span>
						</div>
					</div>
				</div>
			) : contentType === "link" ? (
				<div className="h-full w-full bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center">
					<div className="w-full max-w-2xl space-y-6 relative z-10 px-4">
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="p-4 rounded-full bg-primary/10 text-primary backdrop-blur-sm border border-primary/20">
								<Link className="h-8 w-8" />
							</div>
							<h2 className="text-2xl font-bold tracking-tight">
								{t("home.tab_link")}
							</h2>
							<p className="text-muted-foreground">
								{t("home.link_desc")}
							</p>
						</div>
						<Input
							value={textValue}
							onChange={(e) => setTextValue(e.target.value)}
							placeholder={t("home.link_placeholder")}
							className="h-14 text-lg px-6 rounded-xl border-primary/30 focus-visible:ring-primary/50 shadow-xl bg-background/50 backdrop-blur-md"
						/>
						<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground font-medium">
							<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
								✅ {t("home.link_features.fast")}
							</span>
							<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
								✅ {t("home.link_features.custom")}
							</span>
						</div>
					</div>
				</div>
			) : (
				<Textarea
					ref={userInputRef}
					value={textValue}
					onChange={(e) => setTextValue(e.target.value)}
					placeholder={t("home.enter_snippet_placeholder")}
					className="h-full w-full mx-auto resize-none border-0 focus-visible:ring-0"
					onPaste={handlePaste}
					style={{ fontSize: `${fontSize}px` }}
				/>
			)}
		</div>
	);
};
