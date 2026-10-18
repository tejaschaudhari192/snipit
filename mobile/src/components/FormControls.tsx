import React from "react";
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface FormInputProps extends TextInputProps {
    label?: string;
    containerClassName?: string;
}

export function FormInput({
    label,
    containerClassName = "",
    className = "",
    placeholderTextColor = "#6b7280",
    ...props
}: FormInputProps) {
    return (
        <View className={`w-full mb-3 ${containerClassName}`}>
            {label && (
                <Text className="text-xs font-semibold text-slate-400 mb-1.5 ml-1">
                    {label}
                </Text>
            )}
            <TextInput
                placeholderTextColor={placeholderTextColor}
                className={`w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-white text-[15px] ${className}`}
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
}

export function FormPasswordInput({
    label,
    showPassword,
    onToggleShowPassword,
    containerClassName = "",
    className = "",
    placeholderTextColor = "#6b7280",
    ...props
}: PasswordInputProps) {
    return (
        <View className={`w-full mb-3 ${containerClassName}`}>
            {label && (
                <Text className="text-xs font-semibold text-slate-400 mb-1.5 ml-1">
                    {label}
                </Text>
            )}
            <View className="w-full flex-row items-center bg-slate-900 border border-slate-800 rounded-xl pr-2">
                <TextInput
                    placeholderTextColor={placeholderTextColor}
                    secureTextEntry={!showPassword}
                    className={`flex-1 px-3.5 py-3 text-white text-[15px] ${className}`}
                    {...props}
                />
                <TouchableOpacity
                    onPress={onToggleShowPassword}
                    className="p-2 justify-center items-center"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {showPassword ? (
                        <EyeOff color="#9ca3af" size={20} />
                    ) : (
                        <Eye color="#9ca3af" size={20} />
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
                disabled || loading ? "opacity-70" : "active:bg-violet-700"
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
