import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Copy, Check, ExternalLink } from "lucide-react-native";
import { Card } from "./ui/card";
import { Text } from "./ui/text";
import { Icon } from "./ui/icon";

interface DetailRowProps {
    label: string;
    value?: string;
    theme?: "dark" | "light";
    isDivider?: boolean;
    isMasked?: boolean;
    isUrl?: boolean;
    rightAction?: React.ReactNode;
    onCopy?: () => void;
    isCopied?: boolean;
}

export function DetailGroupedRow({
    label,
    value,
    isDivider = false,
    isMasked = false,
    isUrl = false,
    rightAction,
    onCopy,
    isCopied = false,
}: DetailRowProps) {
    if (!value && !rightAction) return null;

    return (
        <View
            className={`flex-row items-center justify-between px-4 py-3.5 ${
                isDivider ? "border-t border-border" : ""
            }`}
        >
            <View className="flex-1 mr-2">
                <Text className="text-xs font-medium text-muted-foreground mb-1">
                    {label}
                </Text>
                <Text
                    className={`text-base font-medium ${
                        isUrl ? "text-foreground underline" : "text-foreground"
                    } ${isMasked ? "tracking-widest text-lg" : ""}`}
                    numberOfLines={isUrl ? 1 : undefined}
                    selectable={!isMasked}
                >
                    {value}
                </Text>
            </View>

            {rightAction ? (
                rightAction
            ) : onCopy ? (
                <TouchableOpacity onPress={onCopy} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    {isCopied ? (
                        <Icon as={Check} className="text-foreground" size={18} />
                    ) : isUrl ? (
                        <Icon as={ExternalLink} className="text-muted-foreground" size={18} />
                    ) : (
                        <Icon as={Copy} className="text-muted-foreground" size={18} />
                    )}
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

export function DetailGroupedCard({
    children,
    marginTop,
}: {
    children: React.ReactNode;
    theme?: "dark" | "light";
    marginTop?: number;
}) {
    return (
        <Card
            className="border-border bg-card overflow-hidden mb-3.5"
            style={marginTop ? { marginTop } : undefined}
        >
            {children}
        </Card>
    );
}
