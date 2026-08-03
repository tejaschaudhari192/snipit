import { Cloud, AlertCircle, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "./status-badge";
import { Spinner } from "@/components/ui/spinner";

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
					label={
						<span
							style={
								{
									"--highlight-color": "var(--foreground)",
									"--base-color": "var(--muted-foreground)",
									"--spread": "20px",
									"--duration": "2s",
								} as React.CSSProperties
							}
							className="shimmer font-medium"
						>
							{t("common.states.saving")}
						</span>
					}
					icon={
						<Spinner className="h-3 w-3 text-primary animate-spin" />
					}
				/>
			);
		case "error":
			return (
				<StatusBadge
					className="text-destructive animate-bounce"
					label={t("common.states.save_failed")}
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
					label={t("common.states.saved")}
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
