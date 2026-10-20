import React from "react";
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, TextInputProps, StyleSheet } from "react-native";
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
    style,
    ...props
}: FormInputProps) {
    const isLight = theme === "light";
    const defaultPlaceholderColor = isLight ? "#94a3b8" : "#64748b";

    return (
        <View style={styles.inputContainer} className={`w-full mb-3.5 ${containerClassName}`}>
            {label && (
                <Text
                    style={[styles.label, { color: isLight ? "#475569" : "#94a3b8" }]}
                    className="text-xs font-semibold mb-1.5 ml-1"
                >
                    {label}
                </Text>
            )}
            <TextInput
                placeholderTextColor={placeholderTextColor || defaultPlaceholderColor}
                style={[
                    styles.input,
                    {
                        backgroundColor: isLight ? "#ffffff" : "#0f172a",
                        borderColor: isLight ? "#cbd5e1" : "#1e293b",
                        color: isLight ? "#0f172a" : "#ffffff",
                    },
                    style,
                ]}
                className={`w-full rounded-xl px-3.5 py-3 text-[15px] ${className}`}
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
    style,
    ...props
}: PasswordInputProps) {
    const isLight = theme === "light";
    const defaultPlaceholderColor = isLight ? "#94a3b8" : "#64748b";

    return (
        <View style={styles.inputContainer} className={`w-full mb-3.5 ${containerClassName}`}>
            {label && (
                <Text
                    style={[styles.label, { color: isLight ? "#475569" : "#94a3b8" }]}
                    className="text-xs font-semibold mb-1.5 ml-1"
                >
                    {label}
                </Text>
            )}
            <View
                style={[
                    styles.passwordWrapper,
                    {
                        backgroundColor: isLight ? "#ffffff" : "#0f172a",
                        borderColor: isLight ? "#cbd5e1" : "#1e293b",
                    },
                ]}
                className="w-full flex-row items-center rounded-xl pr-2"
            >
                <TextInput
                    placeholderTextColor={placeholderTextColor || defaultPlaceholderColor}
                    secureTextEntry={!showPassword}
                    style={[
                        styles.passwordInput,
                        {
                            color: isLight ? "#0f172a" : "#ffffff",
                        },
                        style,
                    ]}
                    className={`flex-1 px-3.5 py-3 text-[15px] ${className}`}
                    {...props}
                />
                <TouchableOpacity
                    onPress={onToggleShowPassword}
                    style={styles.eyeBtn}
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
            style={[
                styles.button,
                disabled || loading ? styles.buttonDisabled : null,
            ]}
            className={`w-full py-3.5 rounded-xl items-center justify-center mt-2 ${className}`}
        >
            {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
            ) : (
                <Text style={styles.buttonText} className="text-white text-base font-bold">
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        width: "100%",
        marginBottom: 14,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 6,
        marginLeft: 4,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    passwordWrapper: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        paddingRight: 6,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
    },
    eyeBtn: {
        padding: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    button: {
        width: "100%",
        backgroundColor: "#7c3aed",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
});
