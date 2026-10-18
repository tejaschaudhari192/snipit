import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Platform,
    StatusBar,
    BackHandler,
} from "react-native";
import { ArrowLeft, User, LogOut, Sparkles, Camera } from "lucide-react-native";
import { offlineVault, UserSession } from "../core/vault-storage";
import { UserAvatar } from "../components/UserAvatar";
import { AvatarPickerModal } from "../components/AvatarPickerModal";
import { ThemeSelectorRow, DefaultToolSelectorRow } from "../components/ProfileDropdownSelectors";
import { CloudSyncCard, VaultSecurityCard, AppVersionCard } from "../components/ProfileFeatureCards";
import { useThemeVars } from "../config/theme";
import { checkAppUpdate } from "../core/update-checker";
import { UpdateInfoModal } from "../components/UpdateInfoModal";
import { CustomAlertModal, CustomAlertConfig } from "../components/CustomAlertModal";

interface Props {
    onBack: () => void;
    onLogout: () => void;
    onOpenPasswordManager: () => void;
    onOpenAuth?: () => void;
    theme?: "dark" | "light";
    themeMode?: "system" | "dark" | "light";
    onThemeChange?: (theme: "system" | "dark" | "light") => void;
    defaultTool?: "hub" | "pwmg";
    onDefaultToolChange?: (tool: "hub" | "pwmg") => void;
}

