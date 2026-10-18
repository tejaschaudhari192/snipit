import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput } from "react-native";
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
	const strength = evaluatePasswordStrength(generatedPass);

	return (
		<Modal visible={visible} animationType="slide" transparent>
			<View style={styles.modalOverlay}>
				<View style={styles.webGenContainer}>
					{/* Header Display */}
					<View style={[styles.webGenHeader, { backgroundColor: strength.headerBg }]}>
						<View style={styles.webGenTopBar}>
							<TouchableOpacity onPress={onClose} style={styles.webGenCircleBtn}>
								<Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>✕</Text>
							</TouchableOpacity>
							<View style={{ flexDirection: "row", gap: 8 }}>
								<TouchableOpacity onPress={onRefresh} style={styles.webGenCircleBtn}>
									<RefreshCw color="#fff" size={18} />
								</TouchableOpacity>
								<TouchableOpacity onPress={() => onCopy(generatedPass, "gen")} style={styles.webGenCircleBtn}>
									{copiedField === "gen" ? <Check color="#fff" size={18} /> : <Copy color="#fff" size={18} />}
								</TouchableOpacity>
							</View>
						</View>
						<Text style={styles.webGenPasswordText} numberOfLines={3} selectable>
							{generatedPass}
						</Text>
					</View>

					{/* Strength & Fill Sub-Bar */}
					<View style={[styles.webGenStrengthBar, { backgroundColor: strength.barBg }]}>
						<Text style={styles.webGenStrengthText}>{strength.label}</Text>
						<TouchableOpacity style={styles.webGenFillBtn} onPress={() => onApply(generatedPass)}>
							<Text style={styles.webGenFillText}>{genTargetField ? "Fill Form" : "Fill"}</Text>
						</TouchableOpacity>
					</View>

					{/* Options Body */}
					<ScrollView style={styles.webGenBody} showsVerticalScrollIndicator={false}>
						<View style={styles.webGenRow}>
							<Text style={styles.webGenRowTitle}>Pronounceable Passphrase</Text>
							<TouchableOpacity
								style={[styles.webSwitch, genPronounceable && styles.webSwitchActive]}
								onPress={() => setGenPronounceable(!genPronounceable)}
							>
								<View style={[styles.webSwitchThumb, genPronounceable && styles.webSwitchThumbActive]} />
							</TouchableOpacity>
						</View>

						{genPronounceable ? (
							<>
								<View style={styles.webGenSection}>
									<View style={styles.webGenRowSimple}>
										<Text style={styles.webGenLabel}>Number of Words</Text>
										<Text style={styles.webGenValueBadge}>{genWordCount} words</Text>
									</View>
									<View style={styles.lengthPillsRow}>
										{[2, 3, 4, 5, 6].map((count) => (
											<TouchableOpacity
												key={count}
												style={[styles.lengthPill, genWordCount === count && styles.lengthPillActive]}
												onPress={() => setGenWordCount(count)}
											>
												<Text style={[styles.lengthPillText, genWordCount === count && styles.lengthPillTextActive]}>
													{count}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>

								<View style={styles.webGenSection}>
									<Text style={styles.webGenLabel}>Separated By</Text>
									<View style={styles.lengthPillsRow}>
										{(["hyphen", "hash", "space", "comma", "none"] as SeparatorType[]).map((sep) => (
											<TouchableOpacity
												key={sep}
												style={[styles.lengthPill, genSeparator === sep && styles.lengthPillActive]}
												onPress={() => setGenSeparator(sep)}
											>
												<Text style={[styles.lengthPillText, genSeparator === sep && styles.lengthPillTextActive]}>
													{sep === "hyphen" ? "Hyphen (-)" : sep === "hash" ? "Hash (#)" : sep === "space" ? "Space ( )" : sep === "comma" ? "Comma (,)" : "None"}
												</Text>
											</TouchableOpacity>
										))}
									</View>
								</View>
							</>
						) : (
							<View style={styles.webGenSection}>
								<View style={styles.webGenRowSimple}>
									<Text style={styles.webGenLabel}>Character Length</Text>
									<Text style={styles.webGenValueBadge}>{genLength} chars</Text>
								</View>
								<View style={styles.lengthPillsRow}>
									{[8, 12, 15, 20, 25, 32].map((len) => (
										<TouchableOpacity
											key={len}
											style={[styles.lengthPill, genLength === len && styles.lengthPillActive]}
											onPress={() => setGenLength(len)}
										>
											<Text style={[styles.lengthPillText, genLength === len && styles.lengthPillTextActive]}>
												{len}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						)}

						<View style={styles.webGenDivider} />
						<Text style={styles.webGenGroupHeader}>Include</Text>

						<View style={styles.webGenRow}>
							<Text style={styles.webGenRowTitle}>{genPronounceable ? "Capitalize Words" : "Uppercase (A-Z)"}</Text>
							<TouchableOpacity
								style={[styles.webSwitch, genUpper && styles.webSwitchActive]}
								onPress={() => setGenUpper(!genUpper)}
							>
								<View style={[styles.webSwitchThumb, genUpper && styles.webSwitchThumbActive]} />
							</TouchableOpacity>
						</View>

						<View style={styles.webGenRow}>
							<Text style={styles.webGenRowTitle}>Digits (0-9)</Text>
							<TouchableOpacity
								style={[styles.webSwitch, genNumbers && styles.webSwitchActive]}
								onPress={() => setGenNumbers(!genNumbers)}
							>
								<View style={[styles.webSwitchThumb, genNumbers && styles.webSwitchThumbActive]} />
							</TouchableOpacity>
						</View>

						<TouchableOpacity style={styles.primaryBtn} onPress={() => onApply(generatedPass)}>
							<Text style={styles.btnText}>{genTargetField ? "Use & Close" : "Copy & Close"}</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.8)",
		justifyContent: "flex-end",
	},
	webGenContainer: {
		backgroundColor: "#0b1329",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		overflow: "hidden",
		maxHeight: "85%",
		borderWidth: 1,
		borderColor: "#1e293b",
	},
	webGenHeader: {
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 22,
	},
	webGenTopBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	webGenCircleBtn: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: "rgba(0,0,0,0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	webGenPasswordText: {
		color: "#ffffff",
		fontSize: 20,
		fontWeight: "700",
		fontFamily: "monospace",
		textAlign: "center",
		letterSpacing: 1,
		paddingHorizontal: 8,
	},
	webGenStrengthBar: {
		paddingHorizontal: 18,
		paddingVertical: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	webGenStrengthText: {
		color: "#ffffff",
		fontWeight: "800",
		fontSize: 14,
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},
	webGenFillBtn: {
		backgroundColor: "transparent",
		borderWidth: 1.5,
		borderColor: "#ffffff",
		borderRadius: 20,
		paddingHorizontal: 18,
		paddingVertical: 4,
	},
	webGenFillText: {
		color: "#ffffff",
		fontWeight: "700",
		fontSize: 12,
	},
	webGenBody: {
		padding: 18,
	},
	webGenRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 10,
	},
	webGenRowTitle: {
		color: "#f1f5f9",
		fontSize: 15,
		fontWeight: "600",
	},
	webGenRowSimple: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	webGenSection: {
		marginTop: 12,
		marginBottom: 6,
	},
	webGenLabel: {
		color: "#94a3b8",
		fontSize: 13,
		fontWeight: "600",
	},
	webGenValueBadge: {
		color: "#a78bfa",
		fontSize: 13,
		fontWeight: "700",
	},
	webGenDivider: {
		height: 1,
		backgroundColor: "#1e293b",
		marginVertical: 14,
	},
	webGenGroupHeader: {
		color: "#94a3b8",
		fontSize: 12,
		fontWeight: "800",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 4,
	},
	webSwitch: {
		width: 44,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#334155",
		padding: 2,
		justifyContent: "center",
	},
	webSwitchActive: {
		backgroundColor: "#3b82f6",
	},
	webSwitchThumb: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: "#ffffff",
	},
	webSwitchThumbActive: {
		alignSelf: "flex-end",
	},
	lengthPillsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		marginTop: 6,
		marginBottom: 8,
	},
	lengthPill: {
		backgroundColor: "#131b2e",
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 8,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#1e293b",
	},
	lengthPillActive: {
		backgroundColor: "#7c3aed",
		borderColor: "#8b5cf6",
	},
	lengthPillText: {
		color: "#94a3b8",
		fontWeight: "600",
		fontSize: 12,
	},
	lengthPillTextActive: {
		color: "#fff",
	},
	primaryBtn: {
		width: "100%",
		backgroundColor: "#7c3aed",
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: "center",
		marginTop: 20,
		marginBottom: 25,
	},
	btnText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},
});
