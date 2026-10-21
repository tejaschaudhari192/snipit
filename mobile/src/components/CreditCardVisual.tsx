import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
		<View className="bg-indigo-950 rounded-2xl p-4.5 border border-violet-400/30 mb-4">
			<View className="flex-row justify-between items-center">
				<Text className="text-violet-300 text-[10px] font-extrabold tracking-wider">CARD VAULT</Text>
				<CreditCard color="#a78bfa" size={24} />
			</View>

			<View className="my-3.5">
				<Text className="text-white text-[20px] font-bold tracking-widest font-mono">
					{showNumber ? formatCardNumber(cardNumber) : maskCardNumber(cardNumber)}
				</Text>
			</View>

			<View className="flex-row justify-between mt-2">
				<View>
					<Text className="text-slate-400 text-[9px] font-bold tracking-wider">CARDHOLDER</Text>
					<Text className="text-slate-50 text-[13px] font-semibold mt-0.5">
						{(cardholderName || "VALUED MEMBER").toUpperCase()}
					</Text>
				</View>
				<View>
					<Text className="text-slate-400 text-[9px] font-bold tracking-wider">EXPIRES</Text>
					<Text className="text-slate-50 text-[13px] font-semibold mt-0.5">{expiration || "MM/YY"}</Text>
				</View>
				<View>
					<Text className="text-slate-400 text-[9px] font-bold tracking-wider">CVV</Text>
					<Text className="text-slate-50 text-[13px] font-semibold mt-0.5">{showCvv ? cvv || "•••" : "•••"}</Text>
				</View>
			</View>

			<View className="flex-row justify-between mt-4 pt-3 border-t border-white/10">
				<TouchableOpacity className="flex-row items-center gap-1 bg-white/10 px-2 py-1.5 rounded-lg" onPress={onToggleNumber}>
					{showNumber ? <EyeOff color="#fff" size={14} /> : <Eye color="#fff" size={14} />}
					<Text className="text-white text-xs font-semibold">{showNumber ? "Mask Number" : "Show Number"}</Text>
				</TouchableOpacity>

				<TouchableOpacity className="flex-row items-center gap-1 bg-white/10 px-2 py-1.5 rounded-lg" onPress={onToggleCvv}>
					{showCvv ? <EyeOff color="#fff" size={14} /> : <Eye color="#fff" size={14} />}
					<Text className="text-white text-xs font-semibold">{showCvv ? "Mask CVV" : "Show CVV"}</Text>
				</TouchableOpacity>

				{cardNumber && (
					<TouchableOpacity className="flex-row items-center gap-1 bg-white/10 px-2 py-1.5 rounded-lg" onPress={onCopyCard}>
						{copied ? <Check color="#22c55e" size={14} /> : <Copy color="#fff" size={14} />}
						<Text className="text-white text-xs font-semibold">Copy Card</Text>
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
}
