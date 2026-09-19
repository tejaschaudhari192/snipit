export interface ColorOption {
	label: string;
	color: string;
	bgClass?: string;
}

export const TEXT_COLORS: ColorOption[] = [
	{ label: "Purple", color: "#9333ea", bgClass: "bg-purple-600" },
	{ label: "Pink", color: "#ec4899", bgClass: "bg-pink-500" },
	{ label: "Blue", color: "#2563eb", bgClass: "bg-blue-600" },
	{ label: "Green", color: "#16a34a", bgClass: "bg-green-600" },
	{ label: "Red", color: "#dc2626", bgClass: "bg-red-600" },
];

export const HIGHLIGHT_COLORS: ColorOption[] = [
	{ label: "Yellow", color: "#fef08a", bgClass: "bg-yellow-200" },
	{ label: "Green", color: "#bbf7d0", bgClass: "bg-green-200" },
	{ label: "Blue", color: "#bfdbfe", bgClass: "bg-blue-200" },
	{ label: "Pink", color: "#fbcfe8", bgClass: "bg-pink-200" },
	{ label: "Purple", color: "#ddd6fe", bgClass: "bg-purple-200" },
];
