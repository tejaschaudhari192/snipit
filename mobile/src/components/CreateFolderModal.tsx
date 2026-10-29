import React from "react";
import { View, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Text } from "./ui/text";

interface Props {
	visible: boolean;
	folderName: string;
	folderColor: string;
	theme?: "dark" | "light";
	onChangeName: (name: string) => void;
	onChangeColor: (color: string) => void;
	onClose: () => void;
	onSave: () => void;
}

export function CreateFolderModal({
	visible,
	folderName,
	folderColor,
	onChangeName,
	onChangeColor,
	onClose,
	onSave,
}: Props) {
	if (!visible) return null;
	const colors = ["#09090b", "#71717a", "#2563eb", "#16a34a", "#dc2626", "#9333ea"];

	return (
		<Modal visible={visible} animationType="none" transparent statusBarTranslucent>
			<KeyboardAvoidingView
				className="flex-1 bg-black/70 justify-end"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View className="rounded-t-2xl p-5 pb-9 border-t border-border bg-card">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-lg font-bold tracking-tight text-foreground">
							New Folder
						</Text>
						<Button variant="ghost" size="sm" onPress={onClose} className="h-8 px-2">
							<Text className="text-sm font-semibold text-foreground">Cancel</Text>
						</Button>
					</View>

					<View className="gap-1.5 mb-4">
						<Label htmlFor="folder-name">Folder Name</Label>
						<Input
							id="folder-name"
							placeholder="e.g. Work, Personal, Finance"
							value={folderName}
							onChangeText={onChangeName}
							autoFocus
						/>
					</View>

					<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
						Folder Color
					</Text>
					<View className="flex-row gap-3 mb-5">
						{colors.map((col) => (
							<TouchableOpacity
								key={col}
								className={`w-8 h-8 rounded-full border ${folderColor === col ? "border-foreground scale-110" : "border-border"}`}
								style={{ backgroundColor: col }}
								onPress={() => onChangeColor(col)}
							/>
						))}
					</View>

					<Button className="w-full h-11" onPress={onSave}>
						<Text className="font-semibold text-primary-foreground">Create Folder</Text>
					</Button>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}
