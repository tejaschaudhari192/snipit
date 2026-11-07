import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
	Plus,
	Trash2,
	Upload,
	FileText,
	Image as ImageIcon,
	Loader2,
	Lock,
} from "lucide-react";
import type { ItemAttachment } from "@/tools/password-manager/types";
import {
	MAX_FILE_SIZE,
	ACCEPTED_FILE_TYPES,
	formatFileSize,
	isValidFileType,
} from "@/tools/password-manager/utils/file-utils";
import {
	uploadEncryptedVaultAttachment,
	deleteVaultAttachment,
} from "../../services/attachment-storage.service";

interface AttachmentsEditorProps {
	attachments: ItemAttachment[];
	userId?: string;
	itemId?: string;
	onAddAttachment: (attachment: ItemAttachment) => void;
	onRemoveAttachment: (id: string) => void;
	onReplaceAttachment: (id: string, newAttachment: ItemAttachment) => void;
}

export function AttachmentsEditor({
	attachments,
	userId,
	itemId,
	onAddAttachment,
	onRemoveAttachment,
	onReplaceAttachment,
}: AttachmentsEditorProps) {
	const { t } = useTranslation();
	const [isDragging, setIsDragging] = useState(false);
	const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

	const processFile = async (file: File, replaceId?: string) => {
		if (file.size > MAX_FILE_SIZE) {
			toast.add({
				title: t("tools.password_manager.file_too_large"),
				type: "error",
			});
			return;
		}

		if (!isValidFileType(file.name, ACCEPTED_FILE_TYPES)) {
			toast.add({
				title: t("tools.password_manager.invalid_file_type", {
					defaultValue: "Invalid file type",
				}),
				type: "error",
			});
			return;
		}

		setUploadingFiles((prev) => [...prev, file.name]);

		try {
			// Encrypt file with auto-generated key and upload to Supabase
			const newAttachment = await uploadEncryptedVaultAttachment({
				file,
				userId,
				itemId,
			});

			if (replaceId) {
				const existing = attachments.find((a) => a.id === replaceId);
				if (existing?.storagePath) {
					deleteVaultAttachment(existing.storagePath).catch(() => {});
				}
				onReplaceAttachment(replaceId, newAttachment);
			} else {
				onAddAttachment(newAttachment);
			}
		} catch (error: unknown) {
			console.error("Upload error:", error);
			toast.add({
				title:
					(error as Error)?.message ||
					"Failed to upload encrypted file",
				type: "error",
			});
		} finally {
			setUploadingFiles((prev) =>
				prev.filter((name) => name !== file.name),
			);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			Array.from(files).forEach((file) => processFile(file));
		}
	};

	return (
		<div className="space-y-3 px-6">
			<div className="flex items-center justify-between">
				<div className="space-y-0.5">
					<Label className="text-sm font-semibold text-foreground">
						{t("tools.password_manager.attachments", {
							defaultValue: "Attachments",
						})}
					</Label>
				</div>
				<div>
					<Input
						type="file"
						id="add-new-attachment"
						className="hidden"
						accept={ACCEPTED_FILE_TYPES}
						multiple
						onChange={(e) => {
							const files = e.target.files;
							if (!files) return;
							Array.from(files).forEach((file) =>
								processFile(file),
							);
							e.target.value = "";
						}}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => {
							document
								.getElementById("add-new-attachment")
								?.click();
						}}
						className="h-8 px-3 rounded-lg border-border/80 hover:bg-muted/50 font-medium text-xs gap-1.5"
					>
						<Plus className="h-3.5 w-3.5" />
						{t("tools.password_manager.add_attachment", {
							defaultValue: "Add File",
						})}
					</Button>
				</div>
			</div>

			{/* Uploading Status Banner */}
			{uploadingFiles.length > 0 && (
				<div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2 text-xs text-primary font-medium animate-pulse">
					<Loader2 className="w-4 h-4 animate-spin shrink-0" />
					<span>
						Encrypting & uploading {uploadingFiles.join(", ")}...
					</span>
				</div>
			)}

			{/* Attached Files List */}
			{attachments.length > 0 && (
				<div className="space-y-2">
					{attachments.map((att) => {
						const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
							att.fileName,
						);
						return (
							<div
								key={att.id}
								className="flex items-center justify-between p-2.5 bg-background border border-border/70 rounded-xl shadow-2xs hover:border-border transition-colors"
							>
								<div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
									<div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative">
										{isImage ? (
											<ImageIcon className="w-4 h-4 text-muted-foreground" />
										) : (
											<FileText className="w-4 h-4 text-muted-foreground" />
										)}
										{att.encKey && (
											<div
												className="absolute bottom-0 right-0 p-0.5 bg-background/80 rounded-tl"
												title="E2EE Encrypted"
											>
												<Lock className="w-2.5 h-2.5 text-primary" />
											</div>
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-foreground truncate">
											{att.fileName}
										</p>
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<span>
												{formatFileSize(
													att.fileSize ?? 0,
												)}
											</span>
											{att.storagePath && (
												<span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono">
													Encrypted Cloud
												</span>
											)}
										</div>
									</div>
								</div>

								<div className="flex items-center gap-1 shrink-0">
									<Input
										type="file"
										id={`replace-attachment-${att.id}`}
										className="hidden"
										accept={ACCEPTED_FILE_TYPES}
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (!file) return;
											processFile(file, att.id);
											e.target.value = "";
										}}
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => {
											document
												.getElementById(
													`replace-attachment-${att.id}`,
												)
												?.click();
										}}
										className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
										title={t(
											"tools.password_manager.replace",
											{
												defaultValue: "Replace",
											},
										)}
									>
										<Upload className="w-4 h-4" />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => {
											if (att.storagePath) {
												deleteVaultAttachment(
													att.storagePath,
												).catch(() => {});
											}
											onRemoveAttachment(att.id);
										}}
										className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Drop Zone Matching Inspired Design */}
			<div
				className={`flex flex-col items-center justify-center py-7 px-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
					isDragging
						? "border-primary bg-primary/5 scale-[0.99]"
						: "border-border/70 hover:border-primary/50 hover:bg-muted/15 bg-background"
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => {
					document.getElementById("add-new-attachment")?.click();
				}}
			>
				<div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2.5 text-muted-foreground group-hover:text-primary transition-colors">
					<Upload className="w-5 h-5 stroke-[1.75]" />
				</div>
				<p className="text-sm font-semibold text-foreground text-center">
					{t("tools.password_manager.drag_drop_attachments", {
						defaultValue:
							"Drag & drop files here or select to upload",
					})}
				</p>
				<p className="text-xs text-muted-foreground/80 mt-1 text-center">
					{t("tools.password_manager.attachments_desc", {
						defaultValue:
							"Securely store related documents and files",
					})}
				</p>
			</div>
		</div>
	);
}
