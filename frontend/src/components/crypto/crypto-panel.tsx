import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	encryptFiles,
	decryptFiles,
	writeToDirectory,
	readFilesFromDirectory,
	deleteFilesFromDirectory,
	downloadAsZip,
	type EncryptedFile,
	type DecryptedFile,
} from "@/lib/crypto";
import {
	Lock,
	Unlock,
	FolderOpen,
	FileText,
	KeyRound,
	CheckCircle2,
	AlertCircle,
	Loader2,
	UploadCloud,
	FileDown,
} from "lucide-react";

type ProcessState = "idle" | "processing" | "done" | "error";

async function getFilesFromDragEvent(
	e: DragEvent<HTMLDivElement>,
): Promise<File[]> {
	const items = Array.from(e.dataTransfer.items);
	const filesPromises = items.map(async (item) => {
		if (item.kind !== "file") return [];
		if (typeof item.webkitGetAsEntry === "function") {
			const entry = item.webkitGetAsEntry();
			if (entry) {
				return readEntry(entry);
			}
		}
		const file = item.getAsFile();
		return file ? [file] : [];
	});
	const results = await Promise.all(filesPromises);
	return results.flat();
}

async function readEntry(entry: FileSystemEntry, path = ""): Promise<File[]> {
	if (entry.isFile) {
		const fileEntry = entry as FileSystemFileEntry;
		return new Promise((resolve) => {
			fileEntry.file((file: File) => {
				const relPath = path ? `${path}/${file.name}` : file.name;
				const patchedFile = new File([file], file.name, {
					type: file.type,
				});
				Object.defineProperty(patchedFile, "webkitRelativePath", {
					value: relPath,
					writable: false,
				});
				resolve([patchedFile]);
			});
		});
	} else if (entry.isDirectory) {
		const dirEntry = entry as FileSystemDirectoryEntry;
		const reader = dirEntry.createReader();
		const entries = await new Promise<FileSystemEntry[]>((resolve) => {
			reader.readEntries(resolve);
		});
		const files: File[] = [];
		for (const child of entries) {
			const childFiles = await readEntry(
				child,
				path ? `${path}/${entry.name}` : entry.name,
			);
			files.push(...childFiles);
		}
		return files;
	}
	return [];
}

