import React, { useEffect, useRef, useState } from "react";
import { View, Image, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./ui/text";

interface MobileSplashScreenProps {
	label?: string;
	sublabel?: string;
	onComplete?: () => void;
	isError?: boolean;
	errorMessage?: string;
}

export function MobileSplashScreen({
	label = "Loading Vault...",
	sublabel,
	onComplete,
	isError = false,
	errorMessage = "Failed to load vault",
}: MobileSplashScreenProps) {
	const [displayProgress, setDisplayProgress] = useState(0);

	const fadeAnim = useRef(new Animated.Value(1)).current;
	const scaleAnim = useRef(new Animated.Value(0.92)).current;
	const progressAnim = useRef(new Animated.Value(0)).current;
	const shimmerAnim = useRef(new Animated.Value(0)).current;

	// Label transition animation
	const labelFadeAnim = useRef(new Animated.Value(1)).current;
	const labelScaleAnim = useRef(new Animated.Value(1)).current;
	const prevLabelRef = useRef(label);

	useEffect(() => {
		// Entrance pop animation
		Animated.spring(scaleAnim, {
			toValue: 1,
			friction: 7,
			tension: 40,
			useNativeDriver: true,
		}).start();

		// Shimmer looping sweep across progress bar
		const shimmerLoop = Animated.loop(
			Animated.timing(shimmerAnim, {
				toValue: 1,
				duration: 1200,
				easing: Easing.linear,
				useNativeDriver: true,
			})
		);
		shimmerLoop.start();

		return () => {
			shimmerLoop.stop();
		};
	}, []);

	// Asymptotic realistic progression toward 100%, exactly like VaultProgressLoader
	useEffect(() => {
		if (isError) return;

		const target = 100;
		const interval = setInterval(() => {
			setDisplayProgress((prev) => {
				if (prev >= target) {
					clearInterval(interval);
					return target;
				}
				const diff = target - prev;
				// Progressive steps with realistic natural pacing matching frontend VaultProgressLoader
				const step = Math.min(Math.max(1, Math.round(diff * 0.09)), 5);
				return Math.min(prev + step, target);
			});
		}, 30);

		return () => clearInterval(interval);
	}, [isError]);

	const isCompleted = displayProgress >= 100;

	// Smooth text transition when label changes
	useEffect(() => {
		if (prevLabelRef.current !== label) {
			Animated.sequence([
				Animated.parallel([
					Animated.timing(labelFadeAnim, {
						toValue: 0,
						duration: 120,
						useNativeDriver: true,
					}),
					Animated.timing(labelScaleAnim, {
						toValue: 0.9,
						duration: 120,
						useNativeDriver: true,
					}),
				]),
				Animated.parallel([
					Animated.timing(labelFadeAnim, {
						toValue: 1,
						duration: 160,
						useNativeDriver: true,
					}),
					Animated.spring(labelScaleAnim, {
						toValue: 1,
						friction: 6,
						tension: 50,
						useNativeDriver: true,
					}),
				]),
			]).start();
			prevLabelRef.current = label;
		}
	}, [label]);

	// Completion handling with fade-out
	useEffect(() => {
		if (isCompleted && onComplete) {
			const timer = setTimeout(() => {
				Animated.timing(fadeAnim, {
					toValue: 0,
					duration: 250,
					useNativeDriver: true,
				}).start(() => {
					onComplete();
				});
			}, 400);
			return () => clearTimeout(timer);
		}
	}, [isCompleted, onComplete]);

	// Animate progress width
	useEffect(() => {
		Animated.timing(progressAnim, {
			toValue: displayProgress,
			duration: 60,
			useNativeDriver: false,
		}).start();
	}, [displayProgress]);

	const activeLabel = isError
		? errorMessage
		: isCompleted
			? "complete"
			: label;

	const progressWidthPercent = progressAnim.interpolate({
		inputRange: [0, 100],
		outputRange: ["0%", "100%"],
	});

	const shimmerTranslateX = shimmerAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [-120, 320],
	});

	return (
		<Animated.View
			style={{ opacity: fadeAnim }}
			className="flex-1 bg-background justify-center items-center px-6"
		>
			<SafeAreaView className="flex-1 w-full justify-center items-center">
				<Animated.View
					style={{ transform: [{ scale: scaleAnim }] }}
					className="w-full max-w-sm flex-col items-center justify-center space-y-6"
				>
					{/* Logo / Brand Icon - matching web vault-progress-loader */}
					<View className="relative flex items-center justify-center w-20 h-20 mb-2">
						<Image
							source={require("../../assets/icon.png")}
							className="h-16 w-16"
							style={{ width: 64, height: 64 }}
							resizeMode="contain"
						/>
					</View>

					{/* Animated Text Section */}
					<View className="relative h-8 flex-row items-center justify-center w-full">
						<Animated.View
							style={{
								opacity: labelFadeAnim,
								transform: [{ scale: labelScaleAnim }],
							}}
						>
							<Text
								className={`text-xl font-medium tracking-tight text-center ${
									isError
										? "text-destructive font-semibold"
										: isCompleted
											? "text-blue-500 font-semibold"
											: "text-muted-foreground"
								}`}
								numberOfLines={1}
							>
								{activeLabel}
							</Text>
						</Animated.View>
					</View>

					{/* Sleek Progress Bar with Shimmer & Glow matching web vault loader */}
					<View className="w-full relative px-2 mt-4">
						{/* Progress Track */}
						<View
							style={{ width: "100%", height: 10 }}
							className="w-full h-2.5 bg-muted/40 rounded-full relative overflow-hidden"
						>
							{/* Indicator */}
							<Animated.View
								style={{
									width: progressWidthPercent,
									height: "100%",
								}}
								className={`h-full rounded-full relative overflow-hidden ${
									isError ? "bg-destructive" : "bg-blue-500"
								}`}
							>
								{/* Shimmer sweep effect while progressing */}
								{!isCompleted && !isError && (
									<Animated.View
										style={{
											transform: [{ translateX: shimmerTranslateX }],
											width: 96,
											height: "100%",
										}}
										className="absolute top-0 bottom-0 bg-white/40"
									/>
								)}
							</Animated.View>
						</View>

						{/* Glow underneath that tracks progress */}
						<Animated.View
							style={{
								width: progressWidthPercent,
								height: 4,
								opacity: isCompleted ? 0 : 0.6,
							}}
							className={`h-1 rounded-full mt-1.5 ${
								isError ? "bg-destructive" : "bg-blue-500"
							}`}
						/>
					</View>

					{/* Sublabel if provided */}
					{sublabel ? (
						<Text className="text-xs text-muted-foreground/60 text-center tracking-wide font-mono mt-2">
							{sublabel}
						</Text>
					) : null}
				</Animated.View>
			</SafeAreaView>
		</Animated.View>
	);
}

export default MobileSplashScreen;
