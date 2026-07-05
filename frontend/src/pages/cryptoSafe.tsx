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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	Shield,
	FileText,
	KeyRound,
	CheckCircle2,
	AlertCircle,
	Loader2,
	UploadCloud,
	FileDown,
} from "lucide-react";

type ProcessState = "idle" | "processing" | "done" | "error";

// Recursive directory and file drag-and-drop processing
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

const CryptoSafePage = () => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">(
		"encrypt",
	);

	return (
		<div className="min-h-full bg-background text-foreground transition-colors duration-300">
			<section className="relative py-12 md:py-16 px-4 overflow-hidden">
				<div className="max-w-4xl mx-auto text-center relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
					<div className="flex flex-col items-center justify-center w-full">
						<div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-xs md:text-sm font-bold mb-6 ring-1 ring-primary/20 backdrop-blur-sm shadow-lg shadow-primary/5">
							<Shield className="w-4 h-4 fill-current" />
							{t("tools.badge")}
						</div>
						<h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-[1.1] text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/95 to-foreground/80">
							{t("tools.cryptoSafe_title")}
						</h1>
						<p className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
							{t("tools.subtitle")}
						</p>
					</div>
				</div>
			</section>

			<section className="pb-16 px-4 md:px-8 max-w-2xl mx-auto">
				<Tabs
					value={activeTab}
					onValueChange={(v) =>
						setActiveTab(v as "encrypt" | "decrypt")
					}
					className="w-full"
				>
					<TabsList className="grid grid-cols-2 w-full mb-8 bg-muted/50 p-1 rounded-xl">
						<TabsTrigger
							value="encrypt"
							className="flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
						>
							<Lock className="h-4 w-4" />
							{t("tools.encrypt_tab")}
						</TabsTrigger>
						<TabsTrigger
							value="decrypt"
							className="flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
						>
							<Unlock className="h-4 w-4" />
							{t("tools.decrypt_tab")}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="encrypt" className="outline-none">
						<EncryptPanel />
					</TabsContent>

					<TabsContent value="decrypt" className="outline-none">
						<DecryptPanel />
					</TabsContent>
				</Tabs>
			</section>
		</div>
	);
};

// ---- Encrypt Panel ----

