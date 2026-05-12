import { Cloud, AlertCircle, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "./status-badge";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutosaveStatusProps {
	status: SaveStatus;
}

export const AutosaveStatus = ({ status }: AutosaveStatusProps) => {
	const { t } = useTranslation();

	switch (status) {
		case "saving":
			return (
				<StatusBadge
					className="text-primary"
					labelClassName="opacity-70"
					label={t("common.saving")}
					icon={
						<Cloud className="h-4 w-4 fill-primary/10 animate-pulse" />
					}
				/>
			);
		case "error":
			return (
				<StatusBadge
					className="text-destructive animate-bounce"
					label={t("common.save_failed")}
					icon={
						<>
							<Cloud className="h-4 w-4 text-destructive opacity-50" />
							<AlertCircle className="absolute h-2.5 w-2.5 text-destructive fill-background" />
						</>
					}
				/>
			);
		case "saved":
			return (
				<StatusBadge
					className="text-emerald-500 animate-in fade-in slide-in-from-left-2"
					labelClassName="opacity-80"
					label={t("common.saved")}
					icon={
						<>
							<Cloud className="h-4 w-4 fill-emerald-500/10" />
							<Check className="absolute h-2 w-2 text-emerald-500 font-black" />
						</>
					}
				/>
			);
		default:
			return null;
	}
};
