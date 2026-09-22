import { cn } from "@/utils";

interface MediaCircularProgressProps {
	progress: number;
	filename?: string;
	size?: number;
	strokeWidth?: number;
	className?: string;
}

export function MediaCircularProgress({
	progress,
	filename,
	size = 80,
	strokeWidth = 5,
	className,
}: MediaCircularProgressProps) {
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (progress / 100) * circumference;

	// Truncate filename if too long
	const displayName = filename
		? filename.length > 25
			? filename.slice(0, 22) + "..."
			: filename
		: "";

	return (
		<svg
			className={cn("block transform -rotate-90", className)}
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			preserveAspectRatio="xMidYMid meet"
			aria-hidden="true"
			role="img"
			aria-label={`Upload progress: ${Math.round(progress)}%`}
		>
			{/* Background track */}
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				className="text-muted-foreground/30"
			/>
			{/* Progress ring */}
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				className="text-primary transition-all duration-300 ease-out"
				style={{ transition: "stroke-dashoffset 0.3s ease-out" }}
			/>
			{/* Center content */}
			<g textAnchor="middle" dominantBaseline="middle">
				<text
					x={size / 2}
					y={size / 2 - (displayName ? 10 : 0)}
					fontSize={size * 0.2}
					fontWeight="700"
					fill="currentColor"
					className="text-foreground"
				>
					{Math.round(progress)}%
				</text>
				{displayName && (
					<text
						x={size / 2}
						y={size / 2 + 18}
						fontSize={size * 0.09}
						fontWeight="500"
						fill="currentColor"
						className="text-muted-foreground"
					>
						{displayName}
					</text>
				)}
			</g>
		</svg>
	);
}
