import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LatexDialogProps {
	isOpen: boolean;
	onClose: () => void;
	initialFormula?: string;
	onSave: (formula: string) => void;
}

export function LatexDialog({
	isOpen,
	onClose,
	initialFormula = "",
	onSave,
}: LatexDialogProps) {
	const [formula, setFormula] = useState(initialFormula);

	useEffect(() => {
		if (isOpen) {
			setFormula(initialFormula);
		}
	}, [isOpen, initialFormula]);

	const handleSave = () => {
		if (formula.trim()) {
			onSave(formula.trim());
		}
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md border border-border/50 bg-background shadow-2xl rounded-2xl p-6 flex flex-col gap-4 z-999999">
				<DialogHeader>
					<DialogTitle className="text-base font-semibold text-foreground">
						Insert LaTeX Formula
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-2">
					<label className="text-xs text-muted-foreground font-medium">
						LaTeX Code
					</label>
					<Input
						type="text"
						placeholder="e.g. E=mc^2"
						value={formula}
						onChange={(e) => setFormula(e.target.value)}
						className="font-mono"
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSave();
						}}
						autoFocus
					/>
				</div>
				<div className="flex justify-end gap-2 mt-2">
					<Button variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Insert Formula</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
