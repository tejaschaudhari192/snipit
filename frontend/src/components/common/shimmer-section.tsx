import { ShimmerText, ShimmerDiv, ShimmerButton } from "shimmer-effects-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

interface ShimmerSectionProps {
	type?:
		| "card"
		| "text"
		| "editor"
		| "toolbar"
		| "button"
		| "loader"
		| "mini-loader"
		| "metadata";
	className?: string;
	lines?: number;
}

export const ShimmerSection = ({
	type = "text",
	className,
	lines = 3,
}: ShimmerSectionProps) => {
	const { theme } = useTheme();
	const mode = theme === "dark" ? "dark" : "light";

	switch (type) {
		case "card":
			return (
				<div
					className={cn(
						"group block glass-card p-5 space-y-5 transition-all duration-300",
						className,
					)}
				>
					{/* Header Row */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<ShimmerDiv
								height={24}
								width={80}
								rounded={6}
								mode={mode}
							/>
							<ShimmerDiv
								height={16}
								width={60}
								rounded={4}
								mode={mode}
							/>
						</div>
						<div className="flex items-center gap-3">
							<ShimmerDiv
								height={16}
								width={100}
								rounded={4}
								mode={mode}
							/>
						</div>
					</div>

					{/* Content Block */}
					<div className="bg-muted/30 rounded-lg p-4 border border-border/20">
						<ShimmerText line={2} gap={10} mode={mode} />
					</div>

					{/* Footer Row */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<ShimmerDiv
								height={20}
								width={70}
								rounded={6}
								mode={mode}
							/>
							<ShimmerDiv
								height={20}
								width={80}
								rounded={6}
								mode={mode}
							/>
						</div>
						<ShimmerDiv
							height={16}
							width={40}
							rounded={4}
							mode={mode}
						/>
					</div>
				</div>
			);
		case "editor":
			return (
				<div
					className={cn(
						"flex-1 p-6 space-y-6 rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/20 shadow-sm ring-1 ring-border/5 min-h-[500px]",
						className,
					)}
				>
					<div className="flex items-center gap-2 border-b pb-4 border-border/20">
						{[...Array(6)].map((_, i) => (
							<ShimmerDiv
								key={i}
								height={32}
								width={32}
								rounded={8}
								mode={mode}
							/>
						))}
						<div className="flex-1" />
						<ShimmerDiv
							height={32}
							width={100}
							rounded={8}
							mode={mode}
							className="!bg-muted-foreground/10 dark:!bg-muted/20"
						/>
					</div>
					<div className="space-y-4 py-4">
						<ShimmerText line={20} gap={14} mode={mode} />
					</div>
				</div>
			);
		case "toolbar":
			return (
				<div
					className={cn(
						"flex items-center justify-between gap-4 p-2.5 px-4 rounded-2xl bg-muted/60 dark:bg-muted/20 border border-border/30 dark:border-border/20 shadow-sm transition-all duration-300",
						className,
					)}
				>
					<div className="flex items-center gap-2">
						<ShimmerDiv
							height={36}
							width={100}
							rounded={8}
							mode={mode}
							className="!bg-muted-foreground/20 dark:!bg-muted/30"
						/>
						<ShimmerDiv
							height={36}
							width={80}
							rounded={8}
							mode={mode}
							className="hidden sm:block !bg-muted-foreground/10 dark:!bg-muted/20"
						/>
						<ShimmerDiv
							height={36}
							width={80}
							rounded={8}
							mode={mode}
							className="hidden sm:block !bg-muted-foreground/10 dark:!bg-muted/20"
						/>
					</div>
					<div className="flex items-center gap-2">
						<ShimmerDiv
							height={36}
							width={120}
							rounded={8}
							mode={mode}
							className="!bg-muted-foreground/20 dark:!bg-muted/30"
						/>
					</div>
				</div>
			);

		case "metadata":
			return (
				<div
					className={cn(
						"flex items-center gap-4 py-3 px-6 bg-muted/30 dark:bg-muted/10 border-y border-border/20 transition-all duration-300",
						className,
					)}
				>
					<ShimmerDiv
						height={18}
						width={120}
						mode={mode}
						rounded={4}
						className="!bg-muted-foreground/20 dark:!bg-muted/30"
					/>
					<div className="w-px h-3 bg-border/40 hidden sm:block" />
					<ShimmerDiv
						height={18}
						width={150}
						mode={mode}
						rounded={4}
						className="!bg-muted-foreground/20 dark:!bg-muted/30"
					/>
					<div className="w-px h-3 bg-border/40 hidden sm:block" />
					<ShimmerDiv
						height={18}
						width={80}
						mode={mode}
						rounded={4}
						className="!bg-muted-foreground/20 dark:!bg-muted/30"
					/>
				</div>
			);
		case "button":
			return (
				<ShimmerButton
					size="md"
					className={cn("rounded-lg", className)}
					mode={mode}
				/>
			);
		case "loader":
			return (
				<div
					className={cn(
						"flex items-center justify-center p-4",
						className,
					)}
				>
					<ShimmerDiv
						height={40}
						width={40}
						rounded={9999}
						mode={mode}
					/>
				</div>
			);
		case "mini-loader":
			return (
				<ShimmerDiv
					height={20}
					width={20}
					rounded={9999}
					mode={mode}
					className={className}
				/>
			);
		case "text":
		default:
			return (
				<ShimmerText
					line={lines}
					gap={10}
					className={className}
					mode={mode}
				/>
			);
	}
};
