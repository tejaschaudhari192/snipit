import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, FileText, Trash2, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
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

interface CredFileEditorProps {
	attachments: ItemAttachment[];
	userId?: string;
	itemId?: string;
	onFileUploaded: (attachment: ItemAttachment, autoTitle?: string) => void;
	onFileRemoved: (attachmentId: string) => void;
	title?: string;
}

export function CredFileEditor({
	attachments,
	userId,
	itemId,
	onFileUploaded,
	onFileRemoved,
	title,
}: CredFileEditorProps) {
	const { t } = useTranslation();
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const primaryFile = attachments[0];

	const processFile = async (file: File) => {
		if (file.size > MAX_FILE_SIZE) {
			toast.add({
				title: t("tools.password_manager.file_too_large"),
				type: "error",
			});
			return;
		}

		if (!isValidFileType(file.name, ACCEPTED_FILE_TYPES)) {
			toast.add({
				title: t("tools.password_manager.invalid_file_type"),
				type: "error",
			});
			return;
		}

		setIsUploading(true);
		try {
			// Encrypt and upload using Supabase Storage envelope encryption
			const newAttachment = await uploadEncryptedVaultAttachment({
				file,
				userId,
				itemId,
			});

			// If previous file existed, clean up storage
			if (primaryFile?.storagePath) {
				deleteVaultAttachment(primaryFile.storagePath).catch(() => {});
			}

			// Auto-fill title if not already provided
			const autoTitle = !title ? file.name : undefined;
			onFileUploaded(newAttachment, autoTitle);
		} catch (error: unknown) {
			console.error("Credfile upload failed:", error);
			toast.add({
				title:
					(error as Error)?.message ||
					"Failed to upload credential file",
				type: "error",
			});
		} finally {
			setIsUploading(false);
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
			processFile(files[0]);
		}
	};

	return (
		<div className="space-y-3">
			<Input
				type="file"
				id="primary-credfile-upload"
				className="hidden"
				accept={ACCEPTED_FILE_TYPES}
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) processFile(file);
					e.target.value = "";
				}}
			/>

			{isUploading ? (
				<div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col items-center justify-center gap-2 text-primary font-medium">
					<Loader2 className="w-6 h-6 animate-spin" />
					<p className="text-sm font-semibold">
						Encrypting & uploading credential file...
					</p>
					<p className="text-xs text-muted-foreground">
						Zero-knowledge encrypted client-side
					</p>
				</div>
			) : primaryFile ? (
				<div className="flex items-center justify-between p-3.5 bg-background border border-border/80 rounded-2xl shadow-xs">
					<div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
						<div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 relative">
							<FileText className="w-5 h-5 text-primary" />
							{primaryFile.encKey && (
								<div
									className="absolute -bottom-1 -right-1 p-0.5 bg-background rounded-full border border-primary/30"
									title="Zero-Knowledge Encrypted"
								>
									<Lock className="w-2.5 h-2.5 text-primary" />
								</div>
							)}
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-semibold text-foreground truncate">
								{primaryFile.fileName}
							</p>
							<div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
								<span>
									{formatFileSize(primaryFile.fileSize ?? 0)}
								</span>
								<span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono">
									Securely Encrypted
								</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-1.5 shrink-0">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => {
								document
									.getElementById("primary-credfile-upload")
									?.click();
							}}
							className="h-8 px-2.5 text-xs rounded-lg gap-1.5"
						>
							<Upload className="w-3.5 h-3.5" />
							{t("tools.password_manager.replace_file")}
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => {
								if (primaryFile.storagePath) {
									deleteVaultAttachment(
										primaryFile.storagePath,
									).catch(() => {});
								}
								onFileRemoved(primaryFile.id);
							}}
							className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg"
							aria-label="Remove file"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
				</div>
			) : (
				<div
					className={`flex flex-col items-center justify-center py-8 px-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
						isDragging
							? "border-primary bg-primary/5 scale-[0.99]"
							: "border-border/70 hover:border-primary/50 hover:bg-muted/15 bg-background"
					}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={() => {
						document
							.getElementById("primary-credfile-upload")
							?.click();
					}}
				>
					<div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
						<Upload className="w-6 h-6 stroke-[1.75]" />
					</div>
					<p className="text-sm font-semibold text-foreground text-center">
						{t("tools.password_manager.upload_file")}
					</p>
					<p className="text-xs text-muted-foreground/80 mt-1 text-center max-w-xs">
						{t("tools.password_manager.upload_file_desc")}
					</p>
				</div>
			)}
		</div>
	);
}
