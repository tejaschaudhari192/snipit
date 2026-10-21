import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Copy, Check, ExternalLink } from "lucide-react-native";

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
    const isLight = theme === "light";

    if (!value && !rightAction) return null;

    return (
        <View
            className={`flex-row items-center justify-between px-4 py-3.5 ${
                isDivider ? isLight ? "border-t border-slate-200" : "border-t border-slate-800" : ""
            }`}
        >
            <View className="flex-1 mr-2">
                <Text
                    className={`text-xs font-medium mb-1 ${
                        isLight ? "text-slate-500" : "text-slate-400"
                    }`}
                >
                    {label}
                </Text>
                <Text
                    className={`text-[16px] font-normal ${
                        isUrl
                            ? "text-blue-500 underline"
                            : isLight
                            ? "text-slate-900"
                            : "text-white"
                    } ${isMasked ? "tracking-widest text-[18px]" : ""}`}
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
                        <Check color="#22c55e" size={20} />
                    ) : isUrl ? (
                        <ExternalLink color="#3b82f6" size={20} />
                    ) : (
                        <Copy color="#3b82f6" size={20} />
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
    const isLight = theme === "light";
    return (
        <View
            className={`rounded-2xl overflow-hidden mb-3.5 border ${
                isLight
                    ? "bg-white border-slate-200"
                    : "bg-slate-900 border-slate-800"
            }`}
            style={marginTop ? { marginTop } : undefined}
        >
            {children}
        </View>
    );
}
