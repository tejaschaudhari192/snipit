import React from "react";
import { useTranslation } from "react-i18next";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Label } from "@/components/ui/label";
import { Download, Eye, EyeOff } from "lucide-react";
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
				<Label className="text-[13px] text-white/50 block font-medium">
					{t(field.placeholder || "") || field.label}
				</Label>
				<a
					href={value.startsWith("http") ? value : `https://${value}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-[15px] font-medium text-vault-active hover:text-vault-active/80 truncate block transition-colors"
				>
					{value}
				</a>
			</div>
		);
	}

	if (field.type === "multiline" || field.type === "file") {
		return (
			<div className="space-y-1.5 group">
				<div className="flex items-center justify-between">
					<Label className="text-[13px] text-white/50 block font-medium">
						{t(field.placeholder || "") || field.label}
					</Label>
					<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<CopyButton
							content={value}
							variant="ghost"
							size="default"
							className="h-6 w-6 text-primary hover:text-primary/80 bg-primary/10 rounded border-0"
						/>
						{field.type === "file" && (
							<Button
								variant="ghost"
								size="sm"
								className="h-6 text-xs text-primary hover:text-primary/80 px-2"
								onClick={() => {
									const blob = new Blob([value], {
										type: "text/plain",
									});
									const url = URL.createObjectURL(blob);
									const a = document.createElement("a");
									a.href = url;
									a.download = fileName || "credentials.txt";
									document.body.appendChild(a);
									a.click();
									document.body.removeChild(a);
									URL.revokeObjectURL(url);
								}}
							>
								<Download className="h-3 w-3 mr-1" />
								Download
							</Button>
						)}
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
			<Label className="text-[13px] text-white/50 block font-medium">
				{t(field.placeholder || "") || field.label}
			</Label>
			<div className="flex items-center justify-between group min-w-0">
				<span
					className={`text-[15px] font-medium text-white flex-1 truncate ${field.type === "password" ? "font-mono tracking-widest" : ""}`}
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
							className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
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
						className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 transition-colors bg-white/5 rounded-lg border-0"
					/>
				</div>
			</div>
		</div>
	);
}
