import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
	isChecking: boolean;
	isAvailable: boolean | null;
	customId: string;
}

export const IdAvailabilityIndicator = ({
	isChecking,
	isAvailable,
	customId,
}: Props) => {
	const { t } = useTranslation();

	if (!customId.trim()) return null;

	return (
		<p className="text-xs ml-1 flex items-center gap-1 animate-in fade-in duration-200">
			{t("home.dynamic_id_dialog.preview")}{" "}
			<span className="text-primary font-medium truncate">
				/{customId}
			</span>
			{isChecking ? (
				<Loader2 className="h-3 w-3 animate-spin ml-2 text-muted-foreground" />
			) : isAvailable === true ? (
				<span className="flex items-center gap-1 ml-2 text-[11px] text-emerald-500 animate-in zoom-in-50 duration-300">
					<CheckCircle2 className="h-3 w-3" />
					Available
				</span>
			) : isAvailable === false ? (
				<span className="flex items-center gap-1 ml-2 text-[11px] text-red-500 animate-in zoom-in-50 duration-300">
					<XCircle className="h-3 w-3" />
					Taken
				</span>
			) : null}
		</p>
	);
};
