import { Tag as TagIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LabelsDisplayProps {
	labels: string[];
	onRemove?: (label: string) => void;
}

export const LabelsDisplay = ({ labels, onRemove }: LabelsDisplayProps) => (
	<>
		{labels.map((label, index) => (
			<Badge
				key={index}
				variant="secondary"
				className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold uppercase tracking-wider border border-primary/20 animate-in fade-in zoom-in-95 h-7"
			>
				<TagIcon className="w-3 h-3" />
				{label}
				{onRemove && (
					<button
						onClick={(e) => {
							e.preventDefault();
							onRemove(label);
						}}
						className="hover:bg-primary/30 rounded-full p-0.5 transition-colors focus:outline-none ml-1"
					>
						<X className="w-2.5 h-2.5" />
					</button>
				)}
			</Badge>
		))}
	</>
);
