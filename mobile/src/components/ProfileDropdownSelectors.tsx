import { Text, View, TouchableOpacity } from "react-native";
import { Sun, Moon, Smartphone, Shield, LayoutGrid, ChevronDown, Check } from "lucide-react-native";
import { Card } from "./ui/card";
import { Text as UIText } from "./ui/text";

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
        <Card className="p-4 mb-4">
            <TouchableOpacity className="flex-row items-center" activeOpacity={0.8} onPress={onToggleOpen}>
                <View
                    className={`w-10 h-10 rounded-xl justify-center items-center ${
                        themeMode === "light"
                            ? "bg-amber-500/15"
                            : themeMode === "dark"
                            ? "bg-violet-500/15"
                            : "bg-blue-500/15"
                    }`}
                >
                    {getIcon()}
                </View>
                <View className="flex-1 ml-3">
                    <UIText className="text-[15px] font-semibold text-foreground">
                        Theme
                    </UIText>
                    <UIText className="text-xs mt-0.5 text-muted-foreground">
                        {getSubtitle()}
                    </UIText>
                </View>
                <View
                    className={`flex-row items-center px-2.5 py-1.5 rounded-xl ${
                        isLight ? "bg-indigo-500/10" : "bg-violet-500/15"
                    }`}
                >
                    <Text className={`text-[13px] font-semibold ${isLight ? "text-indigo-600" : "text-violet-300"}`}>
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
                <View
                    className={`mt-3 pt-2 border-t ${
                        isLight ? "border-slate-100" : "border-slate-800"
                    }`}
                >
                    {[
                        { mode: "system" as const, title: "System", sub: "Match device appearance setting", icon: <Smartphone color="#3b82f6" size={16} />, bg: "bg-blue-500/15" },
                        { mode: "dark" as const, title: "Dark", sub: "High-contrast futuristic dark mode", icon: <Moon color="#a78bfa" size={16} />, bg: "bg-violet-500/15" },
                        { mode: "light" as const, title: "Light", sub: "Clean and crisp daytime palette", icon: <Sun color="#f59e0b" size={16} />, bg: "bg-amber-500/15" },
                    ].map((opt) => (
                        <TouchableOpacity
                            key={opt.mode}
                            className={`flex-row items-center justify-between py-2.5 px-3 rounded-xl mb-1.5 ${
                                themeMode === opt.mode
                                    ? isLight ? "bg-indigo-500/10" : "bg-violet-500/15"
                                    : ""
                            }`}
                            onPress={() => onSelectMode(opt.mode)}
                        >
                            <View className="flex-row items-center flex-1">
                                <View className={`w-8 h-8 rounded-lg items-center justify-center ${opt.bg}`}>
                                    {opt.icon}
                                </View>
                                <View className="ml-2.5">
                                    <Text className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                                        {opt.title}
                                    </Text>
                                    <Text className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                        {opt.sub}
                                    </Text>
                                </View>
                            </View>
                            {themeMode === opt.mode && <Check color={isLight ? "#6366f1" : "#a78bfa"} size={18} />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </Card>
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
    const isLight = theme === "light";

    return (
        <Card className="p-4 mb-4">
            <TouchableOpacity className="flex-row items-center" activeOpacity={0.8} onPress={onToggleOpen}>
                <View
                    className={`w-10 h-10 rounded-xl justify-center items-center ${
                        defaultTool === "pwmg" ? "bg-violet-500/15" : "bg-blue-500/15"
                    }`}
                >
                    {defaultTool === "pwmg" ? <Shield color="#8b5cf6" size={20} /> : <LayoutGrid color="#3b82f6" size={20} />}
                </View>
                <View className="flex-1 ml-3">
                    <UIText className="text-[15px] font-semibold text-foreground">
                        Open on Startup
                    </UIText>
                    <UIText className="text-xs mt-0.5 text-muted-foreground">
                        {defaultTool === "pwmg"
                            ? "Directly opens Password Manager on start"
                            : "Directly opens Tool Hub on start"}
                    </UIText>
                </View>
                <View
                    className={`flex-row items-center px-2.5 py-1.5 rounded-xl ${
                        isLight ? "bg-indigo-500/10" : "bg-violet-500/15"
                    }`}
                >
                    <UIText className={`text-[13px] font-semibold ${isLight ? "text-indigo-600" : "text-violet-300"}`}>
                        {defaultTool === "pwmg" ? "Password Manager" : "Tool Hub"}
                    </UIText>
                    <ChevronDown
                        color={isLight ? "#6366f1" : "#a78bfa"}
                        size={16}
                        style={{ marginLeft: 4, transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
                    />
                </View>
            </TouchableOpacity>

            {isOpen && (
                <View
                    className={`mt-3 pt-2 border-t ${
                        isLight ? "border-slate-100" : "border-slate-800"
                    }`}
                >
                    {[
                        { tool: "hub" as const, title: "Tool Hub (Default)", sub: "Shows overview of all Snipit tools on app launch", icon: <LayoutGrid color="#3b82f6" size={16} />, bg: "bg-blue-500/15" },
                        { tool: "pwmg" as const, title: "Password Manager", sub: "Bypasses hub and opens your password vault immediately", icon: <Shield color="#8b5cf6" size={16} />, bg: "bg-violet-500/15" },
                    ].map((opt) => (
                        <TouchableOpacity
                            key={opt.tool}
                            className={`flex-row items-center justify-between py-2.5 px-3 rounded-xl mb-1.5 ${
                                defaultTool === opt.tool
                                    ? isLight ? "bg-indigo-500/10" : "bg-violet-500/15"
                                    : ""
                            }`}
                            onPress={() => onSelectTool(opt.tool)}
                        >
                            <View className="flex-row items-center flex-1">
                                <View className={`w-8 h-8 rounded-lg items-center justify-center ${opt.bg}`}>
                                    {opt.icon}
                                </View>
                                <View className="ml-2.5">
                                    <Text className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
                                        {opt.title}
                                    </Text>
                                    <Text className={`text-xs mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                        {opt.sub}
                                    </Text>
                                </View>
                            </View>
                            {defaultTool === opt.tool && <Check color={isLight ? "#6366f1" : "#a78bfa"} size={18} />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </Card>
    );
}
