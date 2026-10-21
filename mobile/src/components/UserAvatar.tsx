import React from "react";
import { View, Image, Text, ViewStyle, StyleProp } from "react-native";
import { SvgUri } from "react-native-svg";

interface UserAvatarProps {
    uri?: string | null;
    name?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
}

export function UserAvatar({ uri, name = "User", size = 40, style }: UserAvatarProps) {
    const isSvg = uri && (uri.endsWith(".svg") || uri.includes("/svg?") || uri.includes("api.dicebear.com"));
    const initial = (name || "U").trim().charAt(0).toUpperCase() || "U";
    const borderRadius = size / 2;

    if (uri && uri.trim().length > 0) {
        if (isSvg) {
            return (
                <View
                    className="overflow-hidden justify-center items-center bg-violet-600/15"
                    style={[{ width: size, height: size, borderRadius }, style]}
                >
                    <SvgUri
                        uri={uri.trim()}
                        width={size}
                        height={size}
                    />
                </View>
            );
        }

        return (
            <View
                className="overflow-hidden justify-center items-center"
                style={[{ width: size, height: size, borderRadius }, style]}
            >
                <Image
                    source={{ uri: uri.trim() }}
                    style={{ width: size, height: size, borderRadius }}
                    resizeMode="cover"
                />
            </View>
        );
    }

    return (
        <View
            className="overflow-hidden justify-center items-center bg-indigo-500"
            style={[{ width: size, height: size, borderRadius }, style]}
        >
            <Text
                className="text-white font-bold"
                style={{ fontSize: Math.max(12, Math.floor(size * 0.42)) }}
            >
                {initial}
            </Text>
        </View>
    );
}
