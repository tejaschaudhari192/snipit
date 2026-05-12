import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import { IdAvailabilityIndicator } from "./availability-indicator";
import { useSemanticGenerator } from "@/hooks/paste-id/use-semantic-generator";
import { useIdAvailability } from "@/hooks/paste-id/use-id-availability";

interface Props {
	customId: string;
	setCustomId: (v: string) => void;
	onSubmit: () => void;
}

export const SemanticIdTab = ({ customId, setCustomId, onSubmit }: Props) => {
	const { t } = useTranslation();
	const {
		wordCount,
		setWordCount,
		categories,
		selectedCats,
		isGenerating,
		handleGenerate,
		toggleCategory,
	} = useSemanticGenerator(setCustomId);

	const { isAvailable, isChecking } = useIdAvailability(customId, "semantic");

	return (
		<div className="flex flex-col space-y-3 min-h-[80px]">
			<div className="flex flex-wrap gap-1.5 pt-1 min-h-[24px]">
				{categories.map((cat) => (
					<Badge
						key={cat}
						variant={
							selectedCats.includes(cat) ? "default" : "outline"
						}
						className={cn(
							"cursor-pointer capitalize text-[10px] px-2 py-0 h-5 transition-all",
							selectedCats.includes(cat)
								? "bg-primary/90 hover:bg-primary"
								: "hover:bg-muted text-muted-foreground",
						)}
						onClick={() => toggleCategory(cat)}
					>
						{cat}
					</Badge>
				))}
				{categories.length === 0 && (
					<div className="flex gap-1">
						<Skeleton className="h-5 w-12 bg-muted/40" />
						<Skeleton className="h-5 w-16 bg-muted/40" />
						<Skeleton className="h-5 w-10 bg-muted/40" />
					</div>
				)}
			</div>

			<div className="flex gap-2">
				<Input
					placeholder={t("home.semantic_id_placeholder")}
					value={customId}
					className="h-10 text-sm focus-visible:ring-primary/40 transition-shadow bg-card/40 hover:bg-card/60"
					onChange={(e) => setCustomId(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && onSubmit()}
				/>
				<Button
					variant="outline"
					size="icon"
					className="h-10 w-10 shrink-0 bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary transition-all active:scale-95"
					onClick={handleGenerate}
					disabled={isGenerating}
					title={t("home.semantic_id_generate")}
				>
					<RefreshCw
						className={cn(
							"h-4 w-4",
							isGenerating && "animate-spin",
						)}
					/>
				</Button>
			</div>

			<IdAvailabilityIndicator
				isChecking={isChecking}
				isAvailable={isAvailable}
				customId={customId}
			/>

			<div className="flex items-center gap-3">
				<div className="flex-1 flex items-center gap-3 bg-card/40 border border-border/50 rounded-md px-3 h-10 transition-colors hover:bg-card/60">
					<span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider w-8 shrink-0">
						{t("home.semantic_id_words")}
					</span>
					<input
						type="range"
						min="1"
						max="4"
						step="1"
						value={wordCount}
						onChange={(e) => setWordCount(parseInt(e.target.value))}
						className="flex-1 h-1.5 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary transition-all duration-300 hover:accent-primary/80"
					/>
					<div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
						{wordCount}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SemanticIdTab;
