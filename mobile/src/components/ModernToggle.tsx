import { Switch } from "./ui/switch";

interface ModernToggleProps {
	value: boolean;
	onValueChange: (val: boolean) => void;
	disabled?: boolean;
	theme?: "dark" | "light";
	className?: string;
}

/**
 * Modern Toggle built on standard Shadcn (@rn-primitives/switch).
 */
export function ModernToggle({
	value,
	onValueChange,
	disabled = false,
	className,
}: ModernToggleProps) {
	return (
		<Switch
			checked={value}
			onCheckedChange={onValueChange}
			disabled={disabled}
			className={className}
		/>
	);
}
