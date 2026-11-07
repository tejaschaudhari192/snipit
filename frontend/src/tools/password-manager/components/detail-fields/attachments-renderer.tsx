import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Download,
	FileTextIcon,
	Image as ImageIcon,
	Loader2,
	Lock,
} from "lucide-react";
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
} from "@/components/ui/attachment";
import { toast } from "@/components/ui/toast";
import type { ItemAttachment } from "@/tools/password-manager/types";
import { formatFileSize } from "@/tools/password-manager/utils/file-utils";
import { downloadAndDecryptVaultAttachment } from "../../services/attachment-storage.service";

export function AttachmentsRenderer({
	attachments,
}: {
	attachments?: ItemAttachment[];
}) {
	const { t } = useTranslation();
	const [downloadingId, setDownloadingId] = useState<string | null>(null);

	if (!attachments || attachments.length === 0) return null;

	const handleDownload = async (att: ItemAttachment) => {
		try {
			setDownloadingId(att.id);

			// Download & decrypt from Supabase Storage with the auto-generated per-attachment key
			if (att.storagePath && att.encKey) {
				const decryptedBlob =
					await downloadAndDecryptVaultAttachment(att);
				const url = URL.createObjectURL(decryptedBlob);
				const a = document.createElement("a");
				a.href = url;
				a.download = att.fileName;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
		} catch (error: unknown) {
			console.error("Failed to download/decrypt attachment:", error);
			toast.add({
				title:
					(error as Error)?.message ||
					"Failed to download attachment",
				type: "error",
			});
		} finally {
			setDownloadingId(null);
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<h3 className="text-sm font-semibold text-foreground">
					{t("tools.password_manager.attachments", {
						defaultValue: "Attachments",
					})}
				</h3>
				<span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
					{attachments.length}
				</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
				{attachments.map((att) => {
					const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(
						att.fileName,
					);
					const isDownloading = downloadingId === att.id;

					return (
						<Attachment
							key={att.id}
							className="bg-background border border-border rounded-xl p-2.5"
						>
							<AttachmentMedia variant="icon">
								{isImage ? (
									<ImageIcon className="w-5 h-5 text-muted-foreground" />
								) : (
									<FileTextIcon className="w-5 h-5 text-muted-foreground" />
								)}
							</AttachmentMedia>
							<AttachmentContent className="min-w-0">
								<div className="flex items-center gap-1.5 min-w-0">
									<AttachmentTitle className="truncate text-sm font-medium">
										{att.fileName}
									</AttachmentTitle>
									{att.encKey && (
										<span
											title="E2EE Encrypted"
											className="inline-flex"
										>
											<Lock className="w-3 h-3 text-primary shrink-0" />
										</span>
									)}
								</div>
								<AttachmentDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
									<span>
										{formatFileSize(att.fileSize ?? 0)}
									</span>
									{att.storagePath && (
										<span className="text-[9px] bg-primary/10 text-primary px-1 rounded font-mono">
											Cloud
										</span>
									)}
								</AttachmentDescription>
							</AttachmentContent>
							<AttachmentActions>
								<AttachmentAction
									aria-label={`Download ${att.fileName}`}
									onClick={() => handleDownload(att)}
									disabled={isDownloading}
								>
									{isDownloading ? (
										<Loader2 className="w-4 h-4 animate-spin text-primary" />
									) : (
										<Download className="w-4 h-4" />
									)}
								</AttachmentAction>
							</AttachmentActions>
						</Attachment>
					);
				})}
			</div>
		</div>
	);
}
