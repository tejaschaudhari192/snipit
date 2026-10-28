import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Platform,
    StatusBar,
    BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, LogOut, Sparkles, Camera } from "lucide-react-native";
import { offlineVault, UserSession } from "../core/vault-storage";
import { UserAvatar } from "../components/UserAvatar";
import { AvatarPickerModal } from "../components/AvatarPickerModal";
import { ThemeSelectorRow, DefaultToolSelectorRow } from "../components/ProfileDropdownSelectors";
import { CloudSyncCard, VaultSecurityCard, AppVersionCard } from "../components/ProfileFeatureCards";
import { useThemeVars } from "../config/theme";
import { checkAppUpdate } from "../core/update-checker";
import { UpdateInfoModal } from "../components/UpdateInfoModal";
import { useCustomAlert } from "../hooks/useCustomAlert";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Text as UIText } from "../components/ui/text";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface Props {
    onBack: () => void;
    onLogout: () => void;
    onOpenPasswordManager: () => void;
    onOpenAuth?: () => void;
    theme?: "dark" | "light";
    themeMode?: "system" | "dark" | "light";
    onThemeChange?: (theme: "system" | "dark" | "light") => void;
}

export function ProfileScreen({
    onBack,
    onLogout,
    onOpenPasswordManager,
    onOpenAuth,
    theme = "dark",
    themeMode = "system",
    onThemeChange,
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

    // Custom Alert Hook
    const { alertConfig, setAlertConfig, showAlert, alertModal } = useCustomAlert(theme);

    useEffect(() => {
        loadProfileData();
        const unsub = offlineVault.onSync(async () => {
            try {
                const status = await offlineVault.getSyncStatus();
                setSyncStatus(status === "local" ? "pending_offline" : status);
            } catch {}
        });
        return () => {
            unsub();
        };
    }, []);

    const handleCheckUpdate = async () => {
        setCheckingUpdate(true);
        setUpdateError(null);
        try {
            const res = await checkAppUpdate();
            setUpdateResult(res);
            setUpdateModalVisible(true);
        } catch (err: any) {
            const errorMsg =
                err?.message || "You are currently offline. Please connect to the internet and try again.";
            const isOffline =
                errorMsg.toLowerCase().includes("offline") ||
                errorMsg.toLowerCase().includes("connect to the internet");

            setUpdateError(errorMsg);
            showAlert(
                isOffline ? "No Internet Connection" : "Update Check Failed",
                errorMsg,
                isOffline ? "warning" : "error"
            );
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

        try {
            const status = await offlineVault.getSyncStatus();
            setSyncStatus(status === "local" ? "pending_offline" : status);
        } catch {
            // default to synced or pending_offline
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
            const status = await offlineVault.getSyncStatus();
            setSyncStatus(status === "local" ? "pending_offline" : status);
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

    const performLogout = () => {
        // Don't call offlineVault.logout() here — the parent's onLogout()
        // handler (App.tsx handleLogout) already does it. Calling it twice
        // on mobile causes a silent failure that prevents the screen from
        // navigating away.
        setUser(null);
        onLogout();
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
        <SafeAreaView
            className="flex-1 bg-background"
            edges={["top", "bottom", "left", "right"]}
        >
            {/* Header */}
            <View
                className="flex-row items-center justify-between px-4 py-3 border-b bg-card border-border"
            >
                <TouchableOpacity
                    onPress={onBack}
                    className="p-2 rounded-full bg-muted"
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    activeOpacity={0.7}
                >
                    <ArrowLeft className="text-foreground" size={20} />
                </TouchableOpacity>
                <Text className="text-[18px] font-bold text-foreground">
                    Account & Profile
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView
                className="flex-1 bg-background"
                contentContainerClassName="p-4 pb-32"
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
            >
                {/* Profile Card */}
                <Card
                    className="p-5 items-center mb-5"
                >
                    <TouchableOpacity
                        className="relative w-19 h-19 rounded-full mb-1 justify-center items-center"
                        onPress={() => {
                            setAvatarInputUrl(user?.avatar || "");
                            setIsAvatarModalOpen(true);
                        }}
                        activeOpacity={0.8}
                    >
                        <UserAvatar uri={user?.avatar} name={user?.username || "User"} size={72} />
                        <View
                            className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 justify-center items-center bg-primary border-card"
                        >
                            <Camera className="text-primary-foreground" size={14} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setAvatarInputUrl(user?.avatar || "");
                            setIsAvatarModalOpen(true);
                        }}
                        className="py-1 px-2 mb-1.5"
                    >
                        <UIText className="text-xs font-semibold text-primary">
                            Change Photo
                        </UIText>
                    </TouchableOpacity>

                    {isEditingUsername ? (
                        <View className="w-4/5 items-center mt-3">
                            <TextInput
                                className="w-full rounded-lg px-3 py-2 text-[15px] border text-center bg-background border-input text-foreground"
                                value={newUsername}
                                onChangeText={setNewUsername}
                                autoCapitalize="none"
                                placeholder="Enter username"
                                placeholderTextColor="#64748b"
                            />
                            <View className="flex-row gap-2.5 mt-2">
                                <TouchableOpacity
                                    className="px-3.5 py-1.5 rounded-md bg-secondary"
                                    onPress={() => setIsEditingUsername(false)}
                                >
                                    <UIText className="text-secondary-foreground text-[13px] font-semibold">Cancel</UIText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="px-3.5 py-1.5 rounded-md bg-primary"
                                    onPress={handleUpdateUsername}
                                    disabled={savingName}
                                >
                                    {savingName ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <UIText className="text-primary-foreground text-[13px] font-semibold">Save</UIText>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View className="items-center mt-3">
                            <TouchableOpacity className="flex-row items-center gap-2" onPress={() => setIsEditingUsername(true)}>
                                <UIText className="text-[18px] font-bold text-foreground">
                                    {user?.username || "Guest User"}
                                </UIText>
                                <UIText className="text-xs font-semibold text-primary">Edit</UIText>
                            </TouchableOpacity>
                            <UIText className="text-[13px] mt-1 text-muted-foreground">
                                {user?.email || "No email connected"}
                            </UIText>
                        </View>
                    )}

                    <View className="mt-3">
                        <View className="flex-row items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl">
                            <Sparkles className="text-primary" size={12} />
                            <UIText className="text-xs text-primary font-semibold">
                                {user?.token ? "Cloud Verified" : "Guest Account"}
                            </UIText>
                        </View>
                    </View>
                </Card>

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

                {/* Appearance Feature */}
                <View className="mb-4">
                    <Text className={`text-[11px] font-bold tracking-wider mb-2 ml-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        APPEARANCE & THEME
                    </Text>
                    <ThemeSelectorRow
                        theme={theme}
                        themeMode={themeMode}
                        isOpen={isThemeDropdownOpen}
                        onToggleOpen={() => {
                            setIsThemeDropdownOpen((prev) => !prev);
                            setIsDefaultToolDropdownOpen(false);
                        }}
                        onSelectMode={(mode) => {
                            if (onThemeChange) onThemeChange(mode);
                            else offlineVault.setTheme(mode);
                            setIsThemeDropdownOpen(false);
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
                <View className="mb-8 mt-2.5 gap-2.5">
                    {!user?.token && onOpenAuth && (
                        <Button
                            variant="default"
                            className="w-full h-12 rounded-2xl flex-row items-center justify-center gap-2"
                            onPress={onOpenAuth}
                        >
                            <User className="text-primary-foreground" size={18} />
                            <UIText className="text-primary-foreground text-[15px] font-bold">Sign In to Cloud Account</UIText>
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        className="w-full h-12 rounded-2xl flex-row items-center justify-center gap-2"
                        onPress={handleConfirmLogout}
                    >
                        <LogOut className="text-destructive-foreground" size={18} />
                        <UIText className="text-destructive-foreground text-[15px] font-bold">
                            {user?.token ? "Log Out" : "Reset Guest Session"}
                        </UIText>
                    </Button>
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
            {alertModal}
        </SafeAreaView>
    );
}
