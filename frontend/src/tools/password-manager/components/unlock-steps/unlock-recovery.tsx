import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { KeyRound, LockOpen, Upload } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

interface UnlockRecoveryProps {
	recoveryPhrase: string;
	onRecoveryPhraseChange: (val: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	recoveryError: string | null;
	recoveryLoading: boolean;
	onBack: () => void;
}

export default function UnlockRecovery({
	recoveryPhrase,
	onRecoveryPhraseChange,
	onSubmit,
	recoveryError,
	recoveryLoading,
	onBack,
}: UnlockRecoveryProps) {
	const { t } = useTranslation();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 102400) {
			// 100KB limit
			toast.add({
				title: t("tools.password_manager.recovery.file_too_large"),
				type: "error",
			});
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			const text = event.target?.result as string;
			if (text) {
				onRecoveryPhraseChange(text.trim());
				toast.add({
					title: t(
						"tools.password_manager.recovery.file_read_success",
					),
					type: "success",
				});
			}
		};
		reader.onerror = () => {
			toast.add({
				title: t("tools.password_manager.recovery.file_read_error"),
				type: "error",
			});
		};
		reader.readAsText(file);

		e.target.value = "";
	};

	return (
		<div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
			<Card className="w-full max-w-lg bg-background/60 backdrop-blur-xl border-border shadow-2xl">
				<CardHeader className="space-y-4 pb-6 text-center">
					<div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center ring-8 ring-amber-500/5">
						<KeyRound className="h-8 w-8 text-amber-500" />
					</div>
					<div className="space-y-1">
						<CardTitle className="text-2xl font-bold tracking-tight">
							{t("tools.password_manager.recovery.use_title")}
						</CardTitle>
						<CardDescription className="text-base">
							{t("tools.password_manager.recovery.use_desc")}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="space-y-2">
							<Input
								placeholder={t(
									"tools.password_manager.recovery.placeholder",
								)}
								value={recoveryPhrase}
								onChange={(e) =>
									onRecoveryPhraseChange(e.target.value)
								}
								className="h-12 text-center"
								autoFocus
								disabled={recoveryLoading}
							/>
							{recoveryError && (
								<p className="text-sm text-red-500 text-center animate-in fade-in slide-in-from-top-1">
									{recoveryError}
								</p>
							)}
							<div className="pt-1">
								<Button
									type="button"
									variant="outline"
									className="w-full h-10 border-dashed"
									onClick={() =>
										fileInputRef.current?.click()
									}
									disabled={recoveryLoading}
								>
									<Upload className="mr-2 h-4 w-4 text-muted-foreground" />
									<span className="text-muted-foreground">
										{t(
											"tools.password_manager.recovery.upload",
											"Upload Key File (.txt)",
										)}
									</span>
								</Button>
							</div>
							<Input
								type="file"
								ref={fileInputRef}
								onChange={handleFileUpload}
								accept=".txt"
								className="hidden"
							/>
						</div>

						<Button
							type="submit"
							className="w-full h-12 rounded-xl text-base font-semibold"
							disabled={!recoveryPhrase.trim() || recoveryLoading}
						>
							{recoveryLoading ? (
								<>
									<Spinner className="mr-2 h-5 w-5 animate-spin" />
									{t(
										"tools.password_manager.recovery.decrypting",
									)}
								</>
							) : (
								<>
									<LockOpen className="mr-2 h-5 w-5" />
									{t(
										"tools.password_manager.recovery.unlock",
									)}
								</>
							)}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<Button
							variant="link"
							onClick={onBack}
							className="text-sm"
						>
							{t("tools.password_manager.back")}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
