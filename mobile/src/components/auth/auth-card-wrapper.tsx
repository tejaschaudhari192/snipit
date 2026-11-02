import { SocialConnections } from "@/components/social-connections";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { AlertCircle } from "lucide-react-native";
import * as React from "react";
import { Animated, Pressable, View } from "react-native";

export interface AuthCardWrapperProps {
	title: string;
	description?: string;
	error?: string;
	showSocial?: boolean;
	footer?: {
		prompt: string;
		actionText: string;
		onPress: () => void;
	};
	children: React.ReactNode;
}

export function AuthCardWrapper({
	title,
	description,
	error,
	showSocial = false,
	footer,
	children,
}: AuthCardWrapperProps) {
	// Smooth shake/fade animation when an error occurs
	const shakeAnim = React.useRef(new Animated.Value(0)).current;
	const opacityAnim = React.useRef(new Animated.Value(0)).current;

	React.useEffect(() => {
		if (error) {
			opacityAnim.setValue(0);
			Animated.parallel([
				Animated.timing(opacityAnim, {
					toValue: 1,
					duration: 200,
					useNativeDriver: true,
				}),
				Animated.sequence([
					Animated.timing(shakeAnim, {
						toValue: 8,
						duration: 60,
						useNativeDriver: true,
					}),
					Animated.timing(shakeAnim, {
						toValue: -8,
						duration: 60,
						useNativeDriver: true,
					}),
					Animated.timing(shakeAnim, {
						toValue: 6,
						duration: 60,
						useNativeDriver: true,
					}),
					Animated.timing(shakeAnim, {
						toValue: -6,
						duration: 60,
						useNativeDriver: true,
					}),
					Animated.timing(shakeAnim, {
						toValue: 0,
						duration: 60,
						useNativeDriver: true,
					}),
				]),
			]).start();
		}
	}, [error, shakeAnim, opacityAnim]);

	return (
		<View className="gap-6">
			<Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
				<CardHeader>
					<CardTitle className="text-center text-xl sm:text-left">
						{title}
					</CardTitle>
					{description ? (
						<CardDescription className="text-center sm:text-left">
							{description}
						</CardDescription>
					) : null}
				</CardHeader>
				<CardContent className="gap-5">
					{error ? (
						<Animated.View
							style={{
								opacity: opacityAnim,
								transform: [{ translateX: shakeAnim }],
							}}
							className="flex-row items-center gap-2.5 p-3 rounded-lg border border-destructive/30 bg-destructive/10 dark:bg-destructive/15"
						>
							<Icon
								as={AlertCircle}
								className="text-destructive shrink-0"
								size={18}
							/>
							<Text className="text-destructive text-xs font-medium flex-1 leading-4">
								{error}
							</Text>
						</Animated.View>
					) : null}

					<View className="gap-4">{children}</View>

					{footer ? (
						<Text className="text-center text-sm">
							{footer.prompt}{" "}
							<Pressable onPress={footer.onPress}>
								<Text className="text-sm underline underline-offset-4 font-semibold text-primary">
									{footer.actionText}
								</Text>
							</Pressable>
						</Text>
					) : null}

					{showSocial ? (
						<>
							<View className="flex-row items-center my-1">
								<Separator className="flex-1" />
								<Text className="text-muted-foreground px-4 text-xs uppercase tracking-wider">
									or continue with
								</Text>
								<Separator className="flex-1" />
							</View>
							<SocialConnections />
						</>
					) : null}
				</CardContent>
			</Card>
		</View>
	);
}
