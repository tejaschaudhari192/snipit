import React, { useEffect } from "react";
import { BackHandler, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomAlert } from "../hooks/useCustomAlert";
import { useAuthFlow } from "../hooks/useAuthFlow";
import { AuthHeader } from "../components/AuthHeader";
import { SignInForm } from "../components/sign-in-form";
import { SignUpForm } from "../components/sign-up-form";
import { ForgotPasswordForm } from "../components/forgot-password-form";

interface Props {
    onBack: () => void;
    onAuthSuccess: () => void;
    theme?: "dark" | "light";
}

export function AuthScreen({ onBack, onAuthSuccess, theme = "dark" }: Props) {
    const { showAlert, alertModal } = useCustomAlert(theme);

    const {
        mode,
        setMode,
        email,
        setEmail,
        username,
        setUsername,
        password,
        setPassword,
        loading,
        error,
        setError,
        handleSubmit,
    } = useAuthFlow({
        onAuthSuccess,
        showSuccessAlert: (title, message, onContinue) => {
            showAlert(title, message, "success", [
                { text: "Continue", style: "default", onPress: onContinue },
            ]);
        },
        showInfoAlert: (title, message, onDismiss) => {
            showAlert(title, message, "info", [
                { text: "OK", onPress: onDismiss },
            ]);
        },
    });

    useEffect(() => {
        const handleHardwareBack = () => {
            if (mode !== "login") {
                setMode("login");
                return true;
            }
            onBack();
            return true;
        };
        const subscription = BackHandler.addEventListener("hardwareBackPress", handleHardwareBack);
        return () => subscription.remove();
    }, [onBack, mode, setMode]);

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
            <AuthHeader
                mode={mode}
                onBack={mode === "login" ? onBack : () => setMode("login")}
            />

            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                contentContainerClassName="p-4 max-w-sm w-full mx-auto"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {mode === "login" && (
                    <SignInForm
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        onSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                        onNavigateToSignUp={() => {
                            setError("");
                            setMode("register");
                        }}
                        onNavigateToForgotPassword={() => {
                            setError("");
                            setMode("forgot");
                        }}
                    />
                )}

                {mode === "register" && (
                    <SignUpForm
                        email={email}
                        setEmail={setEmail}
                        username={username}
                        setUsername={setUsername}
                        password={password}
                        setPassword={setPassword}
                        onSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                        onNavigateToSignIn={() => {
                            setError("");
                            setMode("login");
                        }}
                    />
                )}

                {mode === "forgot" && (
                    <ForgotPasswordForm
                        email={email}
                        setEmail={setEmail}
                        onSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                        onNavigateToSignIn={() => {
                            setError("");
                            setMode("login");
                        }}
                    />
                )}
            </ScrollView>

            {alertModal}
        </SafeAreaView>
    );
}
