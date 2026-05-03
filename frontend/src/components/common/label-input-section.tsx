import { Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import { TagInput } from "./tag-input";

interface LabelInputSectionProps {
	isCreationMode: boolean;
	showInput: boolean;
	setShowInput: (show: boolean) => void;
	currentLabels: string[];
	allLabels: string[];
	onTagsChange: (tags: string[]) => void;
	t: (key: string, defaultValue: string) => string;
}

export const LabelInputSection = ({
	isCreationMode,
	showInput,
	setShowInput,
	currentLabels,
	allLabels,
	onTagsChange,
	t,
}: LabelInputSectionProps) => {
	if (isCreationMode) {
		return (
			<TagInput
				tags={currentLabels}
				onTagsChange={onTagsChange}
				suggestions={allLabels}
				placeholder={t("common.add_label", "Add a label...")}
			/>
		);
	}

	if (showInput) {
		return (
			<div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
				<div className="min-w-[200px]">
					<TagInput
						tags={currentLabels}
						onTagsChange={onTagsChange}
						suggestions={allLabels}
						placeholder={t("common.add_label", "Add a label...")}
						autoFocus
						hideTags={true}
					/>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full shrink-0"
					onClick={() => setShowInput(false)}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			className="h-7 gap-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-md"
			onClick={() => setShowInput(true)}
		>
			<Plus className="w-3 h-3" />
			{t("common.add_label", "Add Label")}
		</Button>
	);
};
