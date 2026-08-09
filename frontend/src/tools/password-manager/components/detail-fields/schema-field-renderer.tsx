import React from "react";
import { useTranslation } from "react-i18next";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Label } from "@/components/ui/label";
import { Download, Eye, EyeOff } from "lucide-react";
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentMedia,
	AttachmentTitle,
} from "@/components/ui/attachment";
import { FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SchemaField {
	key: string;
	label: string;
	type: string;
	placeholder?: string;
}

interface SchemaFieldRendererProps {
	field: SchemaField;
	value: string | undefined;
	fileName?: string;
}

export function SchemaFieldRenderer({
	field,
	value,
	fileName,
}: SchemaFieldRendererProps) {
	const { t } = useTranslation();
	const [showValue, setShowValue] = React.useState(false);

	if (!value) return null;

	if (field.type === "url") {
		return (
			<div className="space-y-1.5">
				<Label className="text-[13px] text-muted-foreground block font-medium">
					{field.placeholder ? t(field.placeholder) : t(field.label)}
				</Label>
				<a
					href={value.startsWith("http") ? value : `https://${value}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-[15px] font-medium text-primary hover:text-primary/80 truncate block transition-colors"
				>
					{value}
				</a>
			</div>
		);
	}

	if (field.type === "file") {
		const kb = Math.round(value.length / 1024);
		const sizeString =
			kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
		const fName = fileName || "credentials.txt";

		return (
			<div className="space-y-1.5 mt-2 mb-2">
				<Label className="text-[13px] text-muted-foreground block font-medium mb-1">
					{field.placeholder ? t(field.placeholder) : t(field.label)}
				</Label>
				<Attachment>
					<AttachmentMedia>
						<FileTextIcon />
					</AttachmentMedia>
					<AttachmentContent>
						<AttachmentTitle>{fName}</AttachmentTitle>
						<AttachmentDescription>
							Text File · {sizeString}
						</AttachmentDescription>
					</AttachmentContent>
					<AttachmentActions>
						<AttachmentAction
							aria-label={`Download ${fName}`}
							onClick={() => {
								const blob = new Blob([value], {
									type: "text/plain",
								});
								const url = URL.createObjectURL(blob);
								const a = document.createElement("a");
								a.href = url;
								a.download = fName;
								document.body.appendChild(a);
								a.click();
								document.body.removeChild(a);
								URL.revokeObjectURL(url);
							}}
						>
							<Download className="w-4 h-4" />
						</AttachmentAction>
					</AttachmentActions>
				</Attachment>
			</div>
		);
	}

	if (field.type === "multiline") {
		return (
			<div className="space-y-1.5 group">
				<div className="flex items-center justify-between">
					<Label className="text-[13px] text-muted-foreground block font-medium">
						{field.placeholder
							? t(field.placeholder)
							: t(field.label)}
					</Label>
					<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<CopyButton
							content={value}
							variant="ghost"
							size="default"
							className="h-6 w-6 text-primary hover:text-primary/80 bg-primary/10 rounded border-0"
						/>
					</div>
				</div>
				<p className="text-sm font-mono text-foreground whitespace-pre-wrap wrap-break-word bg-background rounded-xl px-3 py-2.5 border border-border">
					{value}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-1.5">
			<Label className="text-[13px] text-muted-foreground block font-medium">
				{field.placeholder ? t(field.placeholder) : t(field.label)}
			</Label>
			<div className="flex items-center justify-between group min-w-0">
				<span
					className={`text-[15px] font-medium text-foreground flex-1 truncate ${field.type === "password" ? "font-mono tracking-widest" : ""}`}
				>
					{field.type === "password" && !showValue
						? "•".repeat(Math.min(value.length, 20))
						: value}
				</span>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					{field.type === "password" && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowValue(!showValue)}
							className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
						>
							{showValue ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</Button>
					)}
					<CopyButton
						content={value}
						variant="ghost"
						size="default"
						className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors bg-muted/30 rounded-lg border-0"
					/>
				</div>
			</div>
		</div>
	);
}
