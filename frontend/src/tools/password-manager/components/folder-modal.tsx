import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/utils";
import { FolderPlus, Pencil, Trash2 } from "lucide-react";

const PRESET_COLORS = [
	"#ef4444", // red
	"#f97316", // orange
	"#eab308", // yellow
	"#22c55e", // green
	"#3b82f6", // blue
	"#8b5cf6", // purple
	"#ec4899", // pink
	"#71717a", // gray
];

export type FolderModalMode = "create" | "edit" | "delete";

interface FolderModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: FolderModalMode;
	initialFolderName: string;
	initialFolderColor: string;
	onSave: (name: string, color: string) => void;
	onDelete: (deletePasswords: boolean) => void;
}

export function FolderModal({
	open,
	onOpenChange,
	mode,
	initialFolderName,
	initialFolderColor,
	onSave,
	onDelete,
}: FolderModalProps) {
	const { t } = useTranslation();
	const [folderName, setFolderName] = useState(initialFolderName);
	const [folderColor, setFolderColor] = useState(initialFolderColor);
	const [deletePasswords, setDeletePasswords] = useState(false);

	useEffect(() => {
		if (open) {
			setFolderName(initialFolderName);
			setFolderColor(initialFolderColor);
			setDeletePasswords(false);
		}
	}, [open, initialFolderName, initialFolderColor]);

	const handleSave = () => {
		if (mode === "delete") {
			onDelete(deletePasswords);
		} else {
			if (!folderName.trim()) return;
			onSave(folderName, folderColor);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-md bg-background"
				aria-describedby={undefined}
			>
				<DialogHeader className="text-left">
					<div className="flex items-center gap-3">
						<div className={cn(
							"flex items-center justify-center w-10 h-10 rounded-full",
							mode === "delete" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
						)}>
							{mode === "create" && <FolderPlus className="h-5 w-5" />}
							{mode === "edit" && <Pencil className="h-5 w-5" />}
							{mode === "delete" && <Trash2 className="h-5 w-5" />}
						</div>
						<DialogTitle className="text-xl">
							{mode === "create" && t("tools.password_manager_add_folder")}
							{mode === "edit" && "Edit Folder"}
							{mode === "delete" && "Delete Folder"}
						</DialogTitle>
					</div>
					{mode === "delete" && (
						<div className="space-y-4">
							<DialogDescription>
								Are you sure you want to delete the folder <span className="font-medium text-foreground">"{folderName}"</span>?
							</DialogDescription>
							
							<div className="flex items-start space-x-3 p-4 bg-muted/50 border rounded-md">
								<Checkbox 
									id="delete-passwords" 
									checked={deletePasswords} 
									onCheckedChange={(c) => setDeletePasswords(c as boolean)} 
									className="mt-0.5"
								/>
								<div className="space-y-1 leading-none">
									<label htmlFor="delete-passwords" className="text-sm font-medium cursor-pointer">
										Delete all passwords inside this folder
									</label>
									<p className="text-xs text-muted-foreground">
										This action cannot be undone.
									</p>
								</div>
							</div>
						</div>
					)}
				</DialogHeader>

				{mode !== "delete" && (
					<div className="flex flex-col gap-5 py-2">
						<div className="space-y-2">
							<label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
								Folder Name
							</label>
							<Input
								autoFocus
								value={folderName}
								onChange={(e) => setFolderName(e.target.value)}
								placeholder={t("tools.password_manager_new_folder_placeholder")}
								className="h-10"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSave();
								}}
							/>
						</div>
						
						<div className="space-y-3">
							<label className="text-sm font-medium leading-none">
								Folder Color
							</label>
							<div className="flex flex-wrap gap-3">
								{PRESET_COLORS.map(color => (
									<button
										key={color}
										type="button"
										onClick={() => setFolderColor(color)}
										className={cn(
											"w-8 h-8 rounded-full border-2 ring-offset-background transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
											folderColor === color 
												? "border-foreground scale-110 shadow-sm" 
												: "border-transparent shadow-sm"
										)}
										style={{ backgroundColor: color }}
										aria-label={`Select color ${color}`}
									/>
								))}
								
								<div className="relative">
									<button
										type="button"
										className={cn(
											"w-8 h-8 rounded-full border-2 flex items-center justify-center ring-offset-background transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
											!PRESET_COLORS.includes(folderColor) 
												? "border-foreground scale-110 shadow-sm" 
												: "border-transparent shadow-sm"
										)}
										style={
											!PRESET_COLORS.includes(folderColor) 
												? { backgroundColor: folderColor } 
												: { background: "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #06b6d4, #3b82f6, #d946ef, #ef4444)" }
										}
										title="Custom color"
									/>
									<input
										type="color"
										value={folderColor}
										onChange={(e) => setFolderColor(e.target.value)}
										className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
										title="Custom color"
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("cancel")}
					</Button>
					<Button
						variant={mode === "delete" ? "destructive" : "default"}
						onClick={handleSave}
					>
						{mode === "delete" ? t("delete") : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
