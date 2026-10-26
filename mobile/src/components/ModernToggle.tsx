import React, { useState, useEffect } from "react";
import { TouchableOpacity, Platform, View } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	interpolateColor,
} from "react-native-reanimated";
import { Host, Switch as NativeSwitch } from "@expo/ui";
import { offlineVault } from "../core/vault-storage";

interface ModernToggleProps {
	value: boolean;
	onValueChange: (val: boolean) => void;
	disabled?: boolean;
	theme?: "dark" | "light";
}

/**
 * Modern Toggle with runtime switchable backend:
 * 1. Shadcn / Reanimated: 60/120fps physics-based spring pill with high visual contrast.
 * 2. Native System: Pure Jetpack Compose (Android) & SwiftUI (iOS) via @expo/ui.
 */
export function ModernToggle({
	value,
	onValueChange,
	disabled = false,
	theme = "dark",
}: ModernToggleProps) {
	const isLight = theme === "light";
	const [uiStyle, setUiStyle] = useState<"shadcn" | "native">("shadcn");

	useEffect(() => {
		offlineVault.getUIStyle().then(setUiStyle);
		const unsub = offlineVault.onSync(() => {
			offlineVault.getUIStyle().then(setUiStyle);
		});
		return () => unsub();
	}, []);

	// 1. Native SwiftUI / Jetpack Compose component
	if (uiStyle === "native" && Platform.OS !== "web") {
		return (
			<Host matchContents>
				<NativeSwitch
					value={value}
					onValueChange={onValueChange}
					disabled={disabled}
				/>
			</Host>
		);
	}

	// 2. Default: Shadcn / Reanimated Spring Pill
	return (
		<ShadcnSpringToggle
			value={value}
			onValueChange={onValueChange}
			disabled={disabled}
			isLight={isLight}
		/>
	);
}

function ShadcnSpringToggle({
	value,
	onValueChange,
	disabled,
	isLight,
}: {
	value: boolean;
	onValueChange: (val: boolean) => void;
	disabled: boolean;
	isLight: boolean;
}) {
	const progress = useSharedValue(value ? 1 : 0);

	useEffect(() => {
		progress.value = withSpring(value ? 1 : 0, {
			damping: 18,
			stiffness: 220,
			mass: 0.8,
		});
	}, [value]);

	const offTrackColor = isLight ? "#cbd5e1" : "#334155";
	const onTrackColor = "#0a84ff";

	const animatedTrackStyle = useAnimatedStyle(() => {
		const backgroundColor = interpolateColor(
			progress.value,
			[0, 1],
			[offTrackColor, onTrackColor]
		);
		return { backgroundColor };
	});

	const animatedThumbStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: progress.value * 20 }],
		};
	});

	return (
		<TouchableOpacity
			activeOpacity={0.85}
			disabled={disabled}
			onPress={() => onValueChange(!value)}
			accessibilityRole="switch"
			accessibilityState={{ checked: value, disabled }}
			hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
		>
			<Animated.View
				style={[
					{
						width: 50,
						height: 30,
						borderRadius: 15,
						padding: 3,
						justifyContent: "center",
					},
					animatedTrackStyle,
				]}
			>
				<Animated.View
					style={[
						{
							width: 24,
							height: 24,
							borderRadius: 12,
							backgroundColor: "#ffffff",
							...Platform.select({
								ios: {
									shadowColor: "#000000",
									shadowOffset: { width: 0, height: 2 },
									shadowOpacity: 0.22,
									shadowRadius: 3,
								},
								android: {
									elevation: 3,
								},
							}),
						},
						animatedThumbStyle,
					]}
				/>
			</Animated.View>
		</TouchableOpacity>
	);
}
