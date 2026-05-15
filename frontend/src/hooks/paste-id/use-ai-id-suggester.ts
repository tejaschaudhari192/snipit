import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import api from "@/lib/api";
import { type AiIdFileContext } from "@/types";

export const useAiIdSuggester = (
	textValue: string | undefined,
	setCustomId: (v: string) => void,
	files?: AiIdFileContext[],
) => {
	const { t } = useTranslation();
	const [isSuggesting, setIsSuggesting] = useState(false);

	const handleSuggestId = async () => {
		const content = textValue || "";
		const hasContent = content.trim();
		const hasFiles = files && files.length > 0;

		if (!hasContent && !hasFiles) {
			toast.warning(t("messages.empty_content"));
			return;
		}

		setIsSuggesting(true);
		try {
			const response = await api.post("/ai/suggest-id", {
				content,
				files: files?.map((f) => ({
					name: f.name || f.fileName,
					type: f.mimeType || f.fileMimeType,
				})),
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
