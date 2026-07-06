import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useMonacoConfig = () => {
	const { i18n } = useTranslation();

	useEffect(() => {
		const localeMap: Record<string, string> = {
			ja: "ja",
			de: "de",
		};

		const monacoLocale = localeMap[i18n.language] || "en";

		let isMounted = true;
		import("@monaco-editor/react").then(({ loader }) => {
			if (!isMounted) return;
			loader.config({
				paths: {
					vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs",
				},
				"vs/nls": {
					availableLanguages: {
						"*": monacoLocale,
					},
				},
			});
		});

		return () => {
			isMounted = false;
		};
	}, [i18n.language]);
};

export const MonacoConfig = () => {
	useMonacoConfig();
	return null;
};
