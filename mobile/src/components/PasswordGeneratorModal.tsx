import React from "react";
import { View, Modal, TouchableOpacity, ScrollView, Platform } from "react-native";
import { RefreshCw, Check, Copy, X } from "lucide-react-native";
import { evaluatePasswordStrength, SeparatorType } from "../core/crypto";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Separator } from "./ui/separator";
import { ModernToggle } from "./ModernToggle";
import { useUIStyle } from "../core/UIStyleContext";
import { Slider } from "./ui/slider";

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
	const { uiStyle } = useUIStyle();
	if (!visible) return null;
	const strength = evaluatePasswordStrength(generatedPass);

	return (
		<Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
			<View className="flex-1 bg-black/70 justify-end">
				<View className="rounded-t-2xl overflow-hidden max-h-[85%] border-t border-border bg-card">
					{/* Header Display */}
					<View className="p-5 bg-muted/60 border-b border-border">
						<View className="flex-row justify-between items-center mb-3">
							<Button variant="ghost" size="icon" onPress={onClose} className="h-8 w-8">
								<X className="text-foreground" size={16} />
							</Button>
							<View className="flex-row gap-2">
								<Button variant="outline" size="icon" onPress={onRefresh} className="h-8 w-8">
									<RefreshCw className="text-foreground" size={14} />
								</Button>
								<Button variant="outline" size="icon" onPress={() => onCopy(generatedPass, "gen")} className="h-8 w-8">
									{copiedField === "gen" ? <Check className="text-foreground" size={14} /> : <Copy className="text-muted-foreground" size={14} />}
								</Button>
							</View>
						</View>
						<Text className="text-xl font-bold font-mono tracking-wider text-center text-foreground px-2" numberOfLines={3} selectable>
							{generatedPass}
						</Text>
					</View>

					{/* Strength & Fill Sub-Bar */}
					<View className="flex-row justify-between items-center px-4 py-2 border-b border-border bg-muted/30">
						<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{strength.label}</Text>
						<Button variant="ghost" size="sm" className="h-7 px-2" onPress={() => onApply(generatedPass)}>
							<Text className="text-xs font-semibold">
								{genTargetField ? "Fill Form" : "Fill"}
							</Text>
						</Button>
					</View>

					{/* Options Body */}
					<ScrollView className="p-5" showsVerticalScrollIndicator={false}>
						<View className="flex-row justify-between items-center py-2.5">
							<Text className="text-sm font-medium text-foreground">
								Pronounceable Passphrase
							</Text>
							<ModernToggle
								value={genPronounceable}
								onValueChange={setGenPronounceable}
								theme={theme}
							/>
						</View>

						{genPronounceable ? (
							<>
								<View className="my-2.5">
									<View className="flex-row justify-between items-center mb-1.5">
										<Text className="text-xs font-medium text-muted-foreground">
											Number of Words
										</Text>
										<Text className="text-xs font-semibold text-foreground">{genWordCount} words</Text>
									</View>
									<Slider
										value={genWordCount}
										min={2}
										max={6}
										step={1}
										onValueChange={setGenWordCount}
									/>
								</View>

								<View className="my-2.5">
									<Text className="text-xs font-medium text-muted-foreground mb-1.5">
										Separated By
									</Text>
									<View className="flex-row flex-wrap gap-1.5 mt-1 mb-2">
										{(["hyphen", "hash", "space", "comma", "none"] as SeparatorType[]).map((sep) => (
											<TouchableOpacity
												key={sep}
												className={`py-1.5 px-3 rounded-md items-center border ${
													genSeparator === sep
														? "bg-foreground border-foreground"
														: "bg-muted border-border"
												}`}
												onPress={() => setGenSeparator(sep)}
											>
												<Text className={`text-xs font-medium ${genSeparator === sep ? "text-background font-semibold" : "text-foreground"}`}>
													{sep === "hyphen" ? "Hyphen (-)" : sep === "hash" ? "Hash (#)" : sep === "space" ? "Space ( )" : sep === "comma" ? "Comma (,)" : "None"}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							</>
						) : (
							<View className="my-2.5">
								<View className="flex-row justify-between items-center mb-1.5">
									<Text className="text-xs font-medium text-muted-foreground">
										Character Length
									</Text>
									<Text className="text-xs font-semibold text-foreground">{genLength} chars</Text>
								</View>
								<Slider
									value={genLength}
									min={8}
									max={32}
									step={4}
									onValueChange={setGenLength}
								/>
							</View>
						)}

						<Separator className="my-3" />
						<Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
							Include
						</Text>

						<View className="flex-row justify-between items-center py-2">
							<Text className="text-sm font-medium text-foreground">
								{genPronounceable ? "Capitalize Words" : "Uppercase (A-Z)"}
							</Text>
							<ModernToggle
								value={genUpper}
								onValueChange={setGenUpper}
								theme={theme}
							/>
						</View>

						<View className="flex-row justify-between items-center py-2">
							<Text className="text-sm font-medium text-foreground">
								Digits (0-9)
							</Text>
							<ModernToggle
								value={genNumbers}
								onValueChange={setGenNumbers}
								theme={theme}
							/>
						</View>

						<Button
							className="w-full h-11 mt-5 mb-6"
							onPress={() => onApply(generatedPass)}
						>
							<Text className="font-semibold text-primary-foreground">
								{genTargetField ? "Use & Close" : "Copy & Close"}
							</Text>
						</Button>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}
