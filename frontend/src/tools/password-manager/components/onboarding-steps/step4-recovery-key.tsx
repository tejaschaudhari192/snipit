import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyRound, Copy, Download, AlertTriangle } from "lucide-react";

interface Step4RecoveryKeyProps {
	recoveryMnemonic: string | null;
	recoverySaved: boolean;
	onRecoverySavedChange: (checked: boolean) => void;
	onCopy: () => void;
	onDownload: () => void;
	onFinish: () => void;
	onSkip: () => void;
}

export default function Step4RecoveryKey({
	recoveryMnemonic,
	recoverySaved,
	onRecoverySavedChange,
	onCopy,
	onDownload,
	onFinish,
	onSkip,
}: Step4RecoveryKeyProps) {
	const { t } = useTranslation();

	return (
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
						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onClick={onCopy}
							>
								<Copy className="mr-2 h-4 w-4" />
								{t("tools.password_manager_recovery_copy")}
							</Button>
							<Button
								variant="outline"
								className="flex-1"
								onClick={onDownload}
							>
								<Download className="mr-2 h-4 w-4" />
								{t(
									"tools.password_manager_recovery_download",
									"Download",
								)}
							</Button>
						</div>
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
					onCheckedChange={(c) => onRecoverySavedChange(!!c)}
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
					onClick={onFinish}
					disabled={!recoverySaved}
					className="rounded-full px-6"
				>
					{t("tools.password_manager_create_vault")}
				</Button>
				<Button
					variant="ghost"
					onClick={onSkip}
					className="text-muted-foreground"
				>
					{t("tools.password_manager_recovery_skip")}
				</Button>
			</div>
		</div>
	);
}
