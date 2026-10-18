import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Copy, Check, ExternalLink } from "lucide-react-native";
import { useThemeVars } from "../config/theme";

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
    theme = "dark",
    isDivider = false,
    isMasked = false,
    isUrl = false,
    rightAction,
    onCopy,
    isCopied = false,
}: DetailRowProps) {
    const vars = useThemeVars(theme);

    if (!value && !rightAction) return null;

    return (
        <View style={[styles.row, isDivider && { borderTopWidth: 0.5, borderTopColor: vars.border }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.miniLabel, { color: vars.textSecondary }]}>{label}</Text>
                <Text
                    style={[
                        styles.valueText,
                        { color: isUrl ? vars.blue : vars.text },
                        isMasked && styles.passwordMasked,
                    ]}
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
                        <Check color={vars.green} size={20} />
                    ) : isUrl ? (
                        <ExternalLink color={vars.blue} size={20} />
                    ) : (
                        <Copy color={vars.blue} size={20} />
                    )}
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

export function DetailGroupedCard({
    children,
    theme = "dark",
    marginTop,
}: {
    children: React.ReactNode;
    theme?: "dark" | "light";
    marginTop?: number;
}) {
    const vars = useThemeVars(theme);
    return (
        <View style={[styles.card, { backgroundColor: vars.bgTertiary, marginTop: marginTop || 0 }]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 14,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 13,
    },
    miniLabel: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 3,
    },
    valueText: {
        fontSize: 16,
        fontWeight: "400",
    },
    passwordMasked: {
        letterSpacing: 2,
        fontSize: 18,
    },
});
