import { cn } from "@/utils";

interface AiPencilIconProps {
	className?: string;
}

export const AiPencilIcon = ({ className }: AiPencilIconProps) => {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cn("lucide lucide-ai-pencil", className)}
		>
			{/* Pencil Body */}
			<path
				d="M21.17 3.06a2.83 2.83 0 0 1 0 4l-9.5 9.5-4 1 1-4 9.5-9.5a2.83 2.83 0 0 1 4 0Z"
				fill="currentColor"
				stroke="none"
			/>
			<path d="M15 5l4 4" stroke="currentColor" strokeWidth="1.5" />

			{/* Main Sparkle (Left) */}
			<path
				d="M6 8l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5z"
				fill="currentColor"
				stroke="none"
			/>

			{/* Top Sparkle */}
			<path
				d="M11 2l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z"
				fill="currentColor"
				stroke="none"
				className="opacity-80"
			/>

			{/* Bottom Sparkle */}
			<path
				d="M17 17l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5z"
				fill="currentColor"
				stroke="none"
				className="opacity-60"
			/>
		</svg>
	);
};
