import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LinkDialogProps {
	isOpen: boolean;
	onClose: () => void;
	initialUrl?: string;
	onSave: (url: string) => void;
}

export function LinkDialog({
	isOpen,
	onClose,
	initialUrl = "",
	onSave,
}: LinkDialogProps) {
	const [url, setUrl] = useState(initialUrl);

	useEffect(() => {
		if (isOpen) {
			setUrl(initialUrl);
		}
	}, [isOpen, initialUrl]);

	const handleSave = () => {
		onSave(url.trim());
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md border border-border/50 bg-background shadow-2xl rounded-2xl p-6 flex flex-col gap-4 z-999999">
				<DialogHeader>
					<DialogTitle className="text-base font-semibold text-foreground">
						Insert Link
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-2">
					<label className="text-xs text-muted-foreground font-medium">
						Link URL
					</label>
					<Input
						type="text"
						placeholder="https://example.com"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
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
					<Button onClick={handleSave}>Save Link</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
