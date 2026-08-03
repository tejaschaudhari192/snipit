import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";
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
			toast.add({ title: t("messages.validation.empty_content"), type: "warning" });
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
				toast.add({
					title: t("home.id_generation.ai_suggested"),
					type: "success",
				});
			}
		} catch (error) {
			console.error("Failed to suggest ID:", error);
			toast.add({ title: t("errors.ai_failed"), type: "error" });
		} finally {
			setIsSuggesting(false);
		}
	};

	return { isSuggesting, handleSuggestId };
};
