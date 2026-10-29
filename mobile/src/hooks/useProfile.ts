import { useState, useEffect, useCallback } from "react";
import { offlineVault, UserSession } from "../core/vault-storage";
import { checkAppUpdate } from "../core/update-checker";
import { profileService } from "../services/profile-service";

interface UseProfileProps {
    showAlert: (title: string, message: string, type?: "success" | "error" | "warning" | "info") => void;
}

export function useProfile({ showAlert }: UseProfileProps) {
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

    const loadProfileData = useCallback(async () => {
        const u = await offlineVault.getUser();
        setUser(u);
        if (u?.username) setNewUsername(u.username);
        if (u?.avatar) setAvatarInputUrl(u.avatar);

        if (u?.token) {
            try {
                const data = await profileService.fetchServerProfile(u.token);
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
            } catch (err) {
                console.log("Could not refresh profile from server:", err);
            }
        }

        try {
            const status = await offlineVault.getSyncStatus();
            setSyncStatus(status === "local" ? "pending_offline" : status);
        } catch {
            // default status
        }
    }, []);

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
    }, [loadProfileData]);

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

    const handleSyncNow = async () => {
        if (!user?.token) {
            showAlert("Authentication", "Please sign in to sync with your Snipit cloud account.", "warning");
            return;
        }

        setIsSyncing(true);
        setSyncStatus("syncing");

        try {
            const status = await profileService.syncCloudVault();
            setSyncStatus(status);
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
            await profileService.updateUsername(user.token, newUsername);
            const updated = { ...user, username: newUsername.trim() };
            await offlineVault.saveUser(updated);
            setUser(updated);
            setIsEditingUsername(false);
            showAlert("Success", "Username updated successfully.", "success");
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
                await profileService.updateAvatar(user.token, targetUrl);
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

    return {
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
        isDefaultToolDropdownOpen,
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
    };
}