export function ProfileScreen({
    onBack,
    onLogout,
    onOpenPasswordManager,
    onOpenAuth,
    theme = "dark",
    themeMode = "system",
    onThemeChange,
    defaultTool = "hub",
    onDefaultToolChange,
}: Props) {
    const vars = useThemeVars(theme);
    const isLight = theme === "light";

    const [user, setUser] = useState<UserSession | null>(null);
    const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "pending_offline" | "error">("synced");
    const [isSyncing, setIsSyncing] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [savingName, setSavingName] = useState(false);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [avatarInputUrl, setAvatarInputUrl] = useState("");
    const [savingAvatar, setSavingAvatar] = useState(false);
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
    const [isDefaultToolDropdownOpen, setIsDefaultToolDropdownOpen] = useState(false);

    // Update checker state
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [updateResult, setUpdateResult] = useState<any>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<CustomAlertConfig>({
        visible: false,
        title: "",
    });

    const showAlert = (
        title: string,
        message?: string,
        type: "info" | "success" | "warning" | "error" = "info",
        buttons?: CustomAlertConfig["buttons"],
    ) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            buttons,
            onDismiss: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
        });
    };

    useEffect(() => {
        loadProfileData();
    }, []);

    const handleCheckUpdate = async () => {
        setCheckingUpdate(true);
        setUpdateError(null);
        try {
            const res = await checkAppUpdate();
            setUpdateResult(res);
            setUpdateModalVisible(true);
        } catch (err: any) {
            const errorMsg = err?.message || "Unable to reach server to check for updates.";
            setUpdateError(errorMsg);
            showAlert("Update Check Failed", errorMsg, "error");
        } finally {
            setCheckingUpdate(false);
        }
    };

    // Hardware back button handler
    useEffect(() => {
        const handleHardwareBack = () => {
            if (isAvatarModalOpen) {
                setIsAvatarModalOpen(false);
                return true;
            }
            if (isThemeDropdownOpen) {
                setIsThemeDropdownOpen(false);
                return true;
            }
            if (isDefaultToolDropdownOpen) {
                setIsDefaultToolDropdownOpen(false);
                return true;
            }
            if (isEditingUsername) {
                setIsEditingUsername(false);
                return true;
            }
            if (updateModalVisible) {
                setUpdateModalVisible(false);
                return true;
            }
            onBack();
            return true;
        };

        const subscription = BackHandler.addEventListener("hardwareBackPress", handleHardwareBack);
        return () => subscription.remove();
    }, [isAvatarModalOpen, isThemeDropdownOpen, isDefaultToolDropdownOpen, isEditingUsername, updateModalVisible, onBack]);

    const loadProfileData = async () => {
        const u = await offlineVault.getUser();
        setUser(u);
        if (u?.username) setNewUsername(u.username);
        if (u?.avatar) setAvatarInputUrl(u.avatar);

        const url = await offlineVault.getApiBaseUrl();

        if (u?.token) {
            try {
                const res = await fetch(`${url}/auth/me`, {
                    headers: { Authorization: `Bearer ${u.token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.avatar !== u.avatar || data.username !== u.username) {
                        const updated = {
                            ...u,
                            avatar: data.avatar || u.avatar || "",
                            username: data.username || u.username,
                        };
                        await offlineVault.saveUser(updated);
                        setUser(updated);
                        if (updated.username) setNewUsername(updated.username);
                        if (updated.avatar) setAvatarInputUrl(updated.avatar);
                    }
                }
            } catch (err) {
                console.log("Could not refresh profile from server:", err);
            }
        }
    };

    const handleSyncNow = async () => {
        if (!user?.token) {
            showAlert("Authentication", "Please sign in to sync with your Snipit cloud account.", "warning");
            return;
        }

        setIsSyncing(true);
        setSyncStatus("syncing");

        try {
            await offlineVault.checkCloudVault();
            if (offlineVault.isUnlocked()) {
                await offlineVault.syncFromCloud();
            }
            setSyncStatus("synced");
            showAlert("Sync Complete", "Your vault and credentials are fully synchronized with the cloud.", "success");
        } catch {
            setSyncStatus("pending_offline");
            showAlert("Sync Pending", "Unable to reach the server. Your changes are saved locally.", "warning");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleUpdateUsername = async () => {
        if (!newUsername.trim()) {
            showAlert("Validation", "Username cannot be empty.", "warning");
            return;
        }

        if (!user?.token) {
            const updated: UserSession = user
                ? { ...user, username: newUsername.trim() }
                : { id: "guest", email: "", username: newUsername.trim(), avatar: avatarInputUrl };
            await offlineVault.saveUser(updated);
            setUser(updated);
            setIsEditingUsername(false);
            showAlert("Success", "Username saved locally.", "success");
            return;
        }

        setSavingName(true);
        try {
            const baseUrl = await offlineVault.getApiBaseUrl();
            const res = await fetch(`${baseUrl}/auth/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ username: newUsername.trim() }),
            });

            if (res.ok) {
                const updated = { ...user, username: newUsername.trim() };
                await offlineVault.saveUser(updated);
                setUser(updated);
                setIsEditingUsername(false);
                showAlert("Success", "Username updated successfully.", "success");
            } else {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to update profile.");
            }
        } catch (err: any) {
            showAlert("Error", err.message || "Failed to update username.", "error");
        } finally {
            setSavingName(false);
        }
    };

    const handleSaveAvatar = async (urlToSave?: string) => {
        const targetUrl = (urlToSave !== undefined ? urlToSave : avatarInputUrl).trim();
        setSavingAvatar(true);

        try {
            if (user?.token) {
                const baseUrl = await offlineVault.getApiBaseUrl();
                await fetch(`${baseUrl}/auth/me`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ avatar: targetUrl }),
                });
            }

            const updated: UserSession = user
                ? { ...user, avatar: targetUrl }
                : { id: "guest", email: "", username: newUsername || "Guest User", avatar: targetUrl };

            await offlineVault.saveUser(updated);
            setUser(updated);
            setAvatarInputUrl(targetUrl);
            setIsAvatarModalOpen(false);
            showAlert("Avatar Updated", "Your profile photo has been updated successfully.", "success");
        } catch (err: any) {
            showAlert("Error", err.message || "Failed to update profile photo.", "error");
        } finally {
            setSavingAvatar(false);
        }
    };

    const performLogout = async () => {
        try {
            await offlineVault.logout();
            setUser(null);
            onLogout();
        } catch {
            onLogout();
        }
    };

    const handleConfirmLogout = () => {
        const title = user?.token ? "Sign Out" : "Reset Session";
        const msg = user?.token
            ? "Are you sure you want to sign out? Your credentials remain encrypted on your device."
            : "Reset guest session?";

        showAlert(title, msg, "warning", [
            { text: "Cancel", style: "cancel", onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })) },
            {
                text: user?.token ? "Sign Out" : "Reset",
                style: "destructive",
                onPress: () => {
                    setAlertConfig((prev) => ({ ...prev, visible: false }));
                    performLogout();
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isLight ? "#f8fafc" : "#090d16" }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: vars.border }]}>
                <TouchableOpacity
                    onPress={onBack}
                    style={[styles.iconBtn, { backgroundColor: isLight ? "#e2e8f0" : "#1e293b" }]}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    activeOpacity={0.7}
                >
                    <ArrowLeft color={vars.text} size={20} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: vars.text }]}>Account & Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
            >
                {/* Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: isLight ? "#ffffff" : "#131b2e", borderColor: isLight ? "#e2e8f0" : "#1e293b" }]}>
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        onPress={() => {
                            setAvatarInputUrl(user?.avatar || "");
                            setIsAvatarModalOpen(true);
                        }}
                        activeOpacity={0.8}
                    >
                        <UserAvatar uri={user?.avatar} name={user?.username || "User"} size={72} />
                        <View style={[styles.avatarEditOverlay, { backgroundColor: vars.purple, borderColor: isLight ? "#ffffff" : "#131b2e" }]}>
                            <Camera color="#fff" size={14} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setAvatarInputUrl(user?.avatar || "");
                            setIsAvatarModalOpen(true);
                        }}
                        style={styles.changeAvatarBtn}
                    >
                        <Text style={[styles.changeAvatarText, { color: isLight ? "#6366f1" : "#a78bfa" }]}>Change Photo</Text>
                    </TouchableOpacity>

                    {isEditingUsername ? (
                        <View style={{ width: "100%", alignItems: "center", marginTop: 12 }}>
                            <TextInput
                                style={[styles.editInput, { color: vars.text, borderColor: vars.purple }]}
                                value={newUsername}
                                onChangeText={setNewUsername}
                                autoCapitalize="none"
                                placeholder="Enter username"
                                placeholderTextColor={vars.textMuted}
                            />
                            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                                <TouchableOpacity
                                    style={[styles.smallBtn, { backgroundColor: "#374151" }]}
                                    onPress={() => setIsEditingUsername(false)}
                                >
                                    <Text style={styles.smallBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.smallBtn, { backgroundColor: vars.purple }]}
                                    onPress={handleUpdateUsername}
                                    disabled={savingName}
                                >
                                    {savingName ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.smallBtnText}>Save</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={{ alignItems: "center", marginTop: 12 }}>
                            <TouchableOpacity style={styles.nameRow} onPress={() => setIsEditingUsername(true)}>
                                <Text style={[styles.userName, { color: vars.text }]}>{user?.username || "Guest User"}</Text>
                                <Text style={[styles.editLabel, { color: vars.purple }]}>Edit</Text>
                            </TouchableOpacity>
                            <Text style={[styles.userEmail, { color: vars.textSecondary }]}>{user?.email || "No email connected"}</Text>
                        </View>
                    )}

                    <View style={styles.badgeRow}>
                        <View style={styles.statusBadge}>
                            <Sparkles color="#a78bfa" size={12} />
                            <Text style={styles.statusBadgeText}>
                                {user?.token ? "Cloud Verified" : "Guest Account"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Cloud Sync Feature Card */}
                <CloudSyncCard
                    c={vars}
                    isLight={isLight}
                    userToken={user?.token}
                    syncStatus={syncStatus}
                    isSyncing={isSyncing}
                    onOpenAuth={onOpenAuth}
                    onSyncNow={handleSyncNow}
                />

                {/* Vault & Security Feature Card */}
                <VaultSecurityCard
                    c={vars}
                    isLight={isLight}
                    onOpenPasswordManager={onOpenPasswordManager}
                />

                {/* Appearance Feature */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: vars.textSecondary }]}>APPEARANCE & THEME</Text>
                    <ThemeSelectorRow
                        theme={theme}
                        themeMode={themeMode}
                        isOpen={isThemeDropdownOpen}
                        onToggleOpen={() => setIsThemeDropdownOpen((prev) => !prev)}
                        onSelectMode={(mode) => {
                            if (onThemeChange) onThemeChange(mode);
                            else offlineVault.setTheme(mode);
                            setIsThemeDropdownOpen(false);
                        }}
                    />
                </View>

                {/* Startup Tool */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: vars.textSecondary }]}>DEFAULT STARTUP TOOL</Text>
                    <DefaultToolSelectorRow
                        theme={theme}
                        defaultTool={defaultTool}
                        isOpen={isDefaultToolDropdownOpen}
                        onToggleOpen={() => setIsDefaultToolDropdownOpen((prev) => !prev)}
                        onSelectTool={(tool) => {
                            if (onDefaultToolChange) onDefaultToolChange(tool);
                            else offlineVault.setDefaultTool(tool);
                            setIsDefaultToolDropdownOpen(false);
                        }}
                    />
                </View>

                {/* App Version & Updates Feature Card */}
                <AppVersionCard
                    c={vars}
                    isLight={isLight}
                    checkingUpdate={checkingUpdate}
                    updateError={updateError}
                    onCheckUpdate={handleCheckUpdate}
                />

                {/* Account Logout / Actions */}
                <View style={[styles.section, { marginTop: 10, marginBottom: 30, gap: 10 }]}>
                    {!user?.token && onOpenAuth && (
                        <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: vars.purple }]} onPress={onOpenAuth}>
                            <User color="#fff" size={18} />
                            <Text style={styles.primaryActionBtnText}>Sign In to Cloud Account</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleConfirmLogout}>
                        <LogOut color="#ef4444" size={18} />
                        <Text style={styles.logoutBtnText}>{user?.token ? "Log Out" : "Reset Guest Session"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Avatar Picker Modal */}
            <AvatarPickerModal
                visible={isAvatarModalOpen}
                avatarUrl={avatarInputUrl}
                username={user?.username || "User"}
                saving={savingAvatar}
                theme={theme}
                onChangeAvatarUrl={setAvatarInputUrl}
                onSave={handleSaveAvatar}
                onClose={() => setIsAvatarModalOpen(false)}
            />

            {/* Update Info Modal */}
            <UpdateInfoModal
                visible={updateModalVisible}
                updateResult={updateResult}
                theme={theme}
                onClose={() => setUpdateModalVisible(false)}
            />

            {/* Custom Theme-matched Alert Modal */}
            <CustomAlertModal config={alertConfig} theme={theme} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    iconBtn: {
        padding: 8,
        borderRadius: 20,
    },
    content: {
        padding: 16,
        paddingBottom: 135,
    },
    profileCard: {
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        marginBottom: 20,
    },
    avatarWrapper: {
        position: "relative",
        width: 76,
        height: 76,
        borderRadius: 38,
        marginBottom: 4,
    },
    avatarEditOverlay: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    changeAvatarBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 6,
    },
    changeAvatarText: {
        fontSize: 12,
        fontWeight: "600",
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    userName: {
        fontSize: 18,
        fontWeight: "700",
    },
    editLabel: {
        fontSize: 12,
        fontWeight: "600",
    },
    userEmail: {
        fontSize: 13,
        marginTop: 4,
    },
    editInput: {
        width: "80%",
        backgroundColor: "rgba(0,0,0,0.2)",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 15,
        borderWidth: 1,
        textAlign: "center",
    },
    smallBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 6,
    },
    smallBtnText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    badgeRow: {
        marginTop: 12,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(167, 139, 250, 0.12)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        color: "#a78bfa",
        fontWeight: "600",
    },
    section: {
        marginBottom: 16,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
    },
    primaryActionBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 14,
        paddingVertical: 14,
    },
    primaryActionBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    logoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderRadius: 14,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.2)",
    },
    logoutBtnText: {
        color: "#ef4444",
        fontSize: 15,
        fontWeight: "700",
    },
});
