import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useApiHelpers } from "@/lib/api";
import { CONFIG } from "@/configurations";

export const useLanguageDetection = () => {
	const [isDetecting, setIsDetecting] = useState(false);
	const apiHelpers = useApiHelpers();
	const { t } = useTranslation();

	const detectLanguage = async (content: string) => {
		if (!content.trim()) return null;

		setIsDetecting(true);
		const startTime = Date.now();
		try {
			const result = await apiHelpers.detectLanguage(content);

			// Maintain loader for at least DETECTION_DELAY to avoid flickering
			const elapsedTime = Date.now() - startTime;
			const remainingDelay = CONFIG.ui.detectionDelay - elapsedTime;

			if (remainingDelay > 0) {
				await new Promise((resolve) =>
					setTimeout(resolve, remainingDelay),
				);
			}

			if (result.language && result.language !== "text") {
				const detectedLang =
					result.language === "bash" ? "shell" : result.language;
				toast.success(
					t("home.detected_language", { language: detectedLang }),
				);
				return { language: detectedLang, isCode: true };
			} else if (result.language === "text") {
				return { language: "text", isCode: false };
			}
			return null;
		} catch (error) {
			console.error("Failed to detect language", error);
			return null;
		} finally {
			setIsDetecting(false);
		}
	};

	return {
		isDetecting,
		detectLanguage,
	};
};
