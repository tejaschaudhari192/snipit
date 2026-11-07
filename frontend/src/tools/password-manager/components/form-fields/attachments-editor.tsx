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
} from "lucide-react";
import type { ItemAttachment } from "@/tools/password-manager/types";
import {
	MAX_FILE_SIZE,
	ACCEPTED_FILE_TYPES,
	formatFileSize,
	getFileSizeFromBase64,
	isValidFileType,
} from "@/tools/password-manager/utils/file-utils";

interface AttachmentsEditorProps {
	attachments: ItemAttachment[];
	onAddAttachment: (attachment: ItemAttachment) => void;
	onRemoveAttachment: (id: string) => void;
	onReplaceAttachment: (id: string, newAttachment: ItemAttachment) => void;
}

export function AttachmentsEditor({
	attachments,
	onAddAttachment,
	onRemoveAttachment,
	onReplaceAttachment,
}: AttachmentsEditorProps) {
	const { t } = useTranslation();
	const [isDragging, setIsDragging] = useState(false);

	const processFile = (file: File, replaceId?: string) => {
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

		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result as string;
			const newAttachment: ItemAttachment = {
				id: replaceId ?? crypto.randomUUID(),
				fileName: file.name,
				fileContent: content,
				fileSize: file.size,
				createdAt: new Date().toISOString(),
			};

			if (replaceId) {
				onReplaceAttachment(replaceId, newAttachment);
			} else {
				onAddAttachment(newAttachment);
			}
		};
		reader.readAsDataURL(file);
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
		if (files.length > 0) {
			Array.from(files).forEach((file) => processFile(file));
		}
	};

	return (
		<div className="space-y-3 px-5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Label className="text-sm font-medium">
						{t("tools.password_manager.attachments", {
							defaultValue: "Attachments",
						})}
					</Label>
					{attachments.length > 0 && (
						<span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
							{attachments.length}
						</span>
					)}
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
					>
						<Plus className="h-3 w-3 mr-1" />
						{t("tools.password_manager.add_attachment", {
							defaultValue: "Add File",
						})}
					</Button>
				</div>
			</div>

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
								className="flex items-center justify-between p-2.5 bg-background border border-border rounded-xl shadow-2xs hover:border-border/80 transition-colors"
							>
								<div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
									<div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
										{isImage && att.fileContent ? (
											<img
												src={att.fileContent}
												alt={att.fileName}
												className="w-full h-full object-cover"
											/>
										) : isImage ? (
											<ImageIcon className="w-4 h-4 text-muted-foreground" />
										) : (
											<FileText className="w-4 h-4 text-muted-foreground" />
										)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-foreground truncate">
											{att.fileName}
										</p>
										<p className="text-xs text-muted-foreground">
											{formatFileSize(
												att.fileSize ??
													getFileSizeFromBase64(
														att.fileContent,
													),
											)}
										</p>
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
											if (file) processFile(file, att.id);
											e.target.value = "";
										}}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 text-xs text-muted-foreground hover:text-foreground"
										onClick={() => {
											document
												.getElementById(
													`replace-attachment-${att.id}`,
												)
												?.click();
										}}
									>
										<Upload className="w-3.5 h-3.5 mr-1" />
										{t("tools.password_manager.replace", {
											defaultValue: "Replace",
										})}
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() =>
											onRemoveAttachment(att.id)
										}
										className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Drag & Drop Zone */}
			<div
				className={`flex flex-col items-center justify-center p-4 border border-dashed rounded-xl transition-colors cursor-pointer text-center ${
					isDragging
						? "border-primary bg-primary/10"
						: "border-border/80 bg-muted/20 hover:bg-muted/30"
				}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => {
					document.getElementById("add-new-attachment")?.click();
				}}
			>
				<Upload className="w-5 h-5 text-muted-foreground mb-1" />
				<p className="text-xs font-medium text-foreground">
					{t("tools.password_manager.drop_files_here", {
						defaultValue: "Drop files here or click to browse",
					})}
				</p>
				<p className="text-[11px] text-muted-foreground mt-0.5">
					{t("tools.password_manager.accepted_types", {
						types: ACCEPTED_FILE_TYPES,
						maxSize: formatFileSize(MAX_FILE_SIZE),
					})}
				</p>
			</div>
		</div>
	);
}
