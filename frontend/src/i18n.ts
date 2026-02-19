import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import mr from "@/locales/mr.json";
import hi from "@/locales/hi.json";
import ja from "@/locales/ja.json";
import de from "@/locales/de.json";

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		mr: { translation: mr },
		hi: { translation: hi },
		ja: { translation: ja },
		de: { translation: de },
	},
	lng: localStorage.getItem("lang") ?? "en",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
