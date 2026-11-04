import type { CustomField } from "@/tools/password-manager/types";
import { Download, FileTextIcon } from "lucide-react";
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
} from "@/components/ui/attachment";

export function CustomFieldRenderer({ field }: { field: CustomField }) {
	const isFileType = field.type === "file" && field.fileName;
	const isImage =
		isFileType &&
		/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(field.fileName ?? "");

	const handleDownload = () => {
		if (!field.fileContent) return;
		try {
			const base64 = field.fileContent.split(",")[1] ?? field.fileContent;
			const byteCharacters = atob(base64);
			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);
			const mimeType =
				field.fileContent.split(";")[0]?.split(":")[1] ??
				"application/octet-stream";
			const blob = new Blob([byteArray], { type: mimeType });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = field.fileName ?? "download";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {
			const url = field.fileContent.startsWith("data:")
				? field.fileContent
				: `data:application/octet-stream;base64,${field.fileContent}`;
			const a = document.createElement("a");
			a.href = url;
			a.download = field.fileName ?? "download";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}
	};

	return (
		<div className="bg-background rounded-xl px-3 py-2.5 border border-border overflow-hidden">
			<p className="text-xs text-muted-foreground mb-0.5 truncate">
				{field.name}
			</p>
			{isFileType ? (
				<Attachment>
					<AttachmentMedia variant={isImage ? "image" : "icon"}>
						{isImage ? (
							<img
								src={field.fileContent ?? ""}
								alt={field.fileName ?? ""}
								className="w-full h-full object-cover"
							/>
						) : (
							<FileTextIcon className="w-5 h-5" />
						)}
					</AttachmentMedia>
					<AttachmentContent>
						<AttachmentTitle>{field.fileName}</AttachmentTitle>
						<AttachmentDescription>
							{field.fileContent
								? `${
										Math.round(
											(atob(
												field.fileContent.split(
													",",
												)[1] ?? field.fileContent,
											).length *
												3) /
												4,
										) / 1024
									} KB`
								: "File"}
						</AttachmentDescription>
					</AttachmentContent>
					<AttachmentActions>
						<AttachmentAction
							aria-label={`Download ${field.fileName}`}
							onClick={handleDownload}
						>
							<Download className="w-4 h-4" />
						</AttachmentAction>
					</AttachmentActions>
				</Attachment>
			) : field.type === "password" ? (
				<span className="text-sm font-mono text-foreground">
					••••••••
				</span>
			) : field.type === "color" ? (
				<span className="inline-flex items-center gap-2 text-sm text-foreground">
					<span
						className="w-4 h-4 rounded-full border border-border"
						style={{ backgroundColor: field.value }}
					/>
					{field.value}
				</span>
			) : field.type === "url" ? (
				<a
					href={
						field.value.startsWith("http")
							? field.value
							: `https://${field.value}`
					}
					target="_blank"
					rel="noopener noreferrer"
					className="text-sm text-primary hover:text-primary/80 truncate block transition-colors"
				>
					{field.value}
				</a>
			) : (
				<span className="text-sm text-foreground wrap-break-word block">
					{field.value}
				</span>
			)}
		</div>
	);
}
