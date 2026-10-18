import React from "react";
import { View, Image, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
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
                    style={[
                        styles.container,
                        {
                            width: size,
                            height: size,
                            borderRadius,
                            backgroundColor: "rgba(124, 58, 237, 0.15)",
                        },
                        style,
                    ]}
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
                style={[
                    styles.container,
                    {
                        width: size,
                        height: size,
                        borderRadius,
                    },
                    style,
                ]}
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
            style={[
                styles.container,
                styles.fallbackCircle,
                {
                    width: size,
                    height: size,
                    borderRadius,
                },
                style,
            ]}
        >
            <Text style={[styles.fallbackText, { fontSize: Math.max(12, Math.floor(size * 0.42)) }]}>
                {initial}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    fallbackCircle: {
        backgroundColor: "#6366f1",
    },
    fallbackText: {
        color: "#ffffff",
        fontWeight: "bold",
    },
});
