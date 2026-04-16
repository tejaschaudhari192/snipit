import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/**
 * A hook to dynamically update the document title.
 * @param titleKey Optional translation key for the title
 * @param override title string to use if titleKey is not provided
 */
export const usePageTitle = (titleKey?: string, override?: string) => {
	const { t } = useTranslation();

	useEffect(() => {
		const baseTitle = "Snipit";
		let pageTitle = "";

		if (override) {
			pageTitle = override;
		} else if (titleKey) {
			pageTitle = t(titleKey);
		}

		document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;
	}, [titleKey, override, t]);
};
