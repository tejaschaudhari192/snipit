import { useState, useEffect, useCallback } from "react";
import { useApiHelpers } from "@/lib/api";
import { toast } from "sonner";

export const useSemanticGenerator = (setCustomId: (v: string) => void) => {
	const { generateWordId, getWordCategories } = useApiHelpers();
	const [wordCount, setWordCount] = useState(1);
	const [categories, setCategories] = useState<string[]>([]);
	const [selectedCats, setSelectedCats] = useState<string[]>([
		"animals",
		"colors",
	]);
	const [isGenerating, setIsGenerating] = useState(false);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const { categories: fetchedCats } = await getWordCategories();
				setCategories(fetchedCats);
			} catch (error) {
				console.error("Failed to fetch word categories:", error);
			}
		};
		fetchCategories();
	}, [getWordCategories]);

	const handleGenerate = useCallback(async () => {
		setIsGenerating(true);
		try {
			const { id } = await generateWordId(wordCount, selectedCats);
			setCustomId(id);
		} catch (error) {
			console.error("Failed to generate semantic ID:", error);
			toast.error("Failed to generate words");
		} finally {
			setIsGenerating(false);
		}
	}, [wordCount, selectedCats, generateWordId, setCustomId]);

	const toggleCategory = (cat: string) => {
		setSelectedCats((prev) =>
			prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
		);
	};

	return {
		wordCount,
		setWordCount,
		categories,
		selectedCats,
		isGenerating,
		handleGenerate,
		toggleCategory,
	};
};
