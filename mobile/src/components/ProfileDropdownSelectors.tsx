import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Sun, Moon, Smartphone, Shield, LayoutGrid, ChevronDown, Check } from "lucide-react-native";
import { useThemeVars } from "../config/theme";

interface ThemeSelectorProps {
    theme: "dark" | "light";
    themeMode: "system" | "dark" | "light";
    isOpen: boolean;
    onToggleOpen: () => void;
    onSelectMode: (mode: "system" | "dark" | "light") => void;
}

export function ThemeSelectorRow({
    theme,
    themeMode,
    isOpen,
    onToggleOpen,
    onSelectMode,
}: ThemeSelectorProps) {
    const vars = useThemeVars(theme);
    const isLight = theme === "light";

    const getIcon = () => {
        if (themeMode === "light") return <Sun color="#f59e0b" size={20} />;
        if (themeMode === "dark") return <Moon color="#a78bfa" size={20} />;
        return <Smartphone color="#3b82f6" size={20} />;
    };

    const getSubtitle = () => {
        if (themeMode === "system") return `System default (${theme === "light" ? "Light" : "Dark"})`;
        if (themeMode === "dark") return "Sleek Dark Theme";
        return "Clean Light Theme";
    };

    return (
        <View style={[styles.card, { backgroundColor: isLight ? "#ffffff" : "#131b2e", borderColor: isLight ? "#e2e8f0" : "#1e293b" }]}>
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.8} onPress={onToggleOpen}>
                <View
                    style={[
                        styles.iconBox,
                        {
                            backgroundColor:
                                themeMode === "light"
                                    ? "rgba(245, 158, 11, 0.15)"
                                    : themeMode === "dark"
                                      ? "rgba(139, 92, 246, 0.15)"
                                      : "rgba(59, 130, 246, 0.15)",
                        },
                    ]}
                >
                    {getIcon()}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.title, { color: vars.text }]}>Theme</Text>
                    <Text style={[styles.subtitle, { color: vars.textSecondary }]}>{getSubtitle()}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: isLight ? "rgba(99, 102, 241, 0.1)" : "rgba(139, 92, 246, 0.12)" }]}>
                    <Text style={[styles.badgeText, { color: isLight ? "#6366f1" : "#a78bfa" }]}>
                        {themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light"}
                    </Text>
                    <ChevronDown
                        color={isLight ? "#6366f1" : "#a78bfa"}
                        size={16}
                        style={{ marginLeft: 4, transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
                    />
                </View>
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.dropdownMenu, { borderTopColor: isLight ? "#e2e8f0" : "#1e293b" }]}>
                    {[
                        { mode: "system" as const, title: "System", sub: "Match device appearance setting", icon: <Smartphone color="#3b82f6" size={16} />, bg: "rgba(59, 130, 246, 0.15)" },
                        { mode: "dark" as const, title: "Dark", sub: "High-contrast futuristic dark mode", icon: <Moon color="#a78bfa" size={16} />, bg: "rgba(139, 92, 246, 0.15)" },
                        { mode: "light" as const, title: "Light", sub: "Clean and crisp daytime palette", icon: <Sun color="#f59e0b" size={16} />, bg: "rgba(245, 158, 11, 0.15)" },
                    ].map((opt) => (
                        <TouchableOpacity
                            key={opt.mode}
                            style={[
                                styles.optionRow,
                                themeMode === opt.mode && { backgroundColor: isLight ? "rgba(99, 102, 241, 0.08)" : "rgba(139, 92, 246, 0.12)" },
                            ]}
                            onPress={() => onSelectMode(opt.mode)}
                        >
                            <View style={styles.optionLeft}>
                                <View style={[styles.optionIconBox, { backgroundColor: opt.bg }]}>
                                    {opt.icon}
                                </View>
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={[styles.optionTitle, { color: vars.text }]}>{opt.title}</Text>
                                    <Text style={[styles.optionSub, { color: vars.textSecondary }]}>{opt.sub}</Text>
                                </View>
                            </View>
                            {themeMode === opt.mode && <Check color={isLight ? "#6366f1" : "#a78bfa"} size={18} />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

interface DefaultToolSelectorProps {
    theme: "dark" | "light";
    defaultTool: "hub" | "pwmg";
    isOpen: boolean;
    onToggleOpen: () => void;
    onSelectTool: (tool: "hub" | "pwmg") => void;
}

export function DefaultToolSelectorRow({
    theme,
    defaultTool,
    isOpen,
    onToggleOpen,
    onSelectTool,
}: DefaultToolSelectorProps) {
    const vars = useThemeVars(theme);
    const isLight = theme === "light";

    return (
        <View style={[styles.card, { backgroundColor: isLight ? "#ffffff" : "#131b2e", borderColor: isLight ? "#e2e8f0" : "#1e293b" }]}>
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.8} onPress={onToggleOpen}>
                <View
                    style={[
                        styles.iconBox,
                        {
                            backgroundColor:
                                defaultTool === "pwmg"
                                    ? "rgba(139, 92, 246, 0.15)"
                                    : "rgba(59, 130, 246, 0.15)",
                        },
                    ]}
                >
                    {defaultTool === "pwmg" ? <Shield color="#8b5cf6" size={20} /> : <LayoutGrid color="#3b82f6" size={20} />}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.title, { color: vars.text }]}>Open on Startup</Text>
                    <Text style={[styles.subtitle, { color: vars.textSecondary }]}>
                        {defaultTool === "pwmg"
                            ? "Directly opens Password Manager on start"
                            : "Directly opens Tool Hub on start"}
                    </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: isLight ? "rgba(99, 102, 241, 0.1)" : "rgba(139, 92, 246, 0.12)" }]}>
                    <Text style={[styles.badgeText, { color: isLight ? "#6366f1" : "#a78bfa" }]}>
                        {defaultTool === "pwmg" ? "Password Manager" : "Tool Hub"}
                    </Text>
                    <ChevronDown
                        color={isLight ? "#6366f1" : "#a78bfa"}
                        size={16}
                        style={{ marginLeft: 4, transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
                    />
                </View>
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.dropdownMenu, { borderTopColor: isLight ? "#e2e8f0" : "#1e293b" }]}>
                    {[
                        { tool: "hub" as const, title: "Tool Hub (Default)", sub: "Shows overview of all Snipit tools on app launch", icon: <LayoutGrid color="#3b82f6" size={16} />, bg: "rgba(59, 130, 246, 0.15)" },
                        { tool: "pwmg" as const, title: "Password Manager", sub: "Bypasses hub and opens your password vault immediately", icon: <Shield color="#8b5cf6" size={16} />, bg: "rgba(139, 92, 246, 0.15)" },
                    ].map((opt) => (
                        <TouchableOpacity
                            key={opt.tool}
                            style={[
                                styles.optionRow,
                                defaultTool === opt.tool && { backgroundColor: isLight ? "rgba(99, 102, 241, 0.08)" : "rgba(139, 92, 246, 0.12)" },
                            ]}
                            onPress={() => onSelectTool(opt.tool)}
                        >
                            <View style={styles.optionLeft}>
                                <View style={[styles.optionIconBox, { backgroundColor: opt.bg }]}>
                                    {opt.icon}
                                </View>
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={[styles.optionTitle, { color: vars.text }]}>{opt.title}</Text>
                                    <Text style={[styles.optionSub, { color: vars.textSecondary }]}>{opt.sub}</Text>
                                </View>
                            </View>
                            {defaultTool === opt.tool && <Check color={isLight ? "#6366f1" : "#a78bfa"} size={18} />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: "visible",
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: "600",
    },
    dropdownMenu: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 6,
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    optionIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    optionTitle: {
        fontSize: 14,
        fontWeight: "600",
    },
    optionSub: {
        fontSize: 12,
        marginTop: 1,
    },
});
