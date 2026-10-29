import React from "react";
import { View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Camera, Sparkles } from "lucide-react-native";
import { UserAvatar } from "./UserAvatar";
import { Card } from "./ui/card";
import { Text as UIText } from "./ui/text";
import { Icon } from "./ui/icon";
import { UserSession } from "../core/vault-storage";

interface UserProfileCardProps {
    user: UserSession | null;
    isEditingUsername: boolean;
    setIsEditingUsername: (editing: boolean) => void;
    newUsername: string;
    setNewUsername: (name: string) => void;
    savingName: boolean;
    onSaveUsername: () => void;
    onOpenAvatarPicker: () => void;
}

export function UserProfileCard({
    user,
    isEditingUsername,
    setIsEditingUsername,
    newUsername,
    setNewUsername,
    savingName,
    onSaveUsername,
    onOpenAvatarPicker,
}: UserProfileCardProps) {
    return (
        <Card className="p-5 items-center mb-5">
            <TouchableOpacity
                className="relative w-19 h-19 rounded-full mb-1 justify-center items-center"
                onPress={onOpenAvatarPicker}
                activeOpacity={0.8}
            >
                <UserAvatar uri={user?.avatar} name={user?.username || "User"} size={72} />
                <View className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 justify-center items-center bg-primary border-card">
                    <Icon as={Camera} className="text-primary-foreground" size={14} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onOpenAvatarPicker}
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
                            onPress={onSaveUsername}
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
                    <Icon as={Sparkles} className="text-primary" size={12} />
                    <UIText className="text-xs text-primary font-semibold">
                        {user?.token ? "Cloud Verified" : "Guest Account"}
                    </UIText>
                </View>
            </View>
        </Card>
    );
}

