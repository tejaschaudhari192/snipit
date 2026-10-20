import React from "react";
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface FormInputProps extends TextInputProps {
    label?: string;
    containerClassName?: string;
    theme?: "dark" | "light";
}

export function FormInput({
    label,
    containerClassName = "",
    className = "",
    placeholderTextColor,
    theme = "dark",
    ...props
}: FormInputProps) {
    const isLight = theme === "light";
    const defaultPlaceholderColor = isLight ? "#94a3b8" : "#64748b";

    return (
        <View className={`w-full mb-3.5 ${containerClassName}`}>
            {label && (
                <Text
                    className={`text-xs font-semibold mb-1.5 ml-1 ${
                        isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                >
                    {label}
                </Text>
            )}
            <TextInput
                placeholderTextColor={placeholderTextColor || defaultPlaceholderColor}
                className={`w-full rounded-xl px-4 py-3 text-[15px] border ${
                    isLight
                        ? "bg-white border-slate-300 text-slate-900"
                        : "bg-slate-900 border-slate-800 text-white"
                } ${className}`}
                {...props}
            />
        </View>
    );
}

interface PasswordInputProps extends TextInputProps {
    label?: string;
    showPassword: boolean;
    onToggleShowPassword: () => void;
    containerClassName?: string;
    theme?: "dark" | "light";
}

export function FormPasswordInput({
    label,
    showPassword,
    onToggleShowPassword,
    containerClassName = "",
    className = "",
    placeholderTextColor,
    theme = "dark",
    ...props
}: PasswordInputProps) {
    const isLight = theme === "light";
    const defaultPlaceholderColor = isLight ? "#94a3b8" : "#64748b";

    return (
        <View className={`w-full mb-3.5 ${containerClassName}`}>
            {label && (
                <Text
                    className={`text-xs font-semibold mb-1.5 ml-1 ${
                        isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                >
                    {label}
                </Text>
            )}
            <View
                className={`w-full flex-row items-center rounded-xl border pr-2 ${
                    isLight
                        ? "bg-white border-slate-300"
                        : "bg-slate-900 border-slate-800"
                }`}
            >
                <TextInput
                    placeholderTextColor={placeholderTextColor || defaultPlaceholderColor}
                    secureTextEntry={!showPassword}
                    className={`flex-1 px-4 py-3 text-[15px] ${
                        isLight ? "text-slate-900" : "text-white"
                    } ${className}`}
                    {...props}
                />
                <TouchableOpacity
                    onPress={onToggleShowPassword}
                    className="p-2 justify-center items-center"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {showPassword ? (
                        <EyeOff color={isLight ? "#64748b" : "#94a3b8"} size={20} />
                    ) : (
                        <Eye color={isLight ? "#64748b" : "#94a3b8"} size={20} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

interface PrimaryButtonProps {
    onPress: () => void;
    title: string;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    theme?: "dark" | "light";
}

export function PrimaryButton({
    onPress,
    title,
    loading = false,
    disabled = false,
    className = "",
}: PrimaryButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            className={`w-full bg-violet-600 py-3.5 rounded-xl items-center justify-center mt-2 ${
                disabled || loading ? "opacity-60" : "active:bg-violet-700"
            } ${className}`}
        >
            {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
            ) : (
                <Text className="text-white text-base font-bold">
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}
