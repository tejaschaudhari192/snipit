import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from "react-native";
import { useThemeVars } from "../config/theme";

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
	const c = useThemeVars(theme);
	const colors = ["#0a84ff", "#ff9f0a", "#30d158", "#bf5af2", "#ff375f", "#5e5ce6"];

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View style={styles.modalOverlay}>
				<View style={[styles.modalContent, { backgroundColor: c.bgSecondary }]}>
					<View style={styles.modalHeader}>
						<Text style={[styles.modalTitle, { color: c.text }]}>New Folder</Text>
						<TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
							<Text style={{ color: c.blue, fontSize: 16, fontWeight: "600" }}>Cancel</Text>
						</TouchableOpacity>
					</View>

					<TextInput
						style={[styles.input, { backgroundColor: c.bgTertiary, color: c.text }]}
						placeholder="Folder Name (e.g. Work, Personal, Finance)"
						placeholderTextColor={c.textSecondary}
						value={folderName}
						onChangeText={onChangeName}
						autoFocus
					/>

					<Text style={[styles.fieldLabel, { color: c.textSecondary }]}>Folder Color</Text>
					<View style={styles.colorRow}>
						{colors.map((col) => (
							<TouchableOpacity
								key={col}
								style={[styles.colorOption, { backgroundColor: col }, folderColor === col && styles.colorOptionSelected]}
								onPress={() => onChangeColor(col)}
							/>
						))}
					</View>

					<TouchableOpacity style={[styles.primaryBtn, { backgroundColor: c.blue }]} onPress={onSave}>
						<Text style={styles.btnText}>Create Folder</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.65)",
		justifyContent: "flex-end",
	},
	modalContent: {
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		paddingBottom: 35,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "700",
	},
	input: {
		width: "100%",
		borderRadius: 10,
		padding: 13,
		fontSize: 16,
		marginBottom: 14,
	},
	fieldLabel: {
		fontSize: 12,
		fontWeight: "600",
		marginBottom: 8,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	colorRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 18,
	},
	colorOption: {
		width: 34,
		height: 34,
		borderRadius: 17,
	},
	colorOptionSelected: {
		borderWidth: 3,
		borderColor: "#ffffff",
	},
	primaryBtn: {
		width: "100%",
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
	},
	btnText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "700",
	},
});
