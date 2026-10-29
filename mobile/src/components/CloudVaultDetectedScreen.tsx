import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Cloud, ServerOff, ArrowLeft } from "lucide-react-native";
import { Icon } from "./ui/icon";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

interface CloudVaultDetectedScreenProps {
	onEnableSync: () => void;
	onStartFresh: () => void;
	onBack?: () => void;
	userEmail?: string;
}

export function CloudVaultDetectedScreen({
	onEnableSync,
	onStartFresh,
	onBack,
	userEmail,
}: CloudVaultDetectedScreenProps) {
	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
				{onBack ? (
					<Button variant="ghost" size="icon" onPress={onBack} className="h-9 w-9">
						<Icon as={ArrowLeft} className="text-foreground" size={18} />
					</Button>
				) : (
					<View className="w-9" />
				)}
				<Text className="text-sm font-semibold tracking-tight text-foreground">
					Existing Vault
				</Text>
				<View className="w-9" />
			</View>

			<ScrollView
				className="flex-1 bg-background"
				contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
				contentContainerClassName="p-4 max-w-sm w-full mx-auto"
				showsVerticalScrollIndicator={false}
			>
				<Card className="w-full border-border bg-card">
					<CardHeader className="text-center pb-2 items-center">
						<View className="w-16 h-16 rounded-full bg-primary/10 justify-center items-center mb-2">
							<Icon as={Cloud} className="text-primary" size={32} />
						</View>
						<CardTitle className="text-2xl font-bold tracking-tight text-center text-foreground">
							Cloud Vault Detected
						</CardTitle>
						<CardDescription className="text-center text-xs mt-1 text-muted-foreground leading-5">
							{userEmail ? `Found an existing encrypted vault for ${userEmail}.` : "We found an encrypted vault associated with your account in the cloud."}
							{"\n"}Would you like to sync and unlock it on this device?
						</CardDescription>
					</CardHeader>

					<CardContent className="gap-3 pt-4">
						<Button className="w-full h-11" onPress={onEnableSync}>
							<Text className="font-semibold text-primary-foreground text-sm">
								Enable Sync & Unlock
							</Text>
						</Button>

						<Button variant="outline" className="w-full h-11 flex-row gap-2" onPress={onStartFresh}>
							<Icon as={ServerOff} className="text-foreground" size={16} />
							<Text className="font-semibold text-foreground text-sm">
								Start Fresh (Local Only)
							</Text>
						</Button>
					</CardContent>
				</Card>
			</ScrollView>
		</SafeAreaView>
	);
}

export default CloudVaultDetectedScreen;

