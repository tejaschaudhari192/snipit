import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import PasswordSetupForm from "../password-setup-form";

interface Step2CreatePasswordProps {
	password: string;
	onPasswordChange: (val: string) => void;
	confirmPassword: string;
	onConfirmPasswordChange: (val: string) => void;
	isStrongEnough: boolean;
	passwordsMatch: boolean;
	onBack: () => void;
	onNext: () => void;
}

export default function Step2CreatePassword({
	password,
	onPasswordChange,
	confirmPassword,
	onConfirmPasswordChange,
	isStrongEnough,
	passwordsMatch,
	onBack,
	onNext,
}: Step2CreatePasswordProps) {
	const { t } = useTranslation();

	return (
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
				<PasswordSetupForm
					password={password}
					onPasswordChange={onPasswordChange}
					confirmPassword={confirmPassword}
					onConfirmPasswordChange={onConfirmPasswordChange}
				/>
			</div>

			<div className="flex justify-between items-center pt-4">
				<Button variant="ghost" onClick={onBack}>
					{t("tools.password_manager_back")}
				</Button>
				<Button
					onClick={onNext}
					disabled={!isStrongEnough || !passwordsMatch}
					className="rounded-full px-6"
				>
					{t("tools.password_manager_continue")}{" "}
					<span className="ml-2">→</span>
				</Button>
			</div>
		</div>
	);
}
