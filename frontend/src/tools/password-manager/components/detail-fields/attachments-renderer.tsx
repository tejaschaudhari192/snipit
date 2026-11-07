import { useTranslation } from "react-i18next";
import { Download, FileTextIcon, Image as ImageIcon } from "lucide-react";
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
} from "@/components/ui/attachment";
import type { ItemAttachment } from "@/tools/password-manager/types";
import {
	formatFileSize,
	getFileSizeFromBase64,
	downloadBase64File,
} from "@/tools/password-manager/utils/file-utils";

export function AttachmentsRenderer({
	attachments,
}: {
	attachments?: ItemAttachment[];
}) {
	const { t } = useTranslation();

	if (!attachments || attachments.length === 0) return null;

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
					return (
						<Attachment
							key={att.id}
							className="bg-background border border-border rounded-xl p-2.5"
						>
							<AttachmentMedia
								variant={isImage ? "image" : "icon"}
							>
								{isImage && att.fileContent ? (
									<img
										src={att.fileContent}
										alt={att.fileName}
										className="w-full h-full object-cover rounded-md"
									/>
								) : isImage ? (
									<ImageIcon className="w-5 h-5 text-muted-foreground" />
								) : (
									<FileTextIcon className="w-5 h-5 text-muted-foreground" />
								)}
							</AttachmentMedia>
							<AttachmentContent className="min-w-0">
								<AttachmentTitle className="truncate text-sm font-medium">
									{att.fileName}
								</AttachmentTitle>
								<AttachmentDescription className="text-xs text-muted-foreground">
									{formatFileSize(
										att.fileSize ??
											getFileSizeFromBase64(
												att.fileContent,
											),
									)}
								</AttachmentDescription>
							</AttachmentContent>
							<AttachmentActions>
								<AttachmentAction
									aria-label={`Download ${att.fileName}`}
									onClick={() =>
										downloadBase64File(
											att.fileName,
											att.fileContent,
										)
									}
								>
									<Download className="w-4 h-4" />
								</AttachmentAction>
							</AttachmentActions>
						</Attachment>
					);
				})}
			</div>
		</div>
	);
}
