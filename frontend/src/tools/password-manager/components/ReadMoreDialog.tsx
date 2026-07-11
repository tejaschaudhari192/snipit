import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert, KeyRound, Shield } from "lucide-react";

export default function ReadMoreDialog() {
	const { t } = useTranslation();
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium">
					{t("tools.password_manager_read_more")}
				</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border shadow-2xl p-0 overflow-hidden">
				<div className="bg-destructive/10 p-6 flex flex-col items-center text-center space-y-3 border-b border-border">
					<div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center ring-4 ring-destructive/10">
						<ShieldAlert className="w-6 h-6 text-destructive" />
					</div>
					<DialogTitle className="text-xl font-bold tracking-tight text-foreground">
						{t("tools.password_manager_zero_knowledge_title")}
					</DialogTitle>
				</div>
				<div className="p-6 space-y-6">
					<DialogDescription className="text-sm text-foreground/80 leading-relaxed">
						{t("tools.password_manager_read_more_description")}
					</DialogDescription>

					<div className="bg-muted/50 rounded-xl p-4 border border-border space-y-3">
						<div className="flex items-start gap-3">
							<AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
							<div className="space-y-1">
								<p className="text-sm font-semibold text-foreground">
									{t(
										"tools.password_manager_cannot_recover_title",
									)}
								</p>
								<p className="text-xs text-muted-foreground">
									{t(
										"tools.password_manager_cannot_recover_desc",
									)}
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<KeyRound className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
							<div className="space-y-1">
								<p className="text-sm font-semibold text-foreground">
									{t(
										"tools.password_manager_reset_vault_title",
									)}
								</p>
								<p className="text-xs text-muted-foreground">
									{t(
										"tools.password_manager_reset_vault_desc",
									)}
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
							<div className="space-y-1">
								<p className="text-sm font-semibold text-foreground">
									{t("tools.password_manager_recovery_title")}
								</p>
								<p className="text-xs text-muted-foreground">
									{t("tools.password_manager_recovery_desc")}
								</p>
							</div>
						</div>
					</div>
				</div>
				<DialogFooter className="p-4 bg-muted/20 border-t border-border">
					<DialogClose asChild>
						<Button className="w-full font-semibold rounded-xl">
							{t("common.close", "Close")}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
