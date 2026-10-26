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

	const getIconBadge = () => {
		switch (type) {
			case "success":
				return (
					<View className="w-13 h-13 rounded-full bg-emerald-500/15 justify-center items-center mb-3.5">
						<CheckCircle2 color="#10b981" size={28} />
					</View>
				);
			case "error":
				return (
					<View className="w-13 h-13 rounded-full bg-rose-500/15 justify-center items-center mb-3.5">
						<AlertCircle color="#f43f5e" size={28} />
					</View>
				);
			case "warning":
				return (
					<View className="w-13 h-13 rounded-full bg-amber-500/15 justify-center items-center mb-3.5">
						<AlertTriangle color="#f59e0b" size={28} />
					</View>
				);
			case "info":
			default:
				return (
					<View className={`w-13 h-13 rounded-full justify-center items-center mb-3.5 ${isLight ? "bg-slate-100" : "bg-slate-800"}`}>
						<Info color={isLight ? "#0f172a" : "#ffffff"} size={28} />
					</View>
				);
		}
	};

	const buttons = config.buttons && config.buttons.length > 0
		? config.buttons
		: [{ text: "OK", style: "default", onPress: config.onDismiss }];

	return (
		<Modal visible={config.visible} transparent animationType="fade" onRequestClose={config.onDismiss} statusBarTranslucent>
			<View className="flex-1 bg-black/70 justify-center items-center px-6">
				<View
					className={`w-full max-w-[340px] rounded-3xl border px-6 py-6 items-center shadow-2xl ${
						isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
					}`}
				>
					{getIconBadge()}

					<Text className={`text-[19px] font-bold text-center tracking-tight mb-2 px-1 ${isLight ? "text-slate-900" : "text-white"}`}>
						{config.title}
					</Text>

					{config.message ? (
						<Text className={`text-[14px] text-center leading-5 mb-6 px-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
							{config.message}
						</Text>
					) : (
						<View className="mb-2" />
					)}

					<View className="flex-row gap-3 w-full">
						{buttons.map((btn, idx) => {
							const isDestructive = btn.style === "destructive";
							const isCancel = btn.style === "cancel";
							const isPrimary = !isDestructive && !isCancel;

							let btnBgClass = isLight ? "bg-slate-100" : "bg-slate-800";
							let textClass = isLight ? "text-slate-700" : "text-slate-300";

							if (isDestructive) {
								btnBgClass = "bg-rose-500/15 border border-rose-500/30";
								textClass = "text-rose-500";
							} else if (isPrimary) {
								btnBgClass = isLight ? "bg-slate-900" : "bg-white";
								textClass = isLight ? "text-white" : "text-slate-950";
							}

							return (
								<TouchableOpacity
									key={idx}
									className={`flex-1 py-3.5 px-4 rounded-xl items-center justify-center ${btnBgClass}`}
									onPress={() => {
										// Dismiss modal immediately for instant UI responsiveness
										if (config.onDismiss) {
											config.onDismiss();
										}
										if (btn.onPress) {
											// Run action without blocking modal close animation
											setTimeout(() => {
												btn.onPress?.();
											}, 0);
										}
									}}
									activeOpacity={0.75}
								>
									<Text className={`text-[15px] ${isPrimary || isDestructive ? "font-bold" : "font-semibold"} ${textClass}`}>
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
