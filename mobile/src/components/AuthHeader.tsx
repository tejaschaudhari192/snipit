import React from "react";
import { View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Icon } from "./ui/icon";

interface AuthHeaderProps {
    mode: "login" | "register" | "forgot";
    onBack: () => void;
}

export function AuthHeader({ mode, onBack }: AuthHeaderProps) {
    const title = mode === "login" ? "Sign In" : mode === "register" ? "Sign Up" : "Reset Password";

    return (
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
            <Button
                variant="ghost"
                size="icon"
                onPress={onBack}
                className="h-9 w-9"
            >
                <Icon as={ArrowLeft} className="text-foreground" size={18} />
            </Button>
            <Text className="text-sm font-semibold tracking-tight">
                {title}
            </Text>
            <View className="w-9" />
        </View>
    );
}

