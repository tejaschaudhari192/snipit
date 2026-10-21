import React from "react";
import {
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Check } from "lucide-react-native";
import { UserAvatar } from "./UserAvatar";

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
    const isLight = theme === "light";

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                className="flex-1 bg-black/70 justify-end"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View
                    className={`rounded-t-3xl p-6 pb-10 border-t ${
                        isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
                    }`}
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`text-[18px] font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                            Profile Photo
                        </Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text className={`text-[18px] font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Preview */}
                    <View className="items-center mb-4">
                        <UserAvatar uri={avatarUrl} name={username || "User"} size={88} />
                    </View>

                    {/* Preset Avatars */}
                    <Text
                        className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                            isLight ? "text-slate-500" : "text-slate-400"
                        }`}
                    >
                        Choose from presets
                    </Text>
                    <View className="flex-row flex-wrap gap-2.5 justify-between">
                        {AVATAR_PRESETS.map((preset, idx) => {
                            const isSelected = avatarUrl === preset;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    className={`p-1 rounded-3xl border-2 relative ${
                                        isSelected ? "border-violet-500" : "border-transparent"
                                    }`}
                                    onPress={() => onChangeAvatarUrl(preset)}
                                >
                                    <UserAvatar uri={preset} size={42} />
                                    {isSelected && (
                                        <View className="absolute -top-0.5 -right-0.5 rounded-full w-4 h-4 justify-center items-center z-10 bg-violet-600">
                                            <Check color="#fff" size={10} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Image URL Input */}
                    <Text
                        className={`text-xs font-semibold uppercase tracking-wider mt-3.5 mb-2 ${
                            isLight ? "text-slate-500" : "text-slate-400"
                        }`}
                    >
                        Or enter image URL
                    </Text>
                    <TextInput
                        className={`rounded-xl border px-3.5 py-2.5 text-sm ${
                            isLight
                                ? "bg-slate-100 border-slate-200 text-slate-900"
                                : "bg-slate-950 border-slate-800 text-white"
                        }`}
                        placeholder="https://example.com/avatar.jpg"
                        placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
                        value={avatarUrl}
                        onChangeText={onChangeAvatarUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {/* Buttons */}
                    <View className="flex-row gap-3 mt-5">
                        {avatarUrl ? (
                            <TouchableOpacity
                                className="py-3 px-4 rounded-xl border border-red-500 items-center justify-center"
                                onPress={() => onSave("")}
                                disabled={saving}
                            >
                                <Text className="text-red-500 text-sm font-semibold">Remove</Text>
                            </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-xl items-center justify-center bg-violet-600 ${
                                saving ? "opacity-60" : ""
                            }`}
                            onPress={() => onSave()}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text className="text-white text-sm font-bold">Save Photo</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
