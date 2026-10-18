import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react-native";
import { useThemeVars } from "../config/theme";

export interface CustomAlertButton {
	text: string;
	style?: "default" | "cancel" | "destructive";
	onPress?: () => void;
}

export interface CustomAlertConfig {
	visible: boolean;
	title: string;
	message?: string;
	type?: "info" | "success" | "warning" | "error";
	buttons?: CustomAlertButton[];
	onDismiss?: () => void;
}

interface CustomAlertModalProps {
	config: CustomAlertConfig;
	theme?: "dark" | "light";
}

export function CustomAlertModal({ config, theme = "dark" }: CustomAlertModalProps) {
	const c = useThemeVars(theme);
	const isLight = theme === "light";

	if (!config.visible) return null;

	const type = config.type || "info";

	const getIcon = () => {
		switch (type) {
			case "success":
				return <CheckCircle2 color="#22c55e" size={32} />;
			case "error":
				return <AlertCircle color="#ef4444" size={32} />;
			case "warning":
				return <AlertTriangle color="#f59e0b" size={32} />;
			case "info":
			default:
				return <Info color={c.text} size={32} />;
		}
	};

	const buttons = config.buttons && config.buttons.length > 0
		? config.buttons
		: [{ text: "OK", style: "default", onPress: config.onDismiss }];

	return (
		<Modal visible={config.visible} transparent animationType="fade" onRequestClose={config.onDismiss}>
			<View style={styles.overlay}>
				<View
					style={[
						styles.alertBox,
						{
							backgroundColor: isLight ? "#ffffff" : "#18181b",
							borderColor: c.border,
						},
					]}
				>
					<View style={styles.iconContainer}>{getIcon()}</View>
					<Text style={[styles.title, { color: c.text }]}>{config.title}</Text>
					{config.message ? (
						<Text style={[styles.message, { color: c.textSecondary }]}>{config.message}</Text>
					) : null}

					<View style={styles.buttonRow}>
						{buttons.map((btn, idx) => {
							const isDestructive = btn.style === "destructive";
							const isCancel = btn.style === "cancel";
							const isPrimary = !isDestructive && !isCancel;

							let btnBg = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";
							let textColor = c.text;

							if (isDestructive) {
								btnBg = "rgba(239, 68, 68, 0.15)";
								textColor = "#ef4444";
							} else if (isPrimary) {
								btnBg = isLight ? "#000000" : "#ffffff";
								textColor = isLight ? "#ffffff" : "#000000";
							}

							return (
								<TouchableOpacity
									key={idx}
									style={[styles.button, { backgroundColor: btnBg }]}
									onPress={() => {
										if (btn.onPress) {
											btn.onPress();
										} else if (config.onDismiss) {
											config.onDismiss();
										}
									}}
									activeOpacity={0.7}
								>
									<Text style={[styles.btnText, { color: textColor, fontWeight: isPrimary ? "700" : "600" }]}>
										{btn.text}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.65)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
	},
	alertBox: {
		width: "100%",
		maxWidth: 340,
		borderRadius: 18,
		borderWidth: 1,
		padding: 22,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 10,
	},
	iconContainer: {
		marginBottom: 12,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		textAlign: "center",
		marginBottom: 8,
	},
	message: {
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 20,
	},
	buttonRow: {
		flexDirection: "row",
		gap: 10,
		width: "100%",
	},
	button: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	btnText: {
		fontSize: 15,
	},
});