const EncryptPanel = () => {
	const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [dirHandle, setDirHandle] =
		useState<FileSystemDirectoryHandle | null>(null);
	const [dirName, setDirName] = useState("");
	const [state, setState] = useState<ProcessState>("idle");
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<EncryptedFile[] | null>(null);
	const [error, setError] = useState("");
	const [isDragging, setIsDragging] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const folderInputRef = useRef<HTMLInputElement>(null);

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
			setError(t("tools.encrypt_error"));
		}
	};

	const handleEncrypt = async () => {
		if (!password) {
			setError(t("tools.password_required"));
			return;
		}
		if (password !== confirmPassword) {
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

		try {
			const batchSize = Math.max(1, Math.floor(files.length / 10));
			const allResults: EncryptedFile[] = [];

			for (let i = 0; i < files.length; i += batchSize) {
				const batch = files.slice(i, i + batchSize);
				const batchResults = await encryptFiles(batch, password);
				allResults.push(...batchResults);
				setProgress(
					Math.min(
						100,
						Math.round(((i + batch.length) / files.length) * 100),
					),
				);
			}

			if (dirHandle) {
				const outputFiles = allResults.map((f) => ({
					blob: f.blob,
					path: f.outputName,
				}));
				await writeToDirectory(dirHandle, outputFiles);

				const sourcePaths = files.map(
					(f) =>
						(f as File & { webkitRelativePath?: string })
							.webkitRelativePath || f.name,
				);
				await deleteFilesFromDirectory(dirHandle, sourcePaths);
			}

			setResult(allResults);
			setState("done");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : t("tools.encrypt_error"),
			);
			setState("error");
		}
	};

	const handleDownloadAll = async () => {
		if (!result) return;
		const zipName = dirName
			? `${dirName}_encrypted.zip`
			: "encrypted_files.zip";
		const fileList = result.map((f) => ({
			blob: f.blob,
			path: f.outputName,
		}));
		await downloadAsZip(fileList, zipName);
	};

	const handleReset = () => {
		setFiles([]);
		setDirHandle(null);
		setDirName("");
		setState("idle");
		setResult(null);
		setProgress(0);
		setError("");
	};

	return (
		<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Lock className="h-5 w-5 text-primary" />
					{t("tools.encrypt_title")}
				</CardTitle>
				<CardDescription>{t("tools.encrypt_desc")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Drag and Drop Container */}
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
							{t(
								"tools.drag_drop_prompt",
								"Drag & drop files or folders here",
							)}
						</p>
						<p className="text-xs text-muted-foreground text-center mb-4">
							{t("tools.or", "or")}
						</p>
						<div className="flex flex-wrap gap-2 justify-center">
							{showDirectoryPickerSupported && (
								<Button
									variant="outline"
									size="sm"
									onClick={handlePickFolder}
									className="gap-2"
								>
									<FolderOpen className="h-4 w-4" />
									{t("tools.pick_folder")}
								</Button>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								className="gap-2"
							>
								<FileText className="h-4 w-4" />
								{t("tools.choose_files", "Choose Files")}
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => folderInputRef.current?.click()}
								className="gap-2"
							>
								<FolderOpen className="h-4 w-4" />
								{t("tools.choose_folder", "Choose Folder")}
							</Button>
						</div>

						<input
							ref={fileInputRef}
							type="file"
							multiple
							className="hidden"
							onChange={handleFileInputChange}
						/>
						<input
							ref={folderInputRef}
							type="file"
							multiple
							// @ts-expect-error: webkitdirectory is non-standard but required for folder upload
							webkitdirectory=""
							directory=""
							className="hidden"
							onChange={handleFileInputChange}
						/>
					</div>
				)}

				{/* Selected Files Detail */}
				{files.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm font-medium">
							<span className="text-muted-foreground">
								{t("tools.select_files")}
							</span>
							<span className="text-primary">
								{dirName
									? `Folder: ${dirName}`
									: `${files.length} files`}
							</span>
						</div>
						<ScrollArea className="h-32 rounded-lg border border-border/50 p-2 bg-muted/20">
							<div className="space-y-1">
								{files.map((f, i) => {
									const relPath =
										(
											f as File & {
												webkitRelativePath?: string;
											}
										).webkitRelativePath || f.name;
									return (
										<div
											key={i}
											className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1 rounded hover:bg-muted/50"
										>
											<FileText className="h-3 w-3 shrink-0" />
											<span className="truncate">
												{relPath}
											</span>
										</div>
									);
								})}
							</div>
						</ScrollArea>
					</div>
				)}

				{/* Password Input Fields */}
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
						<div className="space-y-2">
							<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
								<KeyRound className="h-3.5 w-3.5" />
								{t("tools.confirm_password")}
							</label>
							<PasswordInput
								autoComplete="new-password"
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								placeholder={t(
									"tools.confirm_password_placeholder",
								)}
							/>
						</div>
					</div>
				)}

				{/* Progress Indicator */}
				{state === "processing" && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">
								{t("common.encrypting")}
							</span>
							<span className="font-medium">{progress}%</span>
						</div>
						<Progress value={progress} />
					</div>
				)}

				{/* Error Banner */}
				{error && (
					<div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
						<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* Processing Completed Screen */}
				{state === "done" && result && (
					<div className="space-y-4">
						<div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">
							<CheckCircle2 className="h-4 w-4 shrink-0" />
							<span>
								{t("tools.encrypt_success", {
									count: result.length,
								})}
							</span>
						</div>

						{dirHandle ? (
							<p className="text-xs text-muted-foreground">
								{t(
									"tools.write_back_success",
									"Files written back and original structures replaced inside the folder.",
								)}
							</p>
						) : (
							<Button
								onClick={handleDownloadAll}
								className="w-full gap-2"
								variant="default"
							>
								<FileDown className="h-4 w-4" />
								{t("tools.download_all")}
							</Button>
						)}

						<ScrollArea className="h-40 rounded-lg border border-border/50 p-2 bg-muted/10">
							<div className="space-y-1">
								{result.map((f, i) => (
									<div
										key={i}
										className="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-muted/50"
									>
										<FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
										<span className="truncate">
											{f.originalPath}
										</span>
										<span className="text-muted-foreground/50">
											→
										</span>
										<span className="truncate font-mono text-[10px]">
											{f.outputName}
										</span>
									</div>
								))}
							</div>
						</ScrollArea>

						<Button
							variant="outline"
							onClick={handleReset}
							className="w-full gap-2"
						>
							{t("tools.encrypt_more")}
						</Button>
					</div>
				)}

				{/* Encrypt Action Trigger Button */}
				{state !== "done" && files.length > 0 && (
					<Button
						onClick={handleEncrypt}
						disabled={
							state === "processing" ||
							files.length === 0 ||
							!password
						}
						className="w-full gap-2"
					>
						{state === "processing" ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Lock className="h-4 w-4" />
						)}
						{state === "processing"
							? t("common.encrypting")
							: t("tools.encrypt_button")}
					</Button>
				)}
			</CardContent>
		</Card>
	);
};

