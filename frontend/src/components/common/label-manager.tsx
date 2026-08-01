import { useLabels } from "@/hooks/use-labels";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Tag as TagIcon } from "lucide-react";
import { usePaste } from "@/context/PasteContext";
import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LabelsDisplay = lazy(() =>
	import("./labels-display").then((m) => ({ default: m.LabelsDisplay })),
);
const LabelInputSection = lazy(() =>
	import("./label-input-section").then((m) => ({
		default: m.LabelInputSection,
	})),
);

interface LabelManagerProps {
	pasteId?: string;
	className?: string;
	compact?: boolean;
	onLabelsUpdate?: (labels: string[]) => void;
	onEditStateChange?: (isEditing: boolean) => void;
}

export const LabelManager = ({
	pasteId,
	className,
	compact = false,
	onLabelsUpdate,
	onEditStateChange,
}: LabelManagerProps) => {
	const { user } = useAuth();
	const { t } = useTranslation();
	const [showInput, setShowInput] = useState(false);

	const isCreationMode = !pasteId;
	const {
		labels: hookLabels,
		updateLabels,
		allLabels,
		isLoading,
	} = useLabels(pasteId);
	const pasteContext = usePaste();
	const currentLabels = isCreationMode ? pasteContext.labels : hookLabels;

	useEffect(() => {
		onEditStateChange?.(showInput);
	}, [showInput, onEditStateChange]);

	useEffect(() => {
		onLabelsUpdate?.(currentLabels);
	}, [currentLabels, onLabelsUpdate]);

	const handleTagsChange = useCallback(
		(newTags: string[]) => {
			if (isCreationMode) {
				pasteContext.setLabels(newTags);
			} else {
				updateLabels(newTags);
			}
		},
		[isCreationMode, pasteContext, updateLabels],
	);

	if (!user)
		return compact ? null : (
			<div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-lg border border-dashed bg-card/20">
				<TagIcon className="w-4 h-4 opacity-50" />
				<span>{t("common.login_to_label")}</span>
			</div>
		);

	if (isLoading && !isCreationMode) {
		return (
			<div className="flex items-center gap-2 animate-in fade-in duration-500">
				<Skeleton className="h-7 w-20" />
				<Skeleton className="h-7 w-24" />
				<Skeleton className="h-7 w-16" />
			</div>
		);
	}

	return (
		<div className={className}>
			{!compact && (
				<div className="flex items-center gap-2 mb-2 text-[13px] font-semibold text-primary/80">
					<TagIcon className="w-4 h-4" />
					<span>{t("common.labels")}</span>
				</div>
			)}

			<div className="flex flex-wrap items-center gap-2">
				<Suspense fallback={<Skeleton className="h-7 w-24" />}>
					<LabelsDisplay
						labels={currentLabels}
						onRemove={
							isCreationMode
								? undefined
								: (label) =>
										handleTagsChange(
											currentLabels.filter(
												(l) => l !== label,
											),
										)
						}
					/>

					<LabelInputSection
						isCreationMode={isCreationMode}
						showInput={showInput}
						setShowInput={setShowInput}
						currentLabels={currentLabels}
						allLabels={allLabels}
						onTagsChange={handleTagsChange}
						t={t}
					/>
				</Suspense>
			</div>
		</div>
	);
};
