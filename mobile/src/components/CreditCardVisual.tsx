import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Pressable,
	Animated,
	Platform,
} from "react-native";
import { Wifi, Eye, EyeOff, Copy, Check } from "lucide-react-native";
import Svg, {
	Defs,
	LinearGradient,
	Stop,
	Rect,
	Line,
	Circle,
} from "react-native-svg";
import * as Clipboard from "expo-clipboard";

export interface CreditCardVisualProps {
	cardNumber?: string;
	cardholderName?: string;
	expiration?: string;
	cvv?: string;
	bankName?: string;
	showNumber?: boolean;
	showCvv?: boolean;
	copied?: boolean;
	isFlipped?: boolean;
	onFlipChange?: (flipped: boolean) => void;
	onToggleNumber?: () => void;
	onToggleCvv?: () => void;
	onCopyCard?: () => void;
	className?: string;
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

export const ChipSVG = () => (
	<Svg width={44} height={34} viewBox="0 0 44 34">
		<Rect width="44" height="34" rx="5" fill="#C9963A" />
		<Rect x="14" width="16" height="34" fill="#B8852A" />
		<Rect y="11" width="44" height="12" fill="#B8852A" />
		<Rect x="14" y="11" width="16" height="12" fill="#E0B060" />
		<Line
			x1="14"
			y1="0"
			x2="14"
			y2="11"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<Line
			x1="30"
			y1="0"
			x2="30"
			y2="11"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<Line
			x1="14"
			y1="23"
			x2="14"
			y2="34"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<Line
			x1="30"
			y1="23"
			x2="30"
			y2="34"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<Line
			x1="0"
			y1="11"
			x2="14"
			y2="11"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<Line
			x1="0"
			y1="23"
			x2="14"
			y2="23"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<Line
			x1="30"
			y1="11"
			x2="44"
			y2="11"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
		<Line
			x1="30"
			y1="23"
			x2="44"
			y2="23"
			stroke="#9A6E1A"
			strokeWidth="0.6"
		/>
	</Svg>
);

export const CardNetworkLogo = ({
	cardNumber = "",
}: {
	cardNumber?: string;
}) => {
	const clean = cardNumber.replace(/\s+/g, "");
	const isVisa = clean.startsWith("4");
	const isAmex = clean.startsWith("34") || clean.startsWith("37");

	if (isVisa) {
		return (
			<Text className="text-white font-black italic tracking-widest text-lg font-serif">
				VISA
			</Text>
		);
	}

	if (isAmex) {
		return (
			<View className="border border-white/60 px-1.5 py-0.5 rounded">
				<Text className="text-white font-extrabold tracking-tighter text-[10px]">
					AMEX
				</Text>
			</View>
		);
	}

	// Default Mastercard logo
	return (
		<View className="flex-row items-center">
			<View className="w-6 h-6 rounded-full bg-red-500/90" />
			<View className="w-6 h-6 rounded-full bg-amber-400/90 -ml-2.5" />
		</View>
	);
};

export function CreditCardVisual({
	cardNumber = "",
	cardholderName = "",
	expiration = "",
	cvv = "",
	bankName = "",
	showNumber: controlledShowNumber,
	showCvv: controlledShowCvv,
	copied: controlledCopied,
	isFlipped: controlledFlipped,
	onFlipChange,
	onToggleNumber,
	onToggleCvv,
	onCopyCard,
	className = "",
}: CreditCardVisualProps) {
	const [internalFlipped, setInternalFlipped] = useState(false);
	const [internalShowSensitives, setInternalShowSensitives] = useState(false);
	const [internalCopied, setInternalCopied] = useState(false);

	const isFlipped =
		controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

	const showSensitives =
		controlledShowNumber !== undefined
			? controlledShowNumber
			: internalShowSensitives;

	const showCvvSensitives =
		controlledShowCvv !== undefined
			? controlledShowCvv
			: internalShowSensitives;

	const isCopied =
		controlledCopied !== undefined ? controlledCopied : internalCopied;

	// 3D Flip animation using Animated
	const animatedValue = useRef(
		new Animated.Value(isFlipped ? 180 : 0),
	).current;

	useEffect(() => {
		Animated.spring(animatedValue, {
			toValue: isFlipped ? 180 : 0,
			friction: 8,
			tension: 10,
			useNativeDriver: true,
		}).start();
	}, [isFlipped, animatedValue]);

	const frontInterpolate = animatedValue.interpolate({
		inputRange: [0, 180],
		outputRange: ["0deg", "180deg"],
	});

	const backInterpolate = animatedValue.interpolate({
		inputRange: [0, 180],
		outputRange: ["180deg", "360deg"],
	});

	const frontOpacity = animatedValue.interpolate({
		inputRange: [89, 90],
		outputRange: [1, 0],
	});

	const backOpacity = animatedValue.interpolate({
		inputRange: [89, 90],
		outputRange: [0, 1],
	});

	const handleFlipToggle = () => {
		const next = !isFlipped;
		if (onFlipChange) {
			onFlipChange(next);
		}
		if (controlledFlipped === undefined) {
			setInternalFlipped(next);
		}
	};

	const cleanNumber = cardNumber.replace(/\s+/g, "");
	const formattedNum = formatCardNumber(cleanNumber);
	const maskedNum = maskCardNumber(cleanNumber);

	const handleCopy = async () => {
		if (onCopyCard) {
			onCopyCard();
			return;
		}
		if (cleanNumber) {
			await Clipboard.setStringAsync(cleanNumber);
			setInternalCopied(true);
			setTimeout(() => setInternalCopied(false), 2000);
		}
	};

	const handleToggleSensitives = () => {
		if (onToggleNumber) onToggleNumber();
		if (onToggleCvv) onToggleCvv();
		if (controlledShowNumber === undefined) {
			setInternalShowSensitives((s) => !s);
		}
	};

	return (
		<View className={`flex-col items-center w-full mb-3 ${className}`}>
			{/* Flip Card Container */}
			<Pressable
				onPress={handleFlipToggle}
				className="w-full max-w-sm h-52 relative"
			>
				{/* ── FRONT FACE ── */}
				<Animated.View
					pointerEvents={isFlipped ? "none" : "auto"}
					style={[
						{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							borderRadius: 16,
							overflow: "hidden",
							backfaceVisibility: "hidden",
							transform: [
								{ perspective: 1200 },
								{ rotateY: frontInterpolate },
							],
							opacity: frontOpacity,
						},
					]}
				>
					{/* Gradient Background via react-native-svg */}
					<Svg
						height="100%"
						width="100%"
						style={{ position: "absolute", top: 0, left: 0 }}
					>
						<Defs>
							<LinearGradient
								id="frontGrad"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="100%"
							>
								<Stop offset="0%" stopColor="#2563eb" />
								<Stop offset="50%" stopColor="#0ea5e9" />
								<Stop offset="100%" stopColor="#2dd4bf" />
							</LinearGradient>
						</Defs>
						<Rect
							width="100%"
							height="100%"
							fill="url(#frontGrad)"
						/>
						<Rect
							width="100%"
							height="100%"
							fill="#000000"
							fillOpacity={0.25}
						/>
						{/* Ambient Glow Orbs */}
						<Circle
							cx="85%"
							cy="10%"
							r="90"
							fill="#ffffff"
							fillOpacity={0.12}
						/>
						<Circle
							cx="10%"
							cy="95%"
							r="110"
							fill="#ffffff"
							fillOpacity={0.08}
						/>
					</Svg>

					{/* Front Card Content */}
					<View className="flex-1 justify-between p-5">
						{/* Row 1: Bank Name | Copy & Visibility Actions */}
						<View className="flex-row items-center justify-between">
							<Text
								className="text-white font-bold text-base tracking-wider uppercase flex-1 mr-2"
								numberOfLines={1}
							>
								{bankName || "Vault Card"}
							</Text>
							<View className="flex-row items-center gap-1.5">
								{cleanNumber ? (
									<TouchableOpacity
										onPress={handleCopy}
										className="h-7 w-7 rounded-full bg-black/25 items-center justify-center active:bg-black/40"
										hitSlop={{
											top: 8,
											bottom: 8,
											left: 8,
											right: 8,
										}}
									>
										{isCopied ? (
											<Check size={14} color="#6ee7b7" />
										) : (
											<Copy size={14} color="#ffffff" />
										)}
									</TouchableOpacity>
								) : null}
								<TouchableOpacity
									onPress={handleToggleSensitives}
									className="h-7 w-7 rounded-full bg-black/25 items-center justify-center active:bg-black/40"
									hitSlop={{
										top: 8,
										bottom: 8,
										left: 8,
										right: 8,
									}}
								>
									{showSensitives ? (
										<EyeOff size={14} color="#ffffff" />
									) : (
										<Eye size={14} color="#ffffff" />
									)}
								</TouchableOpacity>
							</View>
						</View>

						{/* Row 2: Chip + NFC */}
						<View className="flex-row items-center justify-between my-1">
							<ChipSVG />
							<Wifi
								size={20}
								color="rgba(255, 255, 255, 0.85)"
								style={{ transform: [{ rotate: "90deg" }] }}
							/>
						</View>

						{/* Row 3: Card Number */}
						<View className="my-0.5">
							<Text className="font-mono text-white text-[17px] font-semibold tracking-widest select-none">
								{showSensitives ? formattedNum : maskedNum}
							</Text>
						</View>

						{/* Row 4: Cardholder | Expiry | Network */}
						<View className="flex-row items-end justify-between mt-1">
							<View className="max-w-[48%]">
								<Text className="text-white/70 text-[9px] uppercase tracking-wider">
									CARD HOLDER
								</Text>
								<Text
									className="text-white text-xs font-semibold tracking-wider mt-0.5 uppercase font-mono"
									numberOfLines={1}
								>
									{cardholderName || "CARDHOLDER"}
								</Text>
							</View>
							<View>
								<Text className="text-white/70 text-[9px] uppercase tracking-wider">
									EXPIRES
								</Text>
								<Text className="text-white text-xs font-semibold tracking-widest mt-0.5 font-mono">
									{expiration || "MM/YY"}
								</Text>
							</View>
							<CardNetworkLogo cardNumber={cleanNumber} />
						</View>
					</View>
				</Animated.View>

				{/* ── BACK FACE ── */}
				<Animated.View
					pointerEvents={isFlipped ? "auto" : "none"}
					style={[
						{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							borderRadius: 16,
							overflow: "hidden",
							backfaceVisibility: "hidden",
							transform: [
								{ perspective: 1200 },
								{ rotateY: backInterpolate },
							],
							opacity: backOpacity,
						},
					]}
				>
					{/* Gradient Background */}
					<Svg
						height="100%"
						width="100%"
						style={{ position: "absolute", top: 0, left: 0 }}
					>
						<Defs>
							<LinearGradient
								id="backGrad"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="100%"
							>
								<Stop offset="0%" stopColor="#2563eb" />
								<Stop offset="50%" stopColor="#0ea5e9" />
								<Stop offset="100%" stopColor="#2dd4bf" />
							</LinearGradient>
						</Defs>
						<Rect
							width="100%"
							height="100%"
							fill="url(#backGrad)"
						/>
						<Rect
							width="100%"
							height="100%"
							fill="#000000"
							fillOpacity={0.25}
						/>
					</Svg>

					{/* Back Card Content */}
					<View className="flex-1 justify-between py-4">
						{/* Magnetic Stripe */}
						<View className="w-full h-10 bg-black/80 mt-1" />

						{/* CVV Stripe */}
						<View className="px-5">
							<View className="flex-row items-end gap-3">
								{/* Signature line / hashed background */}
								<View className="flex-1 h-8 bg-white/90 rounded-sm flex-row items-center overflow-hidden">
									{Array.from({ length: 22 }).map((_, i) => (
										<View
											key={i}
											className={`flex-1 h-full ${
												i % 2 === 0
													? "bg-slate-300/70"
													: "bg-white/80"
											}`}
										/>
									))}
								</View>
								<View className="items-center shrink-0">
									<Text className="text-white/70 text-[9px] uppercase tracking-widest mb-0.5">
										CVV
									</Text>
									<View className="bg-white px-2.5 py-1 rounded-sm min-w-11 items-center justify-center">
										<Text className="text-slate-900 font-mono font-bold text-xs select-none">
											{showCvvSensitives
												? cvv || "•••"
												: "•••"}
										</Text>
									</View>
								</View>
							</View>
							<Text className="text-white/60 text-[10px] leading-relaxed mt-2.5">
								Authorized signature not valid unless signed.
								For customer service or lost cards, contact your
								card issuer immediately.
							</Text>
						</View>

						{/* Back Bottom Network Logo */}
						<View className="px-5 items-end">
							<CardNetworkLogo cardNumber={cleanNumber} />
						</View>
					</View>
				</Animated.View>
			</Pressable>

			{/* Hint label */}
			<Text className="text-[11px] text-muted-foreground mt-2">
				Click / tap card to flip
			</Text>
		</View>
	);
}

export default CreditCardVisual;
