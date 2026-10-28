import React from "react";
import { View, TextInputProps, TouchableOpacity, ActivityIndicator } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { cn } from "../lib/utils";

export interface FormInputProps extends TextInputProps {
    placeholder?: string;
    label?: string;
    containerClassName?: string;
    theme?: "dark" | "light";
}

export function FormInput({
    label,
    containerClassName = "",
    className = "",
    value,
    onChangeText,
    placeholder,
    autoCapitalize,
    secureTextEntry,
    ...props
}: FormInputProps) {
    return (
        <View className={cn("w-full mb-3", containerClassName)}>
            {label && <Label className="mb-1.5">{label}</Label>}
            <Input
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                autoCapitalize={autoCapitalize}
                secureTextEntry={secureTextEntry}
                className={className}
                {...props}
            />
        </View>
    );
}

export interface PasswordInputProps extends TextInputProps {
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
    value,
    onChangeText,
    placeholder,
    ...props
}: PasswordInputProps) {
    return (
        <View className={cn("w-full mb-3", containerClassName)}>
            {label && <Label className="mb-1.5">{label}</Label>}
            <View className="w-full flex-row items-center border border-input rounded-md pr-2 bg-background">
                <Input
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={!showPassword}
                    className={cn("flex-1 border-0 shadow-none bg-transparent", className)}
                    {...props}
                />
                <TouchableOpacity
                    onPress={onToggleShowPassword}
                    className="p-2 justify-center items-center"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {showPassword ? (
                        <EyeOff color="#71717a" size={18} />
                    ) : (
                        <Eye color="#71717a" size={18} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

export interface PrimaryButtonProps {
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
        <Button
            onPress={onPress}
            disabled={disabled || loading}
            className={cn("w-full mt-2 h-11", className)}
        >
            {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
            ) : (
                <Text className="font-semibold text-primary-foreground">{title}</Text>
            )}
        </Button>
    );
}
