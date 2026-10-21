import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { RefreshCw, Check, Copy } from "lucide-react-native";
import { evaluatePasswordStrength, SeparatorType } from "../core/crypto";

interface Props {
	visible: boolean;
	theme?: "dark" | "light";
	generatedPass: string;
	genLength: number;
	genWordCount: number;
	genPronounceable: boolean;
	genUpper: boolean;
	genNumbers: boolean;
	genSeparator: SeparatorType;
	genTargetField: string | null;
	copiedField: string | null;
	onClose: () => void;
	onRefresh: () => void;
	onCopy: (text: string, field: string) => void;
	onApply: (password: string) => void;
	setGenLength: (len: number) => void;
	setGenWordCount: (count: number) => void;
	setGenPronounceable: (val: boolean) => void;
	setGenUpper: (val: boolean) => void;
	setGenNumbers: (val: boolean) => void;
	setGenSeparator: (sep: SeparatorType) => void;
}

export function PasswordGeneratorModal({
	visible,
	theme = "dark",
	generatedPass,
	genLength,
	genWordCount,
	genPronounceable,
	genUpper,
	genNumbers,
	genSeparator,
	genTargetField,
	copiedField,
	onClose,
	onRefresh,
	onCopy,
	onApply,
	setGenLength,
	setGenWordCount,
	setGenPronounceable,
	setGenUpper,
	setGenNumbers,
	setGenSeparator,
}: Props) {
	if (!visible) return null;
	const isLight = theme === "light";
	const strength = evaluatePasswordStrength(generatedPass);

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View className="flex-1 bg-black/75 justify-end">
				<View
					className={`rounded-t-3xl overflow-hidden max-h-[85%] border-t ${
						isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
					}`}
				>
					{/* Header Display */}
					<View className="p-5" style={{ backgroundColor: strength.headerBg }}>
						<View className="flex-row justify-between items-center mb-4">
							<TouchableOpacity onPress={onClose} className="w-8.5 h-8.5 rounded-full bg-black/20 justify-center items-center">
								<Text className="text-white text-[18px] font-bold">✕</Text>
							</TouchableOpacity>
							<View className="flex-row gap-2">
								<TouchableOpacity onPress={onRefresh} className="w-8.5 h-8.5 rounded-full bg-black/20 justify-center items-center">
									<RefreshCw color="#fff" size={18} />
								</TouchableOpacity>
								<TouchableOpacity onPress={() => onCopy(generatedPass, "gen")} className="w-8.5 h-8.5 rounded-full bg-black/20 justify-center items-center">
									{copiedField === "gen" ? <Check color="#fff" size={18} /> : <Copy color="#fff" size={18} />}
								</TouchableOpacity>
							</View>
						</View>
						<Text className="text-white text-[22px] font-bold font-mono tracking-wider text-center" numberOfLines={3} selectable>
							{generatedPass}
						</Text>
					</View>

					{/* Strength & Fill Sub-Bar */}
					<View className="flex-row justify-between items-center px-4 py-2.5" style={{ backgroundColor: strength.barBg }}>
						<Text className="text-white text-xs font-bold uppercase tracking-wider">{strength.label}</Text>
						<TouchableOpacity className="bg-white/20 px-3 py-1.5 rounded-lg" onPress={() => onApply(generatedPass)}>
							<Text className="text-white text-xs font-bold uppercase tracking-wider">
								{genTargetField ? "Fill Form" : "Fill"}
							</Text>
						</TouchableOpacity>
					</View>

					{/* Options Body */}
					<ScrollView className="p-5" showsVerticalScrollIndicator={false}>
						<View className="flex-row justify-between items-center py-2.5">
							<Text className={`text-[15px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
								Pronounceable Passphrase
							</Text>
							<TouchableOpacity
								className={`w-11 h-6 rounded-full p-0.5 justify-center ${genPronounceable ? "bg-blue-600" : "bg-slate-700"}`}
								onPress={() => setGenPronounceable(!genPronounceable)}
							>
								<View className={`w-5 h-5 rounded-full bg-white ${genPronounceable ? "self-end" : ""}`} />
							</TouchableOpacity>
						</View>

						{genPronounceable ? (
							<>
								<View className="my-2.5">
									<View className="flex-row justify-between items-center mb-1">
										<Text className={`text-[13px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
											Number of Words
										</Text>
										<Text className="text-blue-500 text-xs font-bold">{genWordCount} words</Text>
									</View>
									<View className="flex-row flex-wrap gap-1.5 mt-1.5 mb-2">
										{[2, 3, 4, 5, 6].map((count) => (
											<TouchableOpacity
												key={count}
												className={`py-1.5 px-2.5 rounded-lg items-center border ${
													genWordCount === count
														? "bg-violet-600 border-violet-500"
														: isLight
														? "bg-slate-100 border-slate-200"
														: "bg-slate-950 border-slate-800"
												}`}
												onPress={() => setGenWordCount(count)}
											>
												<Text className={`text-xs font-semibold ${genWordCount === count ? "text-white" : isLight ? "text-slate-700" : "text-slate-400"}`}>
													{count}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>

								<View className="my-2.5">
									<Text className={`text-[13px] font-medium mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
										Separated By
									</Text>
									<View className="flex-row flex-wrap gap-1.5 mt-1.5 mb-2">
										{(["hyphen", "hash", "space", "comma", "none"] as SeparatorType[]).map((sep) => (
											<TouchableOpacity
												key={sep}
												className={`py-1.5 px-2.5 rounded-lg items-center border ${
													genSeparator === sep
														? "bg-violet-600 border-violet-500"
														: isLight
														? "bg-slate-100 border-slate-200"
														: "bg-slate-950 border-slate-800"
												}`}
												onPress={() => setGenSeparator(sep)}
											>
												<Text className={`text-xs font-semibold ${genSeparator === sep ? "text-white" : isLight ? "text-slate-700" : "text-slate-400"}`}>
													{sep === "hyphen" ? "Hyphen (-)" : sep === "hash" ? "Hash (#)" : sep === "space" ? "Space ( )" : sep === "comma" ? "Comma (,)" : "None"}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							</>
						) : (
							<View className="my-2.5">
								<View className="flex-row justify-between items-center mb-1">
									<Text className={`text-[13px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
										Character Length
									</Text>
									<Text className="text-blue-500 text-xs font-bold">{genLength} chars</Text>
								</View>
								<View className="flex-row flex-wrap gap-1.5 mt-1.5 mb-2">
									{[8, 12, 15, 20, 25, 32].map((len) => (
										<TouchableOpacity
											key={len}
											className={`py-1.5 px-2.5 rounded-lg items-center border ${
												genLength === len
													? "bg-violet-600 border-violet-500"
													: isLight
													? "bg-slate-100 border-slate-200"
													: "bg-slate-950 border-slate-800"
											}`}
											onPress={() => setGenLength(len)}
										>
											<Text className={`text-xs font-semibold ${genLength === len ? "text-white" : isLight ? "text-slate-700" : "text-slate-400"}`}>
												{len}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						)}

						<View className={`h-px my-3.5 ${isLight ? "bg-slate-200" : "bg-slate-800"}`} />
						<Text className={`text-xs font-extrabold uppercase tracking-wider mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
							Include
						</Text>

						<View className="flex-row justify-between items-center py-2.5">
							<Text className={`text-[15px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
								{genPronounceable ? "Capitalize Words" : "Uppercase (A-Z)"}
							</Text>
							<TouchableOpacity
								className={`w-11 h-6 rounded-full p-0.5 justify-center ${genUpper ? "bg-blue-600" : "bg-slate-700"}`}
								onPress={() => setGenUpper(!genUpper)}
							>
								<View className={`w-5 h-5 rounded-full bg-white ${genUpper ? "self-end" : ""}`} />
							</TouchableOpacity>
						</View>

						<View className="flex-row justify-between items-center py-2.5">
							<Text className={`text-[15px] font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
								Digits (0-9)
							</Text>
							<TouchableOpacity
								className={`w-11 h-6 rounded-full p-0.5 justify-center ${genNumbers ? "bg-blue-600" : "bg-slate-700"}`}
								onPress={() => setGenNumbers(!genNumbers)}
							>
								<View className={`w-5 h-5 rounded-full bg-white ${genNumbers ? "self-end" : ""}`} />
							</TouchableOpacity>
						</View>

						<TouchableOpacity
							className="w-full bg-violet-600 py-3.5 rounded-xl items-center mt-5 mb-6"
							onPress={() => onApply(generatedPass)}
						>
							<Text className="text-white text-[16px] font-bold">
								{genTargetField ? "Use & Close" : "Copy & Close"}
							</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}
