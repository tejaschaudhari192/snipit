import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/common/password-input";
import { EncryptButton } from "@/components/ui/encrypt-button";
import { Lock, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

interface PasswordGateProps {
	passwordInput: string;
	setPasswordInput: (v: string) => void;
	passwordError: string;
	setPasswordError: (v: string) => void;
	handleVerifyPassword: () => void;
	isVerifying?: boolean;
}

export const PasswordGate = ({
	passwordInput,
	setPasswordInput,
	passwordError,
	setPasswordError,
	handleVerifyPassword,
	isVerifying = false,
}: PasswordGateProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex-1 flex justify-center items-center p-4">
			<Card className="w-full max-w-md shadow-2xl border border-border/50 bg-background/60 backdrop-blur-xl rounded-2xl ring-1 ring-white/5 relative z-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
				<CardHeader className="space-y-2 text-center pb-6">
					<div className="flex items-center justify-center mb-6">
						<div className="relative flex items-center justify-center w-20 h-20">
							<div className="absolute inset-0 rounded-full border border-primary/30 border-dashed animate-[spin_8s_linear_infinite]" />
							<div className="absolute inset-2 rounded-full border border-primary/20 animate-[spin_6s_linear_infinite_reverse]" />
							<div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
							<div className="relative z-10 p-3 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg text-primary backdrop-blur-sm">
								<Lock className="h-8 w-8 drop-shadow-md" />
							</div>
						</div>
					</div>
					<CardTitle className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-b from-foreground via-foreground to-muted-foreground drop-shadow-sm text-center">
						{t("common.auth.password_protected")}
					</CardTitle>
					<CardDescription className="text-base text-muted-foreground text-center">
						{t("common.auth.enter_password_desc")}
					</CardDescription>
					<div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
						<span>{t("common.auth.zero_knowledge_badge")}</span>
						<TooltipProvider delay={200}>
							<Tooltip>
								<TooltipTrigger>
									<button
										type="button"
										className="cursor-pointer text-muted-foreground/70 hover:text-foreground transition-colors p-0.5 rounded-full inline-flex items-center"
										aria-label="Info"
									>
										<HelpCircle className="h-3.5 w-3.5" />
									</button>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs text-xs">
									{t("common.auth.encryption_desc")}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<PasswordInput
							placeholder={t("common.auth.password_placeholder")}
							value={passwordInput}
							onChange={(e) => {
								setPasswordInput(e.target.value);
								setPasswordError("");
							}}
							onKeyDown={(e) =>
								e.key === "Enter" &&
								!isVerifying &&
								handleVerifyPassword()
							}
							className={passwordError ? "border-red-500" : ""}
							disabled={isVerifying}
						/>
						{passwordError && (
							<p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
								{passwordError}
							</p>
						)}
					</div>
					<EncryptButton
						className="w-full h-11 text-sm font-semibold rounded-xl"
						onClick={handleVerifyPassword}
						disabled={!passwordInput || isVerifying}
						loading={isVerifying}
						isLocked={true}
						text={
							isVerifying
								? t("common.states.unlocking")
								: t("common.auth.unlock")
						}
					/>
				</CardContent>
			</Card>
		</div>
	);
};
