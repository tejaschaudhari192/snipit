import React from "react";
import { View } from "react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface Props {
	title?: string;
	onSave: () => void;
	onClose: () => void;
	saveLabel?: string;
	closeLabel?: string;
	theme?: "dark" | "light";
}

export function IosModalHeader({
	title,
	onSave,
	onClose,
	saveLabel = "Done",
	closeLabel = "Cancel",
}: Props) {
	return (
		<View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
			<Button variant="ghost" size="sm" onPress={onClose} className="px-2">
				<Text className="text-sm font-medium">{closeLabel}</Text>
			</Button>

			<Text
				className="text-base font-semibold text-center flex-1 mx-2 text-foreground"
				numberOfLines={1}
			>
				{title}
			</Text>

			<Button variant="default" size="sm" onPress={onSave} className="px-3">
				<Text className="text-sm font-semibold text-primary-foreground">{saveLabel}</Text>
			</Button>
		</View>
	);
}
