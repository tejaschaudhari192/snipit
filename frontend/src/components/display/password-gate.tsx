import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PasswordGateProps {
	passwordInput: string;
	setPasswordInput: (v: string) => void;
	passwordError: string;
	setPasswordError: (v: string) => void;
	handleVerifyPassword: () => void;
}

export const PasswordGate = ({
	passwordInput,
	setPasswordInput,
	passwordError,
	setPasswordError,
	handleVerifyPassword,
}: PasswordGateProps) => {
	const { t } = useTranslation();

	return (
		<div className="flex-1 flex justify-center items-center p-4">
			<Card className="w-full max-w-md shadow-lg border-2">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<Lock className="w-6 h-6 text-primary" />
					</div>
					<CardTitle className="text-2xl">
						{t("common.password_protected", "Password Protected")}
					</CardTitle>
					<CardDescription>
						{t(
							"common.enter_password_desc",
							"This snippet is password protected. Please enter the password to view it.",
						)}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Input
							type="password"
							placeholder={t(
								"common.password_placeholder",
								"Enter password...",
							)}
							value={passwordInput}
							onChange={(e) => {
								setPasswordInput(e.target.value);
								setPasswordError("");
							}}
							onKeyDown={(e) =>
								e.key === "Enter" && handleVerifyPassword()
							}
							className={passwordError ? "border-red-500" : ""}
						/>
						{passwordError && (
							<p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
								{passwordError}
							</p>
						)}
					</div>
					<Button
						className="w-full font-bold"
						onClick={handleVerifyPassword}
						disabled={!passwordInput}
					>
						{t("common.unlock", "Unlock Snippet")}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};
