import type { CustomField } from "@/tools/password-manager/types";

export function CustomFieldRenderer({ field }: { field: CustomField }) {
	return (
		<div className="bg-background rounded-xl px-3 py-2.5 border border-border overflow-hidden">
			<p className="text-xs text-muted-foreground mb-0.5 truncate">
				{field.name}
			</p>
			{field.type === "password" ? (
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
