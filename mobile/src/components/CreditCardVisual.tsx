import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Eye, EyeOff, Copy, CreditCard, Check } from "lucide-react-native";

interface Props {
	cardNumber?: string;
	cardholderName?: string;
	expiration?: string;
	cvv?: string;
	showNumber: boolean;
	showCvv: boolean;
	copied: boolean;
	onToggleNumber: () => void;
	onToggleCvv: () => void;
	onCopyCard: () => void;
}

export function formatCardNumber(num?: string) {
	if (!num) return "•••• •••• •••• ••••";
	const cleaned = num.replace(/\s+/g, "");
	return cleaned.replace(/(\d{4})/g, "$1 ").trim();
}

export function maskCardNumber(num?: string) {
	if (!num) return "•••• •••• •••• ••••";
	const cleaned = num.replace(/\s+/g, "");
	if (cleaned.length >= 8) {
		return `${cleaned.slice(0, 4)} •••• •••• ${cleaned.slice(-4)}`;
	}
	return formatCardNumber(num);
}

export function CreditCardVisual({
	cardNumber,
	cardholderName,
	expiration,
	cvv,
	showNumber,
	showCvv,
	copied,
	onToggleNumber,
	onToggleCvv,
	onCopyCard,
}: Props) {
	return (
		<View style={styles.creditCardVisual}>
			<View style={styles.cardHeaderRow}>
				<Text style={styles.cardChipText}>CARD VAULT</Text>
				<CreditCard color="#a78bfa" size={24} />
			</View>

			<View style={{ marginVertical: 14 }}>
				<Text style={styles.cardVisualNumber}>
					{showNumber ? formatCardNumber(cardNumber) : maskCardNumber(cardNumber)}
				</Text>
			</View>

			<View style={styles.cardBottomRow}>
				<View>
					<Text style={styles.cardMiniLabel}>CARDHOLDER</Text>
					<Text style={styles.cardMiniValue}>
						{(cardholderName || "VALUED MEMBER").toUpperCase()}
					</Text>
				</View>
				<View>
					<Text style={styles.cardMiniLabel}>EXPIRES</Text>
					<Text style={styles.cardMiniValue}>{expiration || "MM/YY"}</Text>
				</View>
				<View>
					<Text style={styles.cardMiniLabel}>CVV</Text>
					<Text style={styles.cardMiniValue}>{showCvv ? cvv || "•••" : "•••"}</Text>
				</View>
			</View>

			<View style={styles.cardActionRow}>
				<TouchableOpacity style={styles.cardActionBtn} onPress={onToggleNumber}>
					{showNumber ? <EyeOff color="#fff" size={14} /> : <Eye color="#fff" size={14} />}
					<Text style={styles.cardActionText}>{showNumber ? "Mask Number" : "Show Number"}</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.cardActionBtn} onPress={onToggleCvv}>
					{showCvv ? <EyeOff color="#fff" size={14} /> : <Eye color="#fff" size={14} />}
					<Text style={styles.cardActionText}>{showCvv ? "Mask CVV" : "Show CVV"}</Text>
				</TouchableOpacity>

				{cardNumber && (
					<TouchableOpacity style={styles.cardActionBtn} onPress={onCopyCard}>
						{copied ? <Check color="#22c55e" size={14} /> : <Copy color="#fff" size={14} />}
						<Text style={styles.cardActionText}>Copy Card</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	creditCardVisual: {
		backgroundColor: "#1e1b4b",
		borderRadius: 16,
		padding: 18,
		borderWidth: 1,
		borderColor: "rgba(167, 139, 250, 0.3)",
		marginBottom: 16,
	},
	cardHeaderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	cardChipText: {
		color: "#a78bfa",
		fontSize: 10,
		fontWeight: "800",
		letterSpacing: 1,
	},
	cardVisualNumber: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "700",
		letterSpacing: 2,
		fontFamily: "monospace",
	},
	cardBottomRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 8,
	},
	cardMiniLabel: {
		color: "#94a3b8",
		fontSize: 9,
		fontWeight: "700",
		letterSpacing: 1,
	},
	cardMiniValue: {
		color: "#f8fafc",
		fontSize: 13,
		fontWeight: "600",
		marginTop: 2,
	},
	cardActionRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 16,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "rgba(255,255,255,0.1)",
	},
	cardActionBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: "rgba(255,255,255,0.1)",
		paddingHorizontal: 8,
		paddingVertical: 6,
		borderRadius: 8,
	},
	cardActionText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
	},
});
