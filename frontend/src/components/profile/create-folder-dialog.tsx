import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFolders } from "@/context/FolderContext";
import { Folder } from "lucide-react";
import { FOLDER_COLORS } from "@/constants";

import { type FolderData } from "@/types/pastes";

interface CreateFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	parentId?: string | null;
	folderToEdit?: FolderData;
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
	open,
	onOpenChange,
	parentId = null,
	folderToEdit,
}) => {
	const { createFolder, renameFolder } = useFolders();
	const [name, setName] = useState("");
	const [selectedColor, setSelectedColor] = useState("");

	useEffect(() => {
		if (open) {
			if (folderToEdit) {
				setName(folderToEdit.name);
				setSelectedColor(folderToEdit.color || "");
			} else {
				setName("");
				setSelectedColor("");
			}
		}
	}, [open, folderToEdit]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const folderName = name.trim();
		if (!folderName) return;

		onOpenChange(false);

		if (folderToEdit) {
			renameFolder(folderToEdit._id, folderName, selectedColor || null);
		} else {
			createFolder(folderName, parentId, selectedColor || null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<form onSubmit={handleSubmit} className="space-y-4">
					<DialogHeader>
						<DialogTitle>
							{folderToEdit ? "Rename Folder" : "New Folder"}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-3">
						<div className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg border border-border/50">
							<Folder
								className="w-8 h-8 shrink-0"
								style={{ color: selectedColor || undefined }}
							/>
							<Input
								type="text"
								placeholder="Folder name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-10"
								autoFocus
								required
							/>
						</div>

						{/* Color Picker */}
						<div className="space-y-1.5">
							<span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
								Color Tag
							</span>
							<div className="flex flex-wrap gap-2">
								{FOLDER_COLORS.map((color) => (
									<button
										key={color.name}
										type="button"
										onClick={() =>
											setSelectedColor(color.hex)
										}
										className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
											selectedColor === color.hex
												? "ring-2 ring-primary scale-110 border-transparent"
												: "border-border hover:scale-105"
										}`}
										style={{
											backgroundColor:
												color.hex ||
												"rgba(100, 116, 139, 0.1)",
										}}
										title={color.name}
									/>
								))}
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!name.trim()}>
							{folderToEdit ? "Save" : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