// ---- Decrypt Panel ----

const DecryptPanel = () => {
	const { t } = useTranslation();
	const [password, setPassword] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [dirHandle, setDirHandle] =
		useState<FileSystemDirectoryHandle | null>(null);
	const [dirName, setDirName] = useState("");
	const [state, setState] = useState<ProcessState>("idle");
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<DecryptedFile[] | null>(null);
	const [error, setError] = useState("");
	const [isDragging, setIsDragging] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

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
			setError(t("tools.decrypt_error"));
		}
	};

	const handleDecrypt = async () => {
		if (!password) {
			setError(t("tools.password_required"));
			return;
		}
		if (files.length === 0) {
			setError(t("tools.no_files"));
			return;
		}

		setState("processing");
		setError("");
		setProgress(0);

		try {
			const batchSize = Math.max(1, Math.floor(files.length / 10));
			const allResults: DecryptedFile[] = [];

			for (let i = 0; i < files.length; i += batchSize) {
				const batch = files.slice(i, i + batchSize);
				const batchResults = await decryptFiles(batch, password);
				allResults.push(...batchResults);
				setProgress(
					Math.min(
						100,
						Math.round(((i + batch.length) / files.length) * 100),
					),
				);
			}

			if (dirHandle) {
				const outputFiles = await Promise.all(
					allResults.map(async (f) => ({
						blob: new Blob([await f.file.arrayBuffer()], {
							type: f.file.type,
						}),
						path: f.originalPath,
					})),
				);
				await writeToDirectory(dirHandle, outputFiles);

				const sourcePaths = files.map(
					(f) =>
						(f as File & { webkitRelativePath?: string })
							.webkitRelativePath || f.name,
				);
				await deleteFilesFromDirectory(dirHandle, sourcePaths);
			}

			setResult(allResults);
			setState("done");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : t("tools.decrypt_error"),
			);
			setState("error");
		}
	};

	const handleDownloadAll = async () => {
		if (!result) return;
		const zipName = dirName
			? `${dirName}_decrypted.zip`
			: "decrypted_files.zip";
		const fileList = await Promise.all(
			result.map(async (f) => ({
				blob: new Blob([await f.file.arrayBuffer()], {
					type: f.file.type,
				}),
				path: f.originalPath,
			})),
		);
		await downloadAsZip(fileList, zipName);
	};

	const handleReset = () => {
		setFiles([]);
		setDirHandle(null);
		setDirName("");
		setState("idle");
		setResult(null);
		setProgress(0);
		setError("");
	};

	return (
		<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Unlock className="h-5 w-5 text-primary" />
					{t("tools.decrypt_title")}
				</CardTitle>
				<CardDescription>{t("tools.decrypt_desc")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Drag and Drop Container */}
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
							{t(
								"tools.drag_drop_decrypt_prompt",
								"Drag & drop encrypted files here",
							)}
						</p>
						<p className="text-xs text-muted-foreground text-center mb-4">
							{t("tools.or", "or")}
						</p>
						<div className="flex gap-2 justify-center">
							{"showDirectoryPicker" in window && (
								<Button
									variant="outline"
									size="sm"
									onClick={handlePickFolder}
									className="gap-2"
								>
									<FolderOpen className="h-4 w-4" />
									{t("tools.pick_folder")}
								</Button>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={() => fileInputRef.current?.click()}
								className="gap-2"
							>
								<FileText className="h-4 w-4" />
								{t("tools.choose_files", "Choose Files")}
							</Button>
						</div>

						<input
							ref={fileInputRef}
							type="file"
							multiple
							className="hidden"
							onChange={handleFileInputChange}
						/>
					</div>
				)}

				{/* Selected Files Detail */}
				{files.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm font-medium">
							<span className="text-muted-foreground">
								{t("tools.select_encrypted")}
							</span>
							<span className="text-primary">
								{dirName
									? `Folder: ${dirName}`
									: `${files.length} files`}
							</span>
						</div>
						<ScrollArea className="h-32 rounded-lg border border-border/50 p-2 bg-muted/20">
							<div className="space-y-1">
								{files.map((f, i) => {
									const relPath =
										(
											f as File & {
												webkitRelativePath?: string;
											}
										).webkitRelativePath || f.name;
									return (
										<div
											key={i}
											className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1 rounded hover:bg-muted/50"
										>
											<FileText className="h-3 w-3 shrink-0" />
											<span className="truncate">
												{relPath}
											</span>
										</div>
									);
								})}
							</div>
						</ScrollArea>
					</div>
				)}

				{/* Password Input Field */}
				{files.length > 0 && state === "idle" && (
					<div className="space-y-2">
						<label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
							<KeyRound className="h-3.5 w-3.5" />
							{t("tools.password")}
						</label>
						<PasswordInput
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder={t("tools.password_placeholder")}
						/>
					</div>
				)}

				{/* Progress Indicator */}
				{state === "processing" && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">
								{t("common.decrypting")}
							</span>
							<span className="font-medium">{progress}%</span>
						</div>
						<Progress value={progress} />
					</div>
				)}

				{/* Error Banner */}
				{error && (
					<div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
						<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* Processing Completed Screen */}
				{state === "done" && result && (
					<div className="space-y-4">
						<div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">
							<CheckCircle2 className="h-4 w-4 shrink-0" />
							<span>
								{t("tools.decrypt_success", {
									count: result.length,
								})}
							</span>
						</div>

						{dirHandle ? (
							<p className="text-xs text-muted-foreground">
								{t(
									"tools.write_back_success",
									"Files written back and original structures replaced inside the folder.",
								)}
							</p>
						) : (
							<Button
								onClick={handleDownloadAll}
								className="w-full gap-2"
								variant="default"
							>
								<FileDown className="h-4 w-4" />
								{t("tools.download_all")}
							</Button>
						)}

						<ScrollArea className="h-40 rounded-lg border border-border/50 p-2 bg-muted/10">
							<div className="space-y-1">
								{result.map((f, i) => (
									<div
										key={i}
										className="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-muted/50"
									>
										<FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
										<span className="truncate">
											{f.originalPath}
										</span>
									</div>
								))}
							</div>
						</ScrollArea>

						<Button
							variant="outline"
							onClick={handleReset}
							className="w-full gap-2"
						>
							{t("tools.decrypt_more")}
						</Button>
					</div>
				)}

				{/* Decrypt Action Trigger Button */}
				{state !== "done" && files.length > 0 && (
					<Button
						onClick={handleDecrypt}
						disabled={
							state === "processing" ||
							files.length === 0 ||
							!password
						}
						className="w-full gap-2"
					>
						{state === "processing" ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Unlock className="h-4 w-4" />
						)}
						{state === "processing"
							? t("common.decrypting")
							: t("tools.decrypt_button")}
					</Button>
				)}
			</CardContent>
		</Card>
	);
};

export default CryptoSafePage;
