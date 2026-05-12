import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import api from "@/lib/api";

export const useAiIdSuggester = (
	textValue: string,
	setCustomId: (v: string) => void,
) => {
	const { t } = useTranslation();
	const [isSuggesting, setIsSuggesting] = useState(false);

	const handleSuggestId = async () => {
		if (!textValue.trim()) {
			toast.warning(t("messages.empty_content"));
			return;
		}

		setIsSuggesting(true);
		try {
			const response = await api.post("/ai/suggest-id", {
				content: textValue,
			});
			if (response.data?.id) {
				setCustomId(response.data.id);
				toast.success(t("home.ai_id_suggested"));
			}
		} catch (error) {
			console.error("Failed to suggest ID:", error);
			toast.error(t("errors.ai_failed"));
		} finally {
			setIsSuggesting(false);
		}
	};

	return { isSuggesting, handleSuggestId };
};
