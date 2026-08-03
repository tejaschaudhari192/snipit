import { cn } from "@/utils";
import type { LucideIcon } from "lucide-react";

interface OptionDisplayProps {
	icon?: LucideIcon;
	label: string;
	className?: string;
}

export function OptionDisplay({ icon: Icon, label, className }: OptionDisplayProps) {
	return (
		<div className={cn("flex items-center gap-2 capitalize", className)}>
			{Icon && <Icon className="h-4 w-4 shrink-0 opacity-70" />}
			<span>{label}</span>
		</div>
	);
}
