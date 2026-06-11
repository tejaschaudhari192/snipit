import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en.json";
import mr from "@/locales/mr.json";
import hi from "@/locales/hi.json";
import ja from "@/locales/ja.json";
import de from "@/locales/de.json";
import ta from "@/locales/ta.json";
import te from "@/locales/te.json";
import ml from "@/locales/ml.json";
import kn from "@/locales/kn.json";
import bn from "@/locales/bn.json";
import gu from "@/locales/gu.json";
import pa from "@/locales/pa.json";
import ur from "@/locales/ur.json";

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		mr: { translation: mr },
		hi: { translation: hi },
		ja: { translation: ja },
		de: { translation: de },
		ta: { translation: ta },
		te: { translation: te },
		ml: { translation: ml },
		kn: { translation: kn },
		bn: { translation: bn },
		gu: { translation: gu },
		pa: { translation: pa },
		ur: { translation: ur },
	},
	lng: localStorage.getItem("lang") ?? "en",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
