import { useContext } from "react";
import { TtsContext } from "@/context";

/**
 * Hook to consume the global Text-to-Speech context.
 */
export const useTts = () => {
	const context = useContext(TtsContext);
	if (!context) {
		throw new Error("useTts must be used within a TtsProvider");
	}
	return context;
};