function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function CryptoPanel({ mode }: { mode: "encrypt" | "decrypt" }) {
	const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [dirHandle, setDirHandle] =
		useState<FileSystemDirectoryHandle | null>(null);
	const [dirName, setDirName] = useState("");
	const [state, setState] = useState<ProcessState>("idle");
	const [progress, setProgress] = useState(0);
	const [currentFile, setCurrentFile] = useState("");
	const [currentSizeBytes, setCurrentSizeBytes] = useState(0);
	const [zipProgress, setZipProgress] = useState(-1);
	const [result, setResult] = useState<(EncryptedFile | DecryptedFile)[] | null>(null);
	const [error, setError] = useState("");
	const [isDragging, setIsDragging] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const folderInputRef = useRef<HTMLInputElement>(null);

	const isEncrypt = mode === "encrypt";
	const showDirectoryPickerSupported = "showDirectoryPicker" in window;

	const handlePickFolder = async () => {
		try {
			const handle = await (
				window as unknown as {
					showDirectoryPicker(options?: {
						mode?: string;
						startIn?: string;
					}): Promise<FileSystemDirectoryHandle>;
				}
			).showDirectoryPicker({ mode: "readwrite" });
			setDirHandle(handle);
			setDirName(handle.name);
			setState("idle");
			setResult(null);
			setError("");

			const allFiles = await readFilesFromDirectory(handle);
			setFiles(allFiles);
		} catch {
			// User cancelled
		}
	};

	const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFiles(Array.from(e.target.files));
			setDirHandle(null);
			setDirName("");
			setState("idle");
			setResult(null);
			setError("");
		}
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		setState("idle");
		setResult(null);
		setError("");
		try {
			const droppedFiles = await getFilesFromDragEvent(e);
			if (droppedFiles.length > 0) {
				setFiles(droppedFiles);
				setDirHandle(null);
				setDirName("");
			}
		} catch {
			setError(t(isEncrypt ? "tools.encrypt_error" : "tools.decrypt_error"));
		}
	};

	const handleProcess = async () => {
		if (!password) {
			setError(t("tools.password_required"));
			return;
		}
		if (isEncrypt && password !== confirmPassword) {
			setError(t("tools.password_mismatch"));
			return;
		}
		if (files.length === 0) {
			setError(t("tools.no_files"));
			return;
		}

		setState("processing");
		setError("");
		setProgress(0);
		setCurrentFile("");
		setCurrentSizeBytes(0);

		try {
			let allResults: (EncryptedFile | DecryptedFile)[];
			if (isEncrypt) {
				allResults = await encryptFiles(
					files,
					password,
					(filename, bytes, index) => {
						setCurrentFile(`[Encrypting] ${filename}`);
						setCurrentSizeBytes(bytes);
						setProgress(Math.round(((index + 1) / files.length) * 80));
					},
				);
			} else {
				allResults = await decryptFiles(
					files,
					password,
					(filename, bytes, index) => {
						setCurrentFile(`[Decrypting] ${filename}`);
						setCurrentSizeBytes(bytes);
						setProgress(Math.round(((index + 1) / files.length) * 80));
					},
				);
			}

			if (dirHandle) {
				const outputFiles = await Promise.all(
					allResults.map(async (f) => ({
						blob: isEncrypt 
							? (f as EncryptedFile).blob 
							: new Blob([await (f as DecryptedFile).file.arrayBuffer()], { type: (f as DecryptedFile).file.type }),
						path: isEncrypt ? (f as EncryptedFile).outputName : (f as DecryptedFile).originalPath,
					})),
				);
				
				await writeToDirectory(
					dirHandle,
					outputFiles,
					(path, bytes, index) => {
						setCurrentFile(`[Writing output] ${path}`);
						setCurrentSizeBytes(bytes);
						setProgress(
							80 + Math.round(((index + 1) / outputFiles.length) * 15),
						);
					},
				);

				const sourcePaths = files.map(
					(f) =>
						(f as File & { webkitRelativePath?: string })
							.webkitRelativePath || f.name,
				);
				await deleteFilesFromDirectory(
					dirHandle,
					sourcePaths,
					(path, index) => {
						setCurrentFile(`[Deleting source] ${path}`);
						setCurrentSizeBytes(0);
						setProgress(
							95 + Math.round(((index + 1) / sourcePaths.length) * 5),
						);
					},
				);
			}

			setResult(allResults);
			setState("done");
		} catch (err) {
			setError(err instanceof Error ? err.message : t(isEncrypt ? "tools.encrypt_error" : "tools.decrypt_error"));
			setState("error");
		}
	};

	const handleDownloadAll = async () => {
		if (!result) return;
		const zipName = dirName
			? `${dirName}_${isEncrypt ? "encrypted" : "decrypted"}.zip`
			: `${isEncrypt ? "encrypted" : "decrypted"}_files.zip`;
		
		const fileList = await Promise.all(
			result.map(async (f) => ({
				blob: isEncrypt 
					? (f as EncryptedFile).blob 
					: new Blob([await (f as DecryptedFile).file.arrayBuffer()], { type: (f as DecryptedFile).file.type }),
				path: isEncrypt ? (f as EncryptedFile).outputName : (f as DecryptedFile).originalPath,
			}))
		);

		setZipProgress(0);
		await downloadAsZip(fileList, zipName, (_path, _bytes, index) => {
			setZipProgress(Math.round(((index + 1) / fileList.length) * 100));
		});
		setZipProgress(-1);
	};

	const handleReset = () => {
		setFiles([]);
		setDirHandle(null);
		setDirName("");
		setState("idle");
		setResult(null);
		setProgress(0);
		setCurrentFile("");
		setCurrentSizeBytes(0);
		setError("");
		setPassword("");
		setConfirmPassword("");
	};

	return (
		<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					{isEncrypt ? <Lock className="h-5 w-5 text-primary" /> : <Unlock className="h-5 w-5 text-primary" />}
					{t(isEncrypt ? "tools.encrypt_title" : "tools.decrypt_title")}
				</CardTitle>
				<CardDescription>{t(isEncrypt ? "tools.encrypt_desc" : "tools.decrypt_desc")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{state === "idle" && (
					<div
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all ${
							isDragging
								? "border-primary bg-primary/5 scale-[0.99]"
								: "border-border/60 hover:border-primary/55 bg-muted/10"
						}`}
					>
						<UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
						<p className="text-sm font-medium text-center mb-1 text-foreground/80">
							{t(isEncrypt ? "tools.drag_drop_prompt" : "tools.drag_drop_decrypt_prompt", isEncrypt ? "Drag & drop files here" : "Drag & drop encrypted files here")}
						</p>
						<p className="text-xs text-muted-foreground text-center mb-4">
							{t("tools.or")}
						</p>
						<div className="flex flex-wrap gap-2 justify-center">
							{showDirectoryPickerSupported ? (
								<Button variant="outline" size="sm" onClick={handlePickFolder} className="gap-2">
									<FolderOpen className="h-4 w-4" />
									{t("tools.pick_folder")}
								</Button>
							) : (
								isEncrypt && <Button
									variant="outline"
									size="sm"
									onClick={() => folderInputRef.current?.click()}
									className="gap-2"
								>
									<FolderOpen className="h-4 w-4" />
									{t("tools.choose_folder")}
								</Button>
							)}
							<Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
								<FileText className="h-4 w-4" />
								{t("tools.choose_files")}
							</Button>
						</div>

						<input
							ref={fileInputRef}
							type="file"
							multiple
							className="hidden"
							onChange={handleFileInputChange}
						/>
						{isEncrypt && <input
							ref={folderInputRef}
							type="file"
							multiple
							// @ts-expect-error: webkitdirectory is non-standard but required for folder upload
							webkitdirectory=""
							directory=""
							className="hidden"
							onChange={handleFileInputChange}
						/>}
					</div>
				)}

				{files.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm font-medium">
							<span className="text-muted-foreground">
								{t(isEncrypt ? "tools.select_files" : "tools.select_encrypted")}
							</span>
							<span className="text-primary">
								{dirName ? `Folder: ${dirName}` : `${files.length} files`}
							</span>
						</div>
						<ScrollArea className="h-32 rounded-lg border border-border/50 p-2 bg-muted/20">
							<div className="space-y-1">
								{files.map((f, i) => {
									const relPath = (f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name;
									return (
										<div key={i} className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1 rounded hover:bg-muted/50">
											<FileText className="h-3 w-3 shrink-0" />
											<span className="truncate">{relPath}</span>
										</div>
									);
								})}
							</div>
						</ScrollArea>
					</div>
				)}

				{files.length > 0 && state === "idle" && (
					<div className="space-y-3">
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<KeyRound className="h-3.5 w-3.5" />
								{t("tools.password")}
							</label>
							<PasswordInput
								autoComplete="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={t("tools.password_placeholder")}
							/>
						</div>
						{isEncrypt && (
							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
									<KeyRound className="h-3.5 w-3.5" />
									{t("tools.confirm_password")}
								</label>
								<PasswordInput
									autoComplete="new-password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder={t("tools.confirm_password_placeholder")}
								/>
							</div>
						)}
					</div>
				)}

				{state === "processing" && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">
								{t(isEncrypt ? "common.encrypting" : "common.decrypting")}
							</span>
							<span className="font-medium">{progress}%</span>
						</div>
						<Progress value={progress} />
						{currentFile && (
							<div className="text-xs text-muted-foreground/80 flex items-center justify-between mt-1 px-2 py-1 rounded bg-muted/20 border border-border/20">
								<span className="truncate max-w-[70%]" title={currentFile}>
									{currentFile}
								</span>
								<span className="shrink-0 font-mono text-[10px]">
									{formatBytes(currentSizeBytes)}
								</span>
							</div>
						)}
					</div>
				)}

				{error && (
					<div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
						<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{state === "done" && result && (
					<div className="space-y-4">
						<div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">
							<CheckCircle2 className="h-4 w-4 shrink-0" />
							<span>
								{t(isEncrypt ? "tools.encrypt_success" : "tools.decrypt_success", { count: result.length })}
							</span>
						</div>

						{dirHandle ? (
							<p className="text-xs text-muted-foreground">
								{t("tools.write_back_success", "Files written back and original structures replaced inside the folder.")}
							</p>
						) : (
							<Button onClick={handleDownloadAll} className="w-full gap-2" variant="default" disabled={zipProgress >= 0}>
								{zipProgress >= 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
								{zipProgress >= 0 ? `Packing ZIP (${zipProgress}%)` : t("tools.download_all")}
							</Button>
						)}

						<ScrollArea className="h-40 rounded-lg border border-border/50 p-2 bg-muted/10">
							<div className="space-y-1">
								{result.map((f, i) => (
									<div key={i} className="flex items-center justify-between gap-4 text-xs px-2 py-1.5 rounded hover:bg-muted/50">
										<div className="flex items-center gap-2 min-w-0 flex-1">
											<FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
											<span className="truncate" title={isEncrypt ? (f as EncryptedFile).originalPath : (f as DecryptedFile).originalPath}>
												{isEncrypt ? (f as EncryptedFile).originalPath : (f as DecryptedFile).originalPath}
											</span>
										</div>
										<div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-muted-foreground/80">
											<span>→</span>
											<span>{isEncrypt ? (f as EncryptedFile).outputName : (f as DecryptedFile).originalPath}</span>
										</div>
									</div>
								))}
							</div>
						</ScrollArea>

						<Button variant="outline" onClick={handleReset} className="w-full gap-2">
							{t(isEncrypt ? "tools.encrypt_more" : "tools.decrypt_more")}
						</Button>
					</div>
				)}

				{state !== "done" && files.length > 0 && (
					<Button
						onClick={handleProcess}
						disabled={state === "processing" || files.length === 0 || !password}
						className="w-full gap-2"
					>
						{state === "processing" ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : isEncrypt ? (
							<Lock className="h-4 w-4" />
						) : (
							<Unlock className="h-4 w-4" />
						)}
						{state === "processing"
							? t(isEncrypt ? "common.encrypting" : "common.decrypting")
							: t(isEncrypt ? "tools.encrypt_button" : "tools.decrypt_button")}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
