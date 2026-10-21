import React, { useState } from "react";
import { View, Image, Text } from "react-native";
import { PasswordItem } from "../core/vault-storage";

interface Props {
    item: PasswordItem;
    size?: number;
    fallbackIcon?: React.ReactNode;
}

export function getFaviconUrl(urlStr?: string | null): string | null {
    if (!urlStr) return null;
    try {
        const fullUrl = urlStr.startsWith("http://") || urlStr.startsWith("https://")
            ? urlStr
            : `https://${urlStr}`;
        const match = fullUrl.match(/^(?:https?:\/\/)?([^\/\?#]+)/i);
        const hostname = match ? match[1].replace(/^www\./i, "") : null;
        if (!hostname) return null;
        // unavatar.io service matching the web password manager
        return `https://unavatar.io/${hostname}?fallback=false`;
    } catch {
        return null;
    }
}

export function getBrandColor(title: string): string {
    const colors = [
        "#2563eb", // blue
        "#059669", // emerald
        "#7c3aed", // purple
        "#e11d48", // rose
        "#d97706", // amber
        "#0891b2", // cyan
        "#db2777", // pink
        "#0d9488", // teal
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export function ItemAvatar({ item, size = 40, fallbackIcon }: Props) {
    const rawUrl = item.url || item.metadata?.url || item.metadata?.website;
    const faviconUrl = getFaviconUrl(rawUrl);
    const [imgError, setImgError] = useState(false);

    const borderRadius = Math.round(size * 0.25);

    // 1. If favicon is resolvable from item URL and didn't 404
    if (faviconUrl && !imgError) {
        return (
            <View
                className="justify-center items-center overflow-hidden border border-white/10 bg-white"
                style={{
                    width: size,
                    height: size,
                    borderRadius,
                }}
            >
                <Image
                    source={{ uri: faviconUrl }}
                    style={{ width: size * 0.72, height: size * 0.72 }}
                    resizeMode="contain"
                    onError={() => setImgError(true)}
                />
            </View>
        );
    }

    // 2. If item is not a login or has no title / url, use custom category icon if passed
    if (fallbackIcon && item.category !== "login") {
        return <>{fallbackIcon}</>;
    }

    // 3. Fallback: 2-character initials on brand colored background (matching web password manager)
    const initials = item.title ? item.title.substring(0, 2).toUpperCase() : "?";
    const backgroundColor = getBrandColor(item.title || "Item");

    return (
        <View
            className="justify-center items-center overflow-hidden border border-white/10"
            style={{
                width: size,
                height: size,
                borderRadius,
                backgroundColor,
            }}
        >
            <Text
                className="text-white font-bold tracking-wide"
                style={{ fontSize: Math.max(12, Math.floor(size * 0.38)) }}
            >
                {initials}
            </Text>
        </View>
    );
}
