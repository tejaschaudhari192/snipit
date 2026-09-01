import React from "react";
import { Plus, FolderPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmptyFolderTreeProps {
	onCreate: () => void;
}

export const EmptyFolderTree: React.FC<EmptyFolderTreeProps> = ({
	onCreate,
}) => {
	const { t } = useTranslation();

	return (
		<div className="text-center py-6 px-4 border border-dashed rounded-2xl border-border/60 bg-muted/10 transition-all hover:bg-muted/20">
			<FolderPlus className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
			<p className="text-xs text-muted-foreground font-medium mb-2">
				{t("folders.empty_hint")}
			</p>
			<button
				onClick={onCreate}
				className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
			>
				<Plus className="w-4 h-4" />
				<span>{t("folders.create_new")}</span>
			</button>
		</div>
	);
};
