import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react-native";

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
				return <Info color={isLight ? "#0f172a" : "#ffffff"} size={32} />;
		}
	};

	const buttons = config.buttons && config.buttons.length > 0
		? config.buttons
		: [{ text: "OK", style: "default", onPress: config.onDismiss }];

	return (
		<Modal visible={config.visible} transparent animationType="fade" onRequestClose={config.onDismiss}>
			<View className="flex-1 bg-black/65 justify-center items-center px-6">
				<View
					className={`w-full max-w-[340px] rounded-2xl border p-5.5 items-center shadow-2xl ${
						isLight ? "bg-white border-slate-200" : "bg-zinc-900 border-zinc-800"
					}`}
				>
					<View className="mb-3 justify-center items-center">{getIcon()}</View>
					<Text className={`text-[18px] font-bold text-center mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
						{config.title}
					</Text>
					{config.message ? (
						<Text className={`text-sm text-center leading-5 mb-5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
							{config.message}
						</Text>
					) : null}

					<View className="flex-row gap-2.5 w-full">
						{buttons.map((btn, idx) => {
							const isDestructive = btn.style === "destructive";
							const isCancel = btn.style === "cancel";
							const isPrimary = !isDestructive && !isCancel;

							let btnBgClass = isLight ? "bg-slate-100" : "bg-white/10";
							let textClass = isLight ? "text-slate-900" : "text-white";

							if (isDestructive) {
								btnBgClass = "bg-red-500/15";
								textClass = "text-red-500";
							} else if (isPrimary) {
								btnBgClass = isLight ? "bg-black" : "bg-white";
								textClass = isLight ? "text-white" : "text-black";
							}

							return (
								<TouchableOpacity
									key={idx}
									className={`flex-1 py-3 rounded-xl items-center justify-center ${btnBgClass}`}
									onPress={() => {
										if (btn.onPress) {
											btn.onPress();
										} else if (config.onDismiss) {
											config.onDismiss();
										}
									}}
									activeOpacity={0.7}
								>
									<Text className={`text-[15px] ${isPrimary ? "font-bold" : "font-semibold"} ${textClass}`}>
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
