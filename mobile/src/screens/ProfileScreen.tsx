import React, { useEffect } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, LogOut } from "lucide-react-native";
import { offlineVault } from "../core/vault-storage";
import { AvatarPickerModal } from "../components/AvatarPickerModal";
import { ThemeSelectorRow } from "../components/ProfileDropdownSelectors";
import { CloudSyncCard, AppVersionCard } from "../components/ProfileFeatureCards";
import { useThemeVars } from "../config/theme";
import { UpdateInfoModal } from "../components/UpdateInfoModal";
import { useCustomAlert } from "../hooks/useCustomAlert";
import { Button } from "../components/ui/button";
import { Text as UIText } from "../components/ui/text";
import { Icon } from "../components/ui/icon";
import { useProfile } from "../hooks/useProfile";
import { UserProfileCard } from "../components/UserProfileCard";

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
    onOpenAuth,
    theme = "dark",
    themeMode = "system",
    onThemeChange,
}: Props) {
    const vars = useThemeVars(theme);
    const isLight = theme === "light";

    const { alertConfig, setAlertConfig, showAlert, alertModal } = useCustomAlert(theme);

    const {
        user,
        setUser,
        syncStatus,
        isSyncing,
        isEditingUsername,
        setIsEditingUsername,
        newUsername,
        setNewUsername,
        savingName,
        isAvatarModalOpen,
        setIsAvatarModalOpen,
        avatarInputUrl,
        setAvatarInputUrl,
        savingAvatar,
        isThemeDropdownOpen,
        setIsThemeDropdownOpen,
        setIsDefaultToolDropdownOpen,
        checkingUpdate,
        updateModalVisible,
        setUpdateModalVisible,
        updateResult,
        updateError,
        handleCheckUpdate,
        handleSyncNow,
        handleUpdateUsername,
        handleSaveAvatar,
    } = useProfile({ showAlert });

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
    }, [isAvatarModalOpen, isThemeDropdownOpen, isEditingUsername, updateModalVisible, onBack]);

    const performLogout = () => {
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
            <View className="flex-row items-center justify-between px-4 py-3 border-b bg-card border-border">
                <TouchableOpacity
                    onPress={onBack}
                    className="p-2 rounded-full bg-muted"
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    activeOpacity={0.7}
                >
                    <Icon as={ArrowLeft} className="text-foreground" size={20} />
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
                {/* User Profile Card */}
                <UserProfileCard
                    user={user}
                    isEditingUsername={isEditingUsername}
                    setIsEditingUsername={setIsEditingUsername}
                    newUsername={newUsername}
                    setNewUsername={setNewUsername}
                    savingName={savingName}
                    onSaveUsername={handleUpdateUsername}
                    onOpenAvatarPicker={() => {
                        setAvatarInputUrl(user?.avatar || "");
                        setIsAvatarModalOpen(true);
                    }}
                />

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
                            <Icon as={User} className="text-primary-foreground" size={18} />
                            <UIText className="text-primary-foreground text-[15px] font-bold">Sign In to Cloud Account</UIText>
                        </Button>
                    )}

                    <Button
                        variant="destructive"
                        className="w-full h-12 rounded-2xl flex-row items-center justify-center gap-2"
                        onPress={handleConfirmLogout}
                    >
                        <Icon as={LogOut} className="text-destructive-foreground" size={18} />
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
