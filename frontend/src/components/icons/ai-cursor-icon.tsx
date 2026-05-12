import { cn } from "@/utils";

interface AiCursorIconProps {
	className?: string;
}

export const AiCursorIcon = ({ className }: AiCursorIconProps) => {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cn("lucide lucide-ai-cursor", className)}
		>
			{/* I-Beam (Text Cursor) - Shifted Left */}
			<path d="M4 5h4" strokeWidth="2" />
			<path d="M6 5v14" strokeWidth="2" />
			<path d="M4 19h4" strokeWidth="2" />

			{/* Sparkle 1 (Large 4 pointed star - Moved Right) */}
			<path
				d="M16 2l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5 1.5-5z"
				fill="currentColor"
				stroke="none"
			/>

			{/* Sparkle 2 (Medium 4 pointed star - Moved Right) */}
			<path
				d="M20 12l1.2 4 4 1.2-4 1.2-1.2 4-1.2-4-4-1.2 4-1.2 1.2-4z"
				fill="currentColor"
				stroke="none"
				className="opacity-90"
			/>
		</svg>
	);
};
