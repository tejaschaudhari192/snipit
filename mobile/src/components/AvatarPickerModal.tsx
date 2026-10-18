import React from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
} from "react-native";
import { Check } from "lucide-react-native";
import { UserAvatar } from "./UserAvatar";
import { useThemeVars } from "../config/theme";

const AVATAR_PRESETS = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Pepper",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Shadow",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha",
    "https://api.dicebear.com/7.x/identicon/svg?seed=SnipitCore",
    "https://api.dicebear.com/7.x/identicon/svg?seed=QuantumVault",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Zoe",
    "https://api.dicebear.com/7.x/lorelei/svg?seed=Leo",
];

interface AvatarPickerModalProps {
    visible: boolean;
    avatarUrl: string;
    username: string;
    saving: boolean;
    theme?: "dark" | "light";
    onChangeAvatarUrl: (url: string) => void;
    onSave: (url?: string) => void;
    onClose: () => void;
}

export function AvatarPickerModal({
    visible,
    avatarUrl,
    username,
    saving,
    theme = "dark",
    onChangeAvatarUrl,
    onSave,
    onClose,
}: AvatarPickerModalProps) {
    const vars = useThemeVars(theme);
    const isLight = theme === "light";

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: isLight ? "#ffffff" : "#131b2e" }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: vars.text }]}>Profile Photo</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={{ color: vars.textSecondary, fontSize: 18, fontWeight: "700" }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Preview */}
                    <View style={styles.previewContainer}>
                        <UserAvatar uri={avatarUrl} name={username || "User"} size={88} />
                    </View>

                    {/* Preset Avatars */}
                    <Text style={[styles.fieldLabel, { color: vars.textSecondary }]}>Choose from presets</Text>
                    <View style={styles.presetsGrid}>
                        {AVATAR_PRESETS.map((preset, idx) => {
                            const isSelected = avatarUrl === preset;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.presetItem,
                                        { borderColor: isSelected ? vars.purple : "transparent" },
                                    ]}
                                    onPress={() => onChangeAvatarUrl(preset)}
                                >
                                    <UserAvatar uri={preset} size={42} />
                                    {isSelected && (
                                        <View style={[styles.presetCheck, { backgroundColor: vars.purple }]}>
                                            <Check color="#fff" size={10} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Image URL Input */}
                    <Text style={[styles.fieldLabel, { marginTop: 14, color: vars.textSecondary }]}>Or enter image URL</Text>
                    <TextInput
                        style={[
                            styles.avatarUrlInput,
                            {
                                backgroundColor: isLight ? "#f1f5f9" : "#090d16",
                                color: vars.text,
                                borderColor: vars.border,
                            },
                        ]}
                        placeholder="https://example.com/avatar.jpg"
                        placeholderTextColor={vars.textMuted}
                        value={avatarUrl}
                        onChangeText={onChangeAvatarUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {/* Buttons */}
                    <View style={styles.modalButtons}>
                        {avatarUrl ? (
                            <TouchableOpacity
                                style={styles.removePhotoBtn}
                                onPress={() => onSave("")}
                                disabled={saving}
                            >
                                <Text style={styles.removePhotoText}>Remove</Text>
                            </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                            style={[
                                styles.savePhotoBtn,
                                { backgroundColor: vars.purple },
                                saving && { opacity: 0.6 },
                            ]}
                            onPress={() => onSave()}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.savePhotoText}>Save Photo</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "flex-end",
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    previewContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    presetsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "space-between",
    },
    presetItem: {
        padding: 4,
        borderRadius: 24,
        borderWidth: 2,
        position: "relative",
    },
    presetCheck: {
        position: "absolute",
        top: -2,
        right: -2,
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    avatarUrlInput: {
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },
    savePhotoBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    savePhotoText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "700",
    },
    removePhotoBtn: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ef4444",
        alignItems: "center",
        justifyContent: "center",
    },
    removePhotoText: {
        color: "#ef4444",
        fontSize: 14,
        fontWeight: "600",
    },
});
