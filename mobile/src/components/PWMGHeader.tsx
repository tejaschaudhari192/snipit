import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft, Sparkles, User, Lock, Plus, LayoutGrid, List } from "lucide-react-native";
import { ThemeColors } from "../config/theme";

interface PWMGHeaderProps {
	c: ThemeColors;
	title: string;
	subtitle: string;
	userToken?: string;
	activeBottomTab?: "passwords" | "folders" | "notes" | "settings";
	isGridView?: boolean;
	onToggleGridView?: () => void;
	onBack: () => void;
	onOpenProfile?: () => void;
	onOpenGenerator: () => void;
	onLock: () => void;
	onAdd?: () => void;
}

export function PWMGHeader({
	c,
	title,
	subtitle,
	userToken,
	activeBottomTab,
	isGridView,
	onToggleGridView,
	onBack,
	onOpenProfile,
	onOpenGenerator,
	onLock,
	onAdd,
}: PWMGHeaderProps) {
	return (
		<View>
			{/* Top Bar Navigation */}
			<View style={[styles.iosTopNav, { backgroundColor: c.bg }]}>
				<TouchableOpacity
					onPress={onBack}
					style={styles.iosNavBackBtn}
					hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
					activeOpacity={0.7}
				>
					<ArrowLeft color={c.text} size={22} />
					<Text style={[styles.iosNavBackText, { color: c.text }]}>Hub</Text>
				</TouchableOpacity>

				<View style={styles.iosNavRightActions}>
					{/* Grid / List toggle button shown on notes tab */}
					{activeBottomTab === "notes" && onToggleGridView && (
						<TouchableOpacity
							onPress={onToggleGridView}
							style={[styles.iosCircleActionBtn, { backgroundColor: "rgba(142, 142, 147, 0.16)" }]}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							{isGridView ? <List color={c.text} size={19} /> : <LayoutGrid color={c.text} size={19} />}
						</TouchableOpacity>
					)}

					<TouchableOpacity
						onPress={onOpenGenerator}
						style={[styles.iosCircleActionBtn, { backgroundColor: "rgba(142, 142, 147, 0.16)" }]}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Sparkles color={c.text} size={19} />
					</TouchableOpacity>

					{onOpenProfile && (
						<TouchableOpacity
							onPress={onOpenProfile}
							style={[styles.iosCircleActionBtn, { backgroundColor: "rgba(142, 142, 147, 0.16)" }]}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<User color={c.text} size={20} />
						</TouchableOpacity>
					)}

					<TouchableOpacity
						onPress={onLock}
						style={[styles.iosCircleActionBtn, { backgroundColor: "rgba(142, 142, 147, 0.16)" }]}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Lock color={c.textSecondary} size={19} />
					</TouchableOpacity>
				</View>
			</View>

			{/* Large Title & Sync Status Header */}
			<View style={styles.iosLargeTitleContainer}>
				<Text style={[styles.iosLargeTitle, { color: c.text }]}>{title}</Text>
				<TouchableOpacity style={styles.iosSyncStatusBadge} onPress={onOpenProfile} activeOpacity={0.7}>
					<View style={[styles.syncDot, { backgroundColor: userToken ? c.green : c.orange }]} />
					<Text style={[styles.iosSyncSubText, { color: c.textSecondary }]}>{subtitle}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	iosTopNav: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 6,
	},
	iosNavBackBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	iosNavBackText: {
		fontSize: 17,
		fontWeight: "500",
	},
	iosNavRightActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	iosCircleActionBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	iosAddPlusBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
	},
	iosLargeTitleContainer: {
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 10,
	},
	iosLargeTitle: {
		fontSize: 34,
		fontWeight: "800",
		letterSpacing: -0.5,
	},
	iosSyncStatusBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginTop: 4,
	},
	syncDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	iosSyncSubText: {
		fontSize: 13,
		fontWeight: "500",
	},
});
