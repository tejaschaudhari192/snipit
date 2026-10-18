import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	SafeAreaView,
	ScrollView,
	Image,
	Platform,
	StatusBar,
	useColorScheme,
	BackHandler,
} from "react-native";
import {
	Code2,
	Shield,
	Lock,
	CheckCircle,
	Sparkles,
	User,
	LogOut,
	ChevronRight,
	Cloud,
	Sun,
	Moon,
} from "lucide-react-native";
import { PWMGScreen } from "./src/screens/PWMGScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { offlineVault, UserSession } from "./src/core/vault-storage";
import { UserAvatar } from "./src/components/UserAvatar";

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

	useEffect(() => {
		loadUserSession();
		loadTheme();
		loadDefaultTool();
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

	if (activeTool === "auth") {
		return (
			<AuthScreen
				onBack={() => setActiveTool("hub")}
				onAuthSuccess={() => {
					loadUserSession();
					setActiveTool("hub");
				}}
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

	const isLight = resolvedTheme === "light";

	return (
		<SafeAreaView style={[styles.container, isLight && styles.lightContainer]}>
			<ExpoStatusBar style={isLight ? "dark" : "light"} />

			{/* App Header */}
			<View style={[styles.header, isLight && styles.lightHeader]}>
				<View style={styles.brandRow}>
					<Image
						source={require("./assets/snipit-logo.png")}
						style={styles.logoImage}
						resizeMode="contain"
					/>
					<Text style={[styles.brandText, isLight && styles.lightBrandText]}>Snipit</Text>
				</View>

				<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
					{/* Short & Sweet Top Sync Status */}
					<TouchableOpacity
						style={[styles.syncPill, isLight && styles.lightSyncPill]}
						onPress={() => (user ? setActiveTool("profile") : setActiveTool("auth"))}
					>
						<View style={[styles.syncDot, user?.token ? styles.syncDotOnline : styles.syncDotLocal]} />
						<Cloud color={user?.token ? "#3b82f6" : "#eab308"} size={12} />
						<Text style={[styles.syncPillText, isLight && styles.lightSyncPillText]}>
							{user?.token ? "Synced" : "Local"}
						</Text>
					</TouchableOpacity>

					{/* User Profile Button / Sign In Button */}
					{user ? (
						<TouchableOpacity
							style={[styles.userBadge, isLight && styles.lightUserBadge]}
							onPress={() => setActiveTool("profile")}
						>
							<UserAvatar
								uri={user.avatar}
								name={user.username || "User"}
								size={26}
							/>
							<Text style={[styles.userBadgeText, isLight && styles.lightUserBadgeText]}>
								{user.username}
							</Text>
							<ChevronRight color={isLight ? "#6366f1" : "#a78bfa"} size={14} style={{ marginLeft: 2 }} />
						</TouchableOpacity>
					) : (
						<TouchableOpacity
							style={styles.signInBtn}
							onPress={() => setActiveTool("auth")}
						>
							<User color="#fff" size={14} />
							<Text style={styles.signInBtnText}>Sign In</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				{/* Status banner */}


				{/* Hero Introduction */}
				<View style={styles.heroSection}>
					<Text style={[styles.heroTitle, isLight && styles.lightHeroTitle]}>Select Tool</Text>
					<Text style={[styles.heroSubtitle, isLight && styles.lightHeroSubtitle]}>
						Direct access to Snipit's privacy-focused tools. Fast local performance with cloud account sync.
					</Text>
				</View>

				{/* Primary Tool Cards */}
				<View style={styles.cardList}>
					{/* PWMG (Password Manager) Card */}
					<TouchableOpacity
						style={[styles.card, styles.highlightCard, isLight && styles.lightHighlightCard]}
						activeOpacity={0.8}
						onPress={() => setActiveTool("pwmg")}
					>
						<View style={[styles.cardIconBox, { backgroundColor: isLight ? "rgba(124, 58, 237, 0.12)" : "rgba(139, 92, 246, 0.2)" }]}>
							<Shield color={isLight ? "#7c3aed" : "#a78bfa"} size={28} />
						</View>
						<View style={styles.cardTextBox}>
							<View style={styles.titleRow}>
								<Text style={[styles.cardTitle, isLight && styles.lightCardTitle]}>Password Manager</Text>
								<View style={[styles.tagBadge, { backgroundColor: isLight ? "rgba(124, 58, 237, 0.15)" : "rgba(139, 92, 246, 0.2)" }]}>
									<Text style={[styles.tagText, { color: isLight ? "#7c3aed" : "#a78bfa" }]}>ZERO-KNOWLEDGE</Text>
								</View>
							</View>
							<Text style={[styles.cardDesc, isLight && styles.lightCardDesc]}>
								Zero-knowledge encrypted vault with 12-word recovery key, generator & master password.
							</Text>
						</View>
						<ChevronRight color={isLight ? "#7c3aed" : "#a78bfa"} size={20} />
					</TouchableOpacity>
				</View>

				{/* Security note footer */}
				<View style={styles.footerNote}>
					<Lock color={isLight ? "#94a3b8" : "#64748b"} size={14} />
					<Text style={[styles.footerText, isLight && styles.lightFooterText]}>
						End-to-end encrypted with XSalsa20-Poly1305. Non-custodial security.
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#090d16",
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#1e293b",
	},
	brandRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	logoImage: {
		width: 32,
		height: 32,
		borderRadius: 8,
	},
	logoBadge: {
		width: 32,
		height: 32,
		borderRadius: 8,
		backgroundColor: "rgba(139, 92, 246, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	brandText: {
		color: "#fff",
		fontSize: 20,
		fontWeight: "900",
		letterSpacing: -0.5,
	},
	syncPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
		backgroundColor: "#131b2e",
		paddingHorizontal: 9,
		paddingVertical: 5,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: "#1e293b",
	},
	syncDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	syncDotOnline: {
		backgroundColor: "#22c55e",
	},
	syncDotLocal: {
		backgroundColor: "#eab308",
	},
	syncPillText: {
		color: "#94a3b8",
		fontSize: 11,
		fontWeight: "700",
	},
	userBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: "rgba(139, 92, 246, 0.15)",
		paddingLeft: 4,
		paddingRight: 10,
		paddingVertical: 4,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "rgba(139, 92, 246, 0.3)",
	},
	avatarMini: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#7c3aed",
		justifyContent: "center",
		alignItems: "center",
	},
	avatarMiniText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "800",
	},
	userBadgeText: {
		color: "#a78bfa",
		fontSize: 13,
		fontWeight: "700",
	},
	signInBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: "#7c3aed",
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderRadius: 20,
	},
	signInBtnText: {
		color: "#fff",
		fontSize: 13,
		fontWeight: "700",
	},
	content: {
		padding: 20,
	},
	statusBanner: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 16,
	},
	statusBannerOnline: {
		backgroundColor: "rgba(59, 130, 246, 0.1)",
		borderColor: "rgba(59, 130, 246, 0.3)",
	},
	statusBannerLocal: {
		backgroundColor: "rgba(234, 179, 8, 0.1)",
		borderColor: "rgba(234, 179, 8, 0.3)",
	},
	statusText: {
		color: "#94a3b8",
		fontSize: 12,
		fontWeight: "600",
		flex: 1,
	},
	heroSection: {
		marginBottom: 20,
	},
	heroTitle: {
		color: "#f8fafc",
		fontSize: 26,
		fontWeight: "800",
		letterSpacing: -0.5,
		marginBottom: 6,
	},
	heroSubtitle: {
		color: "#94a3b8",
		fontSize: 14,
		lineHeight: 20,
	},
	cardList: {
		gap: 16,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#131b2e",
		borderRadius: 16,
		padding: 18,
		borderWidth: 1,
		borderColor: "#1e293b",
	},
	highlightCard: {
		borderColor: "rgba(139, 92, 246, 0.4)",
		backgroundColor: "#161b33",
	},
	cardIconBox: {
		width: 52,
		height: 52,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	cardTextBox: {
		flex: 1,
		marginRight: 8,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	cardTitle: {
		color: "#f8fafc",
		fontSize: 17,
		fontWeight: "700",
	},
	tagBadge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 4,
	},
	tagText: {
		fontSize: 9,
		fontWeight: "800",
	},
	cardDesc: {
		color: "#94a3b8",
		fontSize: 12,
		lineHeight: 16,
	},
	footerNote: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		marginTop: 40,
		paddingHorizontal: 16,
	},
	footerText: {
		color: "#64748b",
		fontSize: 12,
		textAlign: "center",
	},
	themeBtn: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#131b2e",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#1e293b",
	},
	avatarMiniImg: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#8b5cf6",
	},

	// ─── LIGHT MODE OVERRIDES ──────────────────────────────────────────────────
	lightContainer: {
		backgroundColor: "#f8fafc",
	},
	lightHeader: {
		borderBottomColor: "#e2e8f0",
		backgroundColor: "#ffffff",
	},
	lightBrandText: {
		color: "#0f172a",
	},
	lightThemeBtn: {
		backgroundColor: "#f1f5f9",
		borderColor: "#e2e8f0",
	},
	lightSyncPill: {
		backgroundColor: "#f1f5f9",
		borderColor: "#e2e8f0",
	},
	lightSyncPillText: {
		color: "#475569",
	},
	lightUserBadge: {
		backgroundColor: "rgba(99, 102, 241, 0.08)",
		borderColor: "rgba(99, 102, 241, 0.2)",
	},
	lightUserBadgeText: {
		color: "#4f46e5",
	},
	lightStatusBannerOnline: {
		backgroundColor: "rgba(59, 130, 246, 0.08)",
		borderColor: "rgba(59, 130, 246, 0.2)",
	},
	lightStatusBannerLocal: {
		backgroundColor: "rgba(234, 179, 8, 0.08)",
		borderColor: "rgba(234, 179, 8, 0.2)",
	},
	lightStatusText: {
		color: "#475569",
	},
	lightHeroTitle: {
		color: "#0f172a",
	},
	lightHeroSubtitle: {
		color: "#64748b",
	},
	lightCard: {
		backgroundColor: "#ffffff",
		borderColor: "#e2e8f0",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	lightHighlightCard: {
		backgroundColor: "#faf5ff",
		borderColor: "rgba(124, 58, 237, 0.25)",
	},
	lightCardTitle: {
		color: "#0f172a",
	},
	lightCardDesc: {
		color: "#64748b",
	},
	lightFooterText: {
		color: "#94a3b8",
	},
});
