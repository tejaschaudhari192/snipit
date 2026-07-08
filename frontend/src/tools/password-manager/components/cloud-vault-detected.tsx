import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Cloud, ServerOff } from "lucide-react";

interface CloudVaultDetectedProps {
	onEnableSync: () => void;
	onStartFresh: () => void;
}

export default function CloudVaultDetected({
	onEnableSync,
	onStartFresh,
}: CloudVaultDetectedProps) {
	const { t } = useTranslation();

	return (
		<div className="h-full w-full flex flex-col items-center justify-center p-4 md:p-8">
			<div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="text-center space-y-4">
					<div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-2 ring-8 ring-primary/5">
						<Cloud className="h-10 w-10 text-primary" />
					</div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("tools.password_manager_cloud_vault_title")}
					</h1>
					<p className="text-muted-foreground">
						{t("tools.password_manager_cloud_vault_desc")}
					</p>
				</div>

				<div className="space-y-4 pt-4">
					<Button
						onClick={onEnableSync}
						size="lg"
						className="w-full rounded-full"
					>
						{t("tools.password_manager_cloud_enable_sync")}
					</Button>
					<Button
						variant="outline"
						onClick={onStartFresh}
						size="lg"
						className="w-full rounded-full"
					>
						<ServerOff className="mr-2 h-4 w-4" />
						{t("tools.password_manager_cloud_start_fresh")}
					</Button>
				</div>
			</div>
		</div>
	);
}
