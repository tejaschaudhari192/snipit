import { useState, useCallback } from "react";
import { toast } from "@/components/ui/toast";
import { useTranslation } from "react-i18next";
import { isSnipitDrawing } from "@/utils";

interface UseAiDrawProps {
	setDrawRevision: (val: number | ((p: number) => number)) => void;
	setTextValue: (val: string) => void;
	textValue?: string;
}

export const useAiDraw = ({
	setDrawRevision,
	setTextValue,
	textValue = "",
}: UseAiDrawProps) => {
	const { t } = useTranslation();
	const [isAiDrawDialogOpen, setIsAiDrawDialogOpen] = useState(false);

	const handleAiDrawApply = useCallback(
		(elementsJson: string, clearBoard: boolean) => {
			try {
				if (!elementsJson || elementsJson === "[]") return;

				let elements = JSON.parse(elementsJson);

				// Handle case where AI might return { elements: [...] } instead of just [...]
				if (elements && !Array.isArray(elements) && elements.elements) {
					elements = elements.elements;
				}

				if (!elements || !Array.isArray(elements)) {
					console.error(
						"AI response is not an array of elements",
						elements,
					);
					return;
				}

				// Excalidraw content in Snipit is stored as { elements, appState }
				const newDrawing = {
					elements: elements,
					appState: {
						viewBackgroundColor: "#ffffff",
						currentItemFontFamily: 1,
					},
				};

				const drawingStr = JSON.stringify(newDrawing);

				if (clearBoard) {
					setTextValue(drawingStr);
				} else {
					// Merge with existing if it's a drawing
					const currentText = textValue;
					if (isSnipitDrawing(currentText)) {
						try {
							const currentDrawing = JSON.parse(currentText);
							const mergedElements = [
								...(currentDrawing.elements || []),
								...elements,
							];
							setTextValue(
								JSON.stringify({
									...currentDrawing,
									elements: mergedElements,
								}),
							);
						} catch {
							setTextValue(drawingStr);
						}
					} else {
						setTextValue(drawingStr);
					}
				}

				setDrawRevision((prev) => prev + 1);
				setIsAiDrawDialogOpen(false);
				toast.add({
					title: t("common.success"),
					type: "success",
				});
			} catch (error) {
				console.error("Failed to apply AI drawing:", error);
				toast.add({
					title: t("common.error"),
					type: "error",
				});
			}
		},
		[setDrawRevision, setTextValue, textValue, t],
	);

	return {
		isAiDrawDialogOpen,
		setIsAiDrawDialogOpen,
		handleAiDrawApply,
	};
};
