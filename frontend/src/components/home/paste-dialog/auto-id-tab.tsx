import { useTranslation } from "react-i18next";

export const AutoIdTab = () => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col items-center justify-center p-4 rounded-lg bg-card/40 border border-dashed border-border/40 min-h-20">
			<p className="text-[13px] text-muted-foreground font-medium text-center">
				{t("home.paste_system_id_desc")}
			</p>
		</div>
	);
};

export default AutoIdTab;
