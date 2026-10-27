import React from "react";
import { Platform } from "react-native";
import { Switch } from "./ui/switch";
import { Host, Switch as NativeSwitch } from "@expo/ui";
import { useUIStyle } from "../core/UIStyleContext";

interface ModernToggleProps {
	value: boolean;
	onValueChange: (val: boolean) => void;
	disabled?: boolean;
	theme?: "dark" | "light";
	className?: string;
}

/**
 * Modern Toggle with runtime switchable backend:
 * 1. Plain Shadcn (@rn-primitives/switch): 100% Tailwind classes (`bg-primary`, `bg-input`, `dark:bg-primary-foreground`).
 * 2. Native System: Pure Jetpack Compose (Android) & SwiftUI (iOS) via @expo/ui.
 */
export function ModernToggle({
	value,
	onValueChange,
	disabled = false,
	className,
}: ModernToggleProps) {
	const { uiStyle } = useUIStyle();

	if (uiStyle === "native" && Platform.OS !== "web") {
		return (
			<Host style={{ width: 52, height: 32 }}>
				<NativeSwitch
					value={value}
					onValueChange={onValueChange}
					disabled={disabled}
				/>
			</Host>
		);
	}

	return (
		<Switch
			checked={value}
			onCheckedChange={onValueChange}
			disabled={disabled}
			className={className}
		/>
	);
}
