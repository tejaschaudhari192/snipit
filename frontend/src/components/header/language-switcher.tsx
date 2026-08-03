import { localStore } from "@/utils/storage";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { UI_LANGUAGES } from "@/constants";

interface LanguageSwitcherProps {
	className?: string;
}

export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
	const { i18n } = useTranslation();
	// Initialize from i18n or localStore to ensure sync
	const [language, setLanguage] = useState(
		localStore.getItem("lang") || i18n.language || "en",
	);

	useEffect(() => {
		// Sync local state when i18n language changes (e.g. from another component instance)
		if (i18n.language && i18n.language !== language) {
			setLanguage(i18n.language);
		}
	}, [i18n.language, language]);

	const handleLanguageChange = (value: string | null) => {
		if (!value) return;
		setLanguage(value);
		i18n.changeLanguage(value);
		localStore.setItem("lang", value);
	};

	return (
		<Select onValueChange={handleLanguageChange} value={language}>
			<SelectTrigger className={className}>
				<span data-slot="select-value">
					{UI_LANGUAGES.find((l) => l.value === language)?.label ||
						"Select Language"}
				</span>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{UI_LANGUAGES.map((lang) => (
						<SelectItem key={lang.value} value={lang.value}>
							{lang.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
};
