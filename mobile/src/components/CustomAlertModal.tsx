import React from "react";
import { View } from "react-native";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react-native";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Text } from "./ui/text";

export interface CustomAlertButton {
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
}

export interface CustomAlertConfig {
    visible: boolean;
    title: string;
    message?: string;
    type?: "info" | "success" | "warning" | "error";
    buttons?: CustomAlertButton[];
    onDismiss?: () => void;
}

interface CustomAlertModalProps {
    config: CustomAlertConfig;
    theme?: "dark" | "light";
}

export function CustomAlertModal({ config }: CustomAlertModalProps) {
    if (!config.visible) return null;

    const type = config.type || "info";

    const getIconBadge = () => {
        switch (type) {
            case "success":
                return (
                    <View className="w-10 h-10 rounded-full bg-muted justify-center items-center mb-2">
                        <CheckCircle2 color="#22c55e" size={22} />
                    </View>
                );
            case "error":
                return (
                    <View className="w-10 h-10 rounded-full bg-destructive/10 justify-center items-center mb-2">
                        <AlertCircle color="#ef4444" size={22} />
                    </View>
                );
            case "warning":
                return (
                    <View className="w-10 h-10 rounded-full bg-muted justify-center items-center mb-2">
                        <AlertTriangle color="#f59e0b" size={22} />
                    </View>
                );
            case "info":
            default:
                return (
                    <View className="w-10 h-10 rounded-full bg-muted justify-center items-center mb-2">
                        <Info color="#71717a" size={22} />
                    </View>
                );
        }
    };

    const buttons =
        config.buttons && config.buttons.length > 0
            ? config.buttons
            : [{ text: "OK", style: "default" as const, onPress: config.onDismiss }];

    return (
        <AlertDialog
            open={config.visible}
            onOpenChange={(open) => {
                if (!open) config.onDismiss?.();
            }}
        >
            <AlertDialogContent className="max-w-[340px] items-center p-6">
                <AlertDialogHeader className="items-center">
                    {getIconBadge()}
                    <AlertDialogTitle className="text-center font-semibold">
                        {config.title}
                    </AlertDialogTitle>
                    {config.message ? (
                        <AlertDialogDescription className="text-center text-sm">
                            {config.message}
                        </AlertDialogDescription>
                    ) : null}
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-row gap-2.5 w-full mt-4">
                    {buttons.map((btn, idx) => {
                        const variant =
                            btn.style === "destructive"
                                ? "destructive"
                                : btn.style === "cancel"
                                ? "outline"
                                : "default";

                        return (
                            <Button
                                key={idx}
                                variant={variant}
                                className="flex-1 h-10"
                                onPress={() => {
                                    if (config.onDismiss) config.onDismiss();
                                    if (btn.onPress) {
                                        setTimeout(() => btn.onPress?.(), 0);
                                    }
                                }}
                            >
                                <Text className="font-medium">{btn.text}</Text>
                            </Button>
                        );
                    })}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
