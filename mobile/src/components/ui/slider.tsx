import React from "react";
import { View, TouchableOpacity, Text as RNText } from "react-native";
import { cn } from "@/lib/utils";

export interface SliderProps {
	value: number;
	min?: number;
	max?: number;
	step?: number;
	onValueChange: (val: number) => void;
	className?: string;
	showTicks?: boolean;
}

export function Slider({
	value,
	min = 0,
	max = 10,
	step = 1,
	onValueChange,
	className,
	showTicks = true,
}: SliderProps) {
	// Fluid Shadcn styled touch-drag track with thumb & step marks
	const [trackWidth, setTrackWidth] = React.useState(0);
	const percentage = Math.min(1, Math.max(0, (value - min) / (max - min)));

	const handleTouch = (evt: any) => {
		if (trackWidth <= 0) return;
		const touchX = evt.nativeEvent.locationX;
		const rawRatio = Math.min(1, Math.max(0, touchX / trackWidth));
		const rawVal = min + rawRatio * (max - min);
		const steppedVal = Math.round(rawVal / step) * step;
		const clamped = Math.min(max, Math.max(min, steppedVal));
		onValueChange(clamped);
	};

	return (
		<View className={cn("w-full py-2.5", className)}>
			<View
				className="h-7 justify-center"
				onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
				onStartShouldSetResponder={() => true}
				onMoveShouldSetResponder={() => true}
				onResponderGrant={handleTouch}
				onResponderMove={handleTouch}
			>
				{/* Background Track */}
				<View className="h-2 w-full rounded-full bg-secondary/80 overflow-hidden relative">
					{/* Active Fill Track */}
					<View
						className="h-full bg-primary rounded-full"
						style={{ width: `${percentage * 100}%` }}
					/>
				</View>

				{/* Drag Thumb */}
				{trackWidth > 0 && (
					<View
						className="absolute w-5 h-5 rounded-full bg-background border-2 border-primary shadow-md items-center justify-center -ml-2.5"
						style={{
							left: `${percentage * 100}%`,
							elevation: 3,
						}}
					>
						<View className="w-1.5 h-1.5 rounded-full bg-primary" />
					</View>
				)}
			</View>

			{/* Discrete Step Indicators */}
			{showTicks && (
				<View className="flex-row justify-between items-center px-0.5 mt-1">
					{Array.from({ length: Math.floor((max - min) / step) + 1 }).map((_, i) => {
						const tickVal = min + i * step;
						const isSelected = tickVal === value;
						return (
							<TouchableOpacity
								key={tickVal}
								onPress={() => onValueChange(tickVal)}
								hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
							>
								<RNText
									className={cn(
										"text-[10px] font-semibold",
										isSelected ? "text-primary font-bold" : "text-muted-foreground/60"
									)}
								>
									{tickVal}
								</RNText>
							</TouchableOpacity>
						);
					})}
				</View>
			)}
		</View>
	);
}
