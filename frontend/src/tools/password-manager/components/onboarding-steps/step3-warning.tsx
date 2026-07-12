import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Loader2 } from "lucide-react";

interface Step3WarningProps {
	understandWarning: boolean;
	onUnderstandChange: (checked: boolean) => void;
	onBack: () => void;
	onNext: () => void;
	recoveryLoading: boolean;
}

export default function Step3Warning({
	understandWarning,
	onUnderstandChange,
	onBack,
	onNext,
	recoveryLoading,
}: Step3WarningProps) {
	const { t } = useTranslation();

	return (
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
					onCheckedChange={(c) => onUnderstandChange(!!c)}
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
				<Button variant="ghost" onClick={onBack}>
					{t("tools.password_manager_back")}
				</Button>
				<Button
					onClick={onNext}
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
}
