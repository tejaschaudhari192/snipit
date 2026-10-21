import React from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";

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
	theme = "dark",
	onChangeName,
	onChangeColor,
	onClose,
	onSave,
}: Props) {
	if (!visible) return null;
	const isLight = theme === "light";
	const colors = ["#0a84ff", "#ff9f0a", "#30d158", "#bf5af2", "#ff375f", "#5e5ce6"];

	return (
		<Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
			<KeyboardAvoidingView
				className="flex-1 bg-black/65 justify-end"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View
					className={`rounded-t-3xl p-5 pb-9 border-t ${
						isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
					}`}
				>
					<View className="flex-row justify-between items-center mb-4">
						<Text className={`text-[18px] font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
							New Folder
						</Text>
						<TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
							<Text className="text-blue-500 text-[16px] font-semibold">Cancel</Text>
						</TouchableOpacity>
					</View>

					<TextInput
						className={`w-full rounded-xl p-3.5 text-[16px] mb-3.5 border ${
							isLight
								? "bg-slate-50 border-slate-200 text-slate-900"
								: "bg-slate-950 border-slate-800 text-white"
						}`}
						placeholder="Folder Name (e.g. Work, Personal, Finance)"
						placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
						value={folderName}
						onChangeText={onChangeName}
						autoFocus
					/>

					<Text
						className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
							isLight ? "text-slate-500" : "text-slate-400"
						}`}
					>
						Folder Color
					</Text>
					<View className="flex-row gap-3 mb-4.5">
						{colors.map((col) => (
							<TouchableOpacity
								key={col}
								className={`w-8.5 h-8.5 rounded-full ${folderColor === col ? "border-[3px] border-white" : ""}`}
								style={{ backgroundColor: col }}
								onPress={() => onChangeColor(col)}
							/>
						))}
					</View>

					<TouchableOpacity
						className="w-full py-3.5 rounded-xl items-center bg-blue-600"
						onPress={onSave}
					>
						<Text className="text-white text-[16px] font-bold">Create Folder</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}
