import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
    Shield,
    Eye,
    EyeOff,
    Lock,
    Cloud,
    KeyRound,
    AlertTriangle,
    Copy,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

import zxcvbn from "zxcvbn";

interface VaultOnboardingProps {
    onComplete: (password: string) => void;
    onGenerateRecoveryKey: (password: string) => void;
    recoveryMnemonic: string | null;
    recoveryLoading: boolean;
    onClearRecoveryMnemonic: () => void;
}

export default function VaultOnboarding({
    onComplete,
    onGenerateRecoveryKey,
    recoveryMnemonic,
    recoveryLoading,
    onClearRecoveryMnemonic,
}: VaultOnboardingProps) {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);

    // Step 2 State
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [strengthScore, setStrengthScore] = useState(0);

    // Step 3 State
    const [understandWarning, setUnderstandWarning] = useState(false);

    // Step 4 State
    const [recoverySaved, setRecoverySaved] = useState(false);

    useEffect(() => {
        if (password) {
            setStrengthScore(zxcvbn(password).score);
        } else {
            setStrengthScore(0);
        }
    }, [password]);

    // When recoveryMnemonic is set, advance to step 4
    useEffect(() => {
        if (recoveryMnemonic) {
            setStep(4);
        }
    }, [recoveryMnemonic]);

    const handleCopy = useCallback(async () => {
        if (!recoveryMnemonic) return;
        await navigator.clipboard.writeText(recoveryMnemonic);
        toast.success(t("tools.password_manager_recovery_copied"));
    }, [recoveryMnemonic, t]);

    const handleCreateVault = useCallback(() => {
        onGenerateRecoveryKey(password);
    }, [onGenerateRecoveryKey, password]);

    const handleFinish = useCallback(() => {
        onComplete(password);
        onClearRecoveryMnemonic();
    }, [onComplete, onClearRecoveryMnemonic, password]);

    const handleSkip = useCallback(() => {
        onComplete(password);
        onClearRecoveryMnemonic();
    }, [onComplete, onClearRecoveryMnemonic, password]);

    const reqs = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };

    const isStrongEnough =
        strengthScore >= 2 &&
        reqs.length &&
        reqs.upper &&
        reqs.number &&
        reqs.special;
    const passwordsMatch = password === confirmPassword && password.length > 0;

    const renderStep1 = () => (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3 md:space-y-4">
                <div className="inline-flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/10 mb-2 ring-8 ring-primary/5">
                    <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("tools.password_manager_onboarding_title")}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-sm mx-auto">
                    {t("tools.password_manager_onboarding_subtitle")}
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto">
                <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4 flex sm:flex-col items-center sm:text-center text-left gap-4 sm:gap-2">
                        <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                        <div>
                            <h3 className="font-semibold text-sm">
                                {t(
                                    "tools.password_manager_onboarding_feature_aes_title",
                                )}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-0">
                                {t(
                                    "tools.password_manager_onboarding_feature_aes_desc",
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4 flex sm:flex-col items-center sm:text-center text-left gap-4 sm:gap-2">
                        <KeyRound className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                        <div>
                            <h3 className="font-semibold text-sm">
                                {t(
                                    "tools.password_manager_onboarding_feature_zero_title",
                                )}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-0">
                                {t(
                                    "tools.password_manager_onboarding_feature_zero_desc",
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4 flex sm:flex-col items-center sm:text-center text-left gap-4 sm:gap-2">
                        <Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                        <div>
                            <h3 className="font-semibold text-sm">
                                {t(
                                    "tools.password_manager_onboarding_feature_sync_title",
                                )}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-0">
                                {t(
                                    "tools.password_manager_onboarding_feature_sync_desc",
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center pt-4">
                <Button
                    onClick={() => setStep(2)}
                    size="lg"
                    className="rounded-full px-8"
                >
                    {t("tools.password_manager_onboarding_cta")}{" "}
                    <span className="ml-2">→</span>
                </Button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-md mx-auto w-full">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">
                    {t("tools.password_manager_create_title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t("tools.password_manager_create_subtitle")}
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t(
                                "tools.password_manager_master_password_placeholder",
                            )}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10 h-12"
                            autoFocus
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {password && (
                        <Progress
                            value={(strengthScore + 1) * 20}
                            indicatorClassName={
                                strengthScore < 2
                                    ? "bg-red-500"
                                    : strengthScore === 2
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                            }
                        />
                    )}
                </div>

                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t(
                            "tools.password_manager_confirm_password_placeholder",
                        )}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12"
                    />
                </div>

                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-4 space-y-2 text-sm">
                        {[
                            {
                                key: "length",
                                label: t("tools.password_manager_req_length"),
                            },
                            {
                                key: "upper",
                                label: t(
                                    "tools.password_manager_req_uppercase",
                                ),
                            },
                            {
                                key: "number",
                                label: t("tools.password_manager_req_number"),
                            },
                            {
                                key: "special",
                                label: t("tools.password_manager_req_special"),
                            },
                        ].map(({ key, label }) => {
                            const met = reqs[key as keyof typeof reqs];
                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-2"
                                >
                                    <span
                                        className={
                                            met
                                                ? "text-green-500"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {met ? "✓" : "○"}
                                    </span>
                                    <span
                                        className={
                                            met
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between items-center pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>
                    {t("tools.password_manager_back")}
                </Button>
                <Button
                    onClick={() => setStep(3)}
                    disabled={!isStrongEnough || !passwordsMatch}
                    className="rounded-full px-6"
                >
                    {t("tools.password_manager_continue")}{" "}
                    <span className="ml-2">→</span>
                </Button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-md mx-auto w-full">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-2">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold">
                    {t("tools.password_manager_warning_title")}
                </h2>
                <p className="text-muted-foreground">
                    {t("tools.password_manager_warning_desc")}
                </p>
                <p className="font-semibold text-foreground bg-muted/50 p-4 rounded-xl border border-border">
                    {t("tools.password_manager_warning_irrecoverable")}
                </p>
            </div>

            <div className="flex items-start space-x-3 p-4 border border-border rounded-xl bg-background/50">
                <Checkbox
                    id="understand"
                    checked={understandWarning}
                    onCheckedChange={(c) => setUnderstandWarning(!!c)}
                    className="mt-1"
                />
                <div className="space-y-1 leading-none">
                    <label
                        htmlFor="understand"
                        className="text-sm font-medium leading-none cursor-pointer"
                    >
                        {t("tools.password_manager_warning_checkbox")}
                    </label>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <Button variant="ghost" onClick={() => setStep(2)}>
                    {t("tools.password_manager_back")}
                </Button>
                <Button
                    onClick={handleCreateVault}
                    disabled={!understandWarning || recoveryLoading}
                    className="rounded-full px-6"
                >
                    {recoveryLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("tools.password_manager_recovery_generate")}
                        </>
                    ) : (
                        <>
                            {t("tools.password_manager_create_vault")}
                            <span className="ml-2">→</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-md mx-auto w-full">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2 ring-8 ring-primary/5">
                    <KeyRound className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">
                    {t("tools.password_manager_recovery_title")}
                </h2>
                <p className="text-muted-foreground">
                    {t("tools.password_manager_recovery_desc")}
                </p>
            </div>

            {recoveryMnemonic && (
                <Card className="bg-muted/30 border-border">
                    <CardContent className="p-6 space-y-4">
                        <div className="bg-background rounded-xl p-4 border border-border">
                            <p className="text-lg font-mono leading-relaxed text-center select-all">
                                {recoveryMnemonic}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleCopy}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            {t("tools.password_manager_recovery_copy")}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-amber-500/10 border-amber-500/30">
                <CardContent className="p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        {t("tools.password_manager_recovery_warning")}
                    </p>
                </CardContent>
            </Card>

            <div className="flex items-start space-x-3 p-4 border border-border rounded-xl bg-background/50">
                <Checkbox
                    id="recovery-saved"
                    checked={recoverySaved}
                    onCheckedChange={(c) => setRecoverySaved(!!c)}
                    className="mt-1"
                />
                <div className="space-y-1 leading-none">
                    <label
                        htmlFor="recovery-saved"
                        className="text-sm font-medium leading-none cursor-pointer"
                    >
                        {t("tools.password_manager_recovery_saved")}
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
                <Button
                    onClick={handleFinish}
                    disabled={!recoverySaved}
                    className="rounded-full px-6"
                >
                    {t("tools.password_manager_create_vault")}
                </Button>
                <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-muted-foreground"
                >
                    {t("tools.password_manager_recovery_skip")}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="h-full w-full overflow-y-auto flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full my-auto py-8">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>
        </div>
    );
}
