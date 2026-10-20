import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
	View,
	useColorScheme,
	BackHandler,
} from "react-native";
import { PWMGScreen } from "./src/screens/PWMGScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { offlineVault, UserSession } from "./src/core/vault-storage";
import NetInfo from "@react-native-community/netinfo";
import { checkAppUpdate } from "./src/core/update-checker";
import { UpdateInfoModal } from "./src/components/UpdateInfoModal";
import { HubScreen } from "./src/components/HubScreen";

export default function App() {
	const [activeTool, setActiveTool] = useState<"hub" | "pwmg" | "auth" | "profile">("hub");
	const [user, setUser] = useState<UserSession | null>(null);
	const [themeMode, setThemeMode] = useState<"system" | "dark" | "light">("system");
	const systemColorScheme = useColorScheme();

	const resolvedTheme: "dark" | "light" =
		themeMode === "system"
			? systemColorScheme === "light"
				? "light"
				: "dark"
			: themeMode;

	const [defaultTool, setDefaultTool] = useState<"hub" | "pwmg">("hub");
	const [autoUpdateModalVisible, setAutoUpdateModalVisible] = useState(false);
	const [autoUpdateResult, setAutoUpdateResult] = useState<any>(null);
	const hasCheckedUpdateRef = React.useRef(false);

	useEffect(() => {
		loadUserSession();
		loadTheme();
		loadDefaultTool();

		// Check once after launch when user is connected to internet
		const unsubscribeNet = NetInfo.addEventListener((state) => {
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
						// Silent fail on background auto-check so offline/slow connections aren't interrupted
					});
			}
		});

		return () => unsubscribeNet();
	}, []);

	useEffect(() => {
		const onHardwareBack = () => {
			if (activeTool !== "hub") {
				loadUserSession();
				setActiveTool("hub");
				return true;
			}
			return false;
		};

		const subscription = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
		return () => subscription.remove();
	}, [activeTool]);

	const loadDefaultTool = async () => {
		const tool = await offlineVault.getDefaultTool();
		setDefaultTool(tool);
		if (tool === "pwmg") {
			setActiveTool("pwmg");
		}
	};

	const handleDefaultToolChange = async (tool: "hub" | "pwmg") => {
		setDefaultTool(tool);
		await offlineVault.setDefaultTool(tool);
	};

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

	const renderActiveTool = () => {
		if (activeTool === "auth") {
			return (
				<AuthScreen
					onBack={() => setActiveTool("hub")}
					onAuthSuccess={() => {
						loadUserSession();
						setActiveTool("hub");
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
						setActiveTool("hub");
					}}
					onLogout={async () => {
						await handleLogout();
						setActiveTool("hub");
					}}
					onOpenPasswordManager={() => setActiveTool("pwmg")}
					onOpenAuth={() => setActiveTool("auth")}
					theme={resolvedTheme}
					themeMode={themeMode}
					onThemeChange={handleThemeChange}
					defaultTool={defaultTool}
					onDefaultToolChange={handleDefaultToolChange}
				/>
			);
		}

		if (activeTool === "pwmg") {
			return (
				<PWMGScreen
					onBack={() => {
						loadUserSession();
						setActiveTool("hub");
					}}
					onOpenAuth={() => setActiveTool("auth")}
					onOpenProfile={() => setActiveTool("profile")}
					theme={resolvedTheme}
				/>
			);
		}

		return (
			<HubScreen
				theme={resolvedTheme}
				user={user}
				onOpenTool={setActiveTool}
			/>
		);
	};

	return (
		<View style={{ flex: 1 }}>
			{renderActiveTool()}
			<UpdateInfoModal
				visible={autoUpdateModalVisible}
				updateResult={autoUpdateResult}
				theme={resolvedTheme}
				onClose={() => setAutoUpdateModalVisible(false)}
			/>
		</View>
	);
}

