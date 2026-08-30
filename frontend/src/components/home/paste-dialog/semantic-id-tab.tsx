import { useState } from "react";
import { RefreshCw, Hash, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";
import { useTranslation } from "react-i18next";
import { IdAvailabilityIndicator } from "./availability-indicator";
import {
	useSemanticGenerator,
	WORD_PRESETS,
	CATEGORY_METADATA,
} from "@/hooks/paste-id/use-semantic-generator";
import { useIdAvailability } from "@/hooks/paste-id/use-id-availability";
import { BadgeSkeleton } from "@/components/common/skeletons/common-skeletons";

interface Props {
	customId: string;
	setCustomId: (v: string) => void;
	onSubmit: () => void;
	disabled?: boolean;
	pasteId?: string;
}

export const SemanticIdTab = ({
	customId,
	setCustomId,
	onSubmit,
	disabled = false,
	pasteId,
}: Props) => {
	const { t } = useTranslation();
	const [showCustomCategories, setShowCustomCategories] = useState(false);

	const {
		wordCount,
		setWordCount,
		includeNumber,
		setIncludeNumber,
		activePreset,
		applyPreset,
		categories,
		selectedCats,
		isGenerating,
		handleGenerate,
		toggleCategory,
	} = useSemanticGenerator(setCustomId, customId);

	const { isAvailable, isChecking, isCurrentId } = useIdAvailability(
		customId,
		"semantic",
		pasteId,
	);

	return (
		<div className="flex flex-col space-y-3 min-h-20">
			{/* Preset Vibe Buttons */}
			<div className="flex items-center gap-1.5 flex-wrap">
				{WORD_PRESETS.map((preset) => (
					<button
						key={preset.id}
						type="button"
						disabled={disabled}
						onClick={() => {
							setShowCustomCategories(false);
							applyPreset(preset.id);
						}}
						className={cn(
							"px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer select-none",
							activePreset === preset.id && !showCustomCategories
								? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
								: "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40",
						)}
					>
						<span>{preset.icon}</span>
						<span>{preset.label}</span>
					</button>
				))}

				<button
					type="button"
					disabled={disabled}
					onClick={() => {
						setShowCustomCategories(!showCustomCategories);
						applyPreset("custom");
					}}
					className={cn(
						"px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer select-none ml-auto",
						showCustomCategories || activePreset === "custom"
							? "bg-accent text-accent-foreground border border-accent-foreground/20"
							: "text-muted-foreground hover:text-foreground hover:bg-muted/40",
					)}
					title="Customize categories"
				>
					<SlidersHorizontal className="h-3.5 w-3.5" />
					<span className="text-[11px]">Filters</span>
				</button>
			</div>

			{/* Granular Categories (Collapsible / Custom) */}
			{(showCustomCategories || activePreset === "custom") && (
				<div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-card/40 border border-border/40 animate-in fade-in slide-in-from-top-1 duration-200">
					{categories.map((cat) => {
						const meta = CATEGORY_METADATA[cat] || {
							label: cat,
							icon: "🏷️",
						};
						const isSelected = selectedCats.includes(cat);
						return (
							<Badge
								key={cat}
								variant={isSelected ? "default" : "outline"}
								className={cn(
									"capitalize text-[10px] px-2 py-0.5 h-5.5 transition-all gap-1 cursor-pointer select-none",
									disabled && "opacity-50 cursor-not-allowed",
									isSelected
										? "bg-primary/90 hover:bg-primary text-primary-foreground"
										: "hover:bg-muted text-muted-foreground border-border/50",
								)}
								onClick={() => !disabled && toggleCategory(cat)}
							>
								<span>{meta.icon}</span>
								<span>{meta.label}</span>
							</Badge>
						);
					})}
					{categories.length === 0 && (
						<div className="flex gap-1">
							<BadgeSkeleton className="w-12 bg-muted/40" />
							<BadgeSkeleton className="w-16 bg-muted/40" />
							<BadgeSkeleton className="w-10 bg-muted/40" />
						</div>
					)}
				</div>
			)}

			{/* Input and Refresh */}
			<div className="flex gap-2">
				<Input
					placeholder={t("home.id_generation.semantic_placeholder")}
					value={customId}
					className="h-10 text-sm focus-visible:ring-primary/40 transition-shadow bg-card/40 hover:bg-card/60 font-mono tracking-tight"
					onChange={(e) => setCustomId(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && onSubmit()}
					disabled={disabled}
				/>
				<Button
					type="button"
					variant="outline"
					size="icon"
					className="h-10 w-10 shrink-0 bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary transition-all active:scale-95 cursor-pointer"
					onClick={() => handleGenerate()}
					disabled={disabled || isGenerating}
					title={t("home.id_generation.semantic_generate")}
				>
					<RefreshCw
						className={cn(
							"h-4 w-4 transition-transform duration-500",
							isGenerating && "animate-spin",
						)}
					/>
				</Button>
			</div>

			<IdAvailabilityIndicator
				isChecking={isChecking}
				isAvailable={isAvailable}
				customId={customId}
				isCurrentId={isCurrentId}
			/>

			{/* Controls: Words Count Slider + Number Toggle */}
			<div className="flex items-center gap-2 pt-0.5">
				<div className="flex-1 flex items-center gap-3 bg-card/40 border border-border/50 rounded-xl px-3 h-10 transition-colors hover:bg-card/60">
					<span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider w-8 shrink-0">
						{t("home.id_generation.semantic_words")}
					</span>
					<Input
						type="range"
						min="1"
						max="4"
						step="1"
						value={wordCount}
						onChange={(e) => {
							const nextCount = parseInt(e.target.value);
							setWordCount(nextCount);
							handleGenerate(
								nextCount,
								selectedCats,
								includeNumber,
							);
						}}
						disabled={disabled}
					/>
					<div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
						{wordCount}
					</div>
				</div>

				<Button
					type="button"
					variant={includeNumber ? "default" : "outline"}
					size="sm"
					onClick={() => {
						if (disabled) return;
						const nextNumber = !includeNumber;
						setIncludeNumber(nextNumber);
						handleGenerate(wordCount, selectedCats, nextNumber);
					}}
					disabled={disabled}
					className={cn(
						"h-10 px-3 text-xs gap-1.5 font-medium transition-all shrink-0 rounded-xl cursor-pointer",
						includeNumber
							? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
							: "bg-card/40 hover:bg-card/60 text-muted-foreground hover:text-foreground border-border/50",
					)}
					title={
						includeNumber
							? "Number appended (e.g. -42). Click to remove."
							: "Append random number (e.g. -42)"
					}
				>
					<Hash className="h-3.5 w-3.5" />
					<span>123</span>
				</Button>
			</div>
		</div>
	);
};

export default SemanticIdTab;
