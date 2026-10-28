import { useState, useCallback, useEffect } from "react";
import { generatePassword, generatePassphrase, SeparatorType } from "../core/crypto";

export function usePasswordGenerator() {
	const [isOpen, setIsOpen] = useState(false);
	const [targetField, setTargetField] = useState<"password" | "apikey" | null>(null);
	const [length, setLength] = useState(15);
	const [wordCount, setWordCount] = useState(3);
	const [pronounceable, setPronounceable] = useState(true);
	const [uppercase, setUppercase] = useState(true);
	const [numbers, setNumbers] = useState(true);
	const [separator, setSeparator] = useState<SeparatorType>("hyphen");
	const [generatedPass, setGeneratedPass] = useState("");

	const refresh = useCallback(() => {
		if (pronounceable) {
			const pass = generatePassphrase({
				wordCount,
				separator,
				capitalize: uppercase,
				includeNumber: numbers,
			});
			setGeneratedPass(pass);
		} else {
			const pass = generatePassword({
				length,
				uppercase,
				numbers,
				symbols: true,
				lowercase: true,
				strict: true,
			});
			setGeneratedPass(pass);
		}
	}, [pronounceable, wordCount, separator, uppercase, numbers, length]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const openForField = useCallback((field: "password" | "apikey") => {
		setTargetField(field);
		setIsOpen(true);
	}, []);

	return {
		isOpen,
		setIsOpen,
		targetField,
		setTargetField,
		openForField,
		length,
		setLength,
		wordCount,
		setWordCount,
		pronounceable,
		setPronounceable,
		uppercase,
		setUppercase,
		numbers,
		setNumbers,
		separator,
		setSeparator,
		generatedPass,
		refresh,
	};
}
