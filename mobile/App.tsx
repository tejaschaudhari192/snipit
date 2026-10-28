import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
	View,
	useColorScheme,
	BackHandler,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { PWMGScreen } from "./src/screens/PWMGScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { offlineVault, UserSession } from "./src/core/vault-storage";
import NetInfo from "@react-native-community/netinfo";
import { checkAppUpdate } from "./src/core/update-checker";
import { UpdateInfoModal } from "./src/components/UpdateInfoModal";
import { UIStyleProvider } from "./src/core/UIStyleContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";

export default function App() {
	const [activeTool, setActiveTool] = useState<"pwmg" | "auth" | "profile">("pwmg");
	const [user, setUser] = useState<UserSession | null>(null);
	const [themeMode, setThemeMode] = useState<"system" | "dark" | "light">("system");
	const systemColorScheme = useColorScheme();
	const { setColorScheme } = useNativeWindColorScheme();

	const resolvedTheme: "dark" | "light" =
		themeMode === "system"
			? systemColorScheme === "light"
				? "light"
				: "dark"
			: themeMode;

	useEffect(() => {
		// Pass themeMode directly so NativeWind handles "system" natively.
		setColorScheme(themeMode);
	}, [themeMode, setColorScheme]);

	const [autoUpdateModalVisible, setAutoUpdateModalVisible] = useState(false);
	const [autoUpdateResult, setAutoUpdateResult] = useState<any>(null);
	const hasCheckedUpdateRef = React.useRef(false);

	useEffect(() => {
		loadUserSession();
		loadTheme();

		// Hide native splash screen once initial session is ready
		SplashScreen.hideAsync().catch(() => {});

		// Check once after launch when user is connected to internet
		const unsubscribeNet = NetInfo.addEventListener((state: any) => {
			if (state.isConnected && state.isInternetReachable !== false && !hasCheckedUpdateRef.current) {
				hasCheckedUpdateRef.current = true;
				checkAppUpdate()
					.then((res) => {
						if (res.isAvailable) {
							setAutoUpdateResult(res);
							setAutoUpdateModalVisible(true);
						}
					})
					.catch(() => {
						// Silent fail on background auto-check
					});
			}
		});

		return () => unsubscribeNet();
	}, []);

	useEffect(() => {
		const onHardwareBack = () => {
			if (activeTool !== "pwmg") {
				loadUserSession();
				setActiveTool("pwmg");
				return true;
			}
			return false;
		};

		const subscription = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
		return () => subscription.remove();
	}, [activeTool]);

	const loadTheme = async () => {
		const t = await offlineVault.getTheme();
		setThemeMode(t);
	};

	const handleThemeChange = async (newMode: "system" | "dark" | "light") => {
		setThemeMode(newMode);
		await offlineVault.setTheme(newMode);
	};

	const loadUserSession = async () => {
		const u = await offlineVault.getUser();
		setUser(u);
	};

	const handleLogout = async () => {
		try {
			await offlineVault.logout();
			offlineVault.lockVault();
		} catch (err) {
			console.log("Error in handleLogout:", err);
		} finally {
			setUser(null);
		}
	};

	const renderActiveTool = (): React.ReactNode => {
		if (activeTool === "auth") {
			return (
				<AuthScreen
					onBack={() => setActiveTool("pwmg")}
					onAuthSuccess={() => {
						loadUserSession();
						setActiveTool("pwmg");
					}}
					theme={resolvedTheme}
				/>
			);
		}

		if (activeTool === "profile") {
			return (
				<ProfileScreen
					onBack={() => {
						loadUserSession();
						setActiveTool("pwmg");
					}}
					onLogout={async () => {
						await handleLogout();
						setActiveTool("pwmg");
					}}
					onOpenPasswordManager={() => setActiveTool("pwmg")}
					onOpenAuth={() => setActiveTool("auth")}
					theme={resolvedTheme}
					themeMode={themeMode}
					onThemeChange={handleThemeChange}
				/>
			);
		}

		return (
			<PWMGScreen
				onOpenAuth={() => setActiveTool("auth")}
				onOpenProfile={() => setActiveTool("profile")}
				theme={resolvedTheme}
			/>
		);
	};

	return (
		<SafeAreaProvider>
			<UIStyleProvider>
				<View
					className={`flex-1 ${resolvedTheme === "dark" ? "dark bg-background" : "bg-background"}`}
				>
					{renderActiveTool()}
					<UpdateInfoModal
						visible={autoUpdateModalVisible}
						updateResult={autoUpdateResult}
						theme={resolvedTheme}
						onClose={() => setAutoUpdateModalVisible(false)}
					/>
				</View>
			</UIStyleProvider>
		</SafeAreaProvider>
	);
}

