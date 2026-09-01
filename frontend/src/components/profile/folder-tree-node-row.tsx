import React from "react";
import type { NodeApi } from "react-arborist";
import {
	Plus,
	Edit,
	Trash2,
	Folder,
	FolderOpen,
	ChevronRight,
	ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FolderTreeNode } from "@/context/FolderContext";

interface FolderTreeNodeRowProps {
	node: NodeApi<FolderTreeNode>;
	style: React.CSSProperties;
	dragHandle?: (el: HTMLDivElement | null) => void;
	isSelected: boolean;
	onSelect: (id: string) => void;
	onCreateSubfolder: (id: string) => void;
	onDelete: (id: string) => void;
}

export const FolderTreeNodeRow: React.FC<FolderTreeNodeRowProps> = ({
	node,
	style,
	dragHandle,
	isSelected,
	onSelect,
	onCreateSubfolder,
	onDelete,
}) => {
	const { t } = useTranslation();
	const hasChildren = node.children && node.children.length > 0;

	return (
		<div
			style={style}
			ref={dragHandle}
			onClick={() => onSelect(node.id)}
			className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
				isSelected
					? "bg-primary/15 text-primary font-extrabold shadow-xs"
					: "hover:bg-muted/60 text-foreground/85"
			}`}
		>
			<div className="flex items-center gap-2 min-w-0 flex-1">
				{/* Expand / Collapse Indicator */}
				{hasChildren ? (
					<button
						onClick={(e) => {
							e.stopPropagation();
							node.toggle();
						}}
						className="p-1 text-muted-foreground hover:text-foreground rounded-md"
					>
						{node.isOpen ? (
							<ChevronDown className="w-4 h-4 shrink-0" />
						) : (
							<ChevronRight className="w-4 h-4 shrink-0" />
						)}
					</button>
				) : (
					<span className="w-5 shrink-0" />
				)}

				{/* Folder Icon */}
				{node.isOpen ? (
					<FolderOpen
						className="w-4.5 h-4.5 shrink-0 text-primary transition-transform group-hover:scale-105"
						style={{
							color: node.data.color || undefined,
						}}
					/>
				) : (
					<Folder
						className="w-4.5 h-4.5 shrink-0 text-primary/80 transition-transform group-hover:scale-105"
						style={{
							color: node.data.color || undefined,
						}}
					/>
				)}

				{/* Folder Name */}
				{node.isEditing ? (
					<input
						type="text"
						defaultValue={node.data.name}
						onFocus={(e) => e.target.select()}
						onBlur={(e) => node.submit(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter")
								node.submit(e.currentTarget.value);
							if (e.key === "Escape") node.reset();
						}}
						autoFocus
						className="bg-background border border-primary text-xs px-2 py-0.5 rounded-md w-full outline-none font-medium"
					/>
				) : (
					<span className="truncate text-xs font-semibold">
						{node.data.name}
					</span>
				)}
			</div>

			{/* Action buttons on hover */}
			<div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
				<button
					onClick={(e) => {
						e.stopPropagation();
						onCreateSubfolder(node.id);
					}}
					className="p-1 text-muted-foreground hover:text-primary hover:bg-muted/80 rounded-md transition-colors"
					title={t("folders.create_subfolder")}
				>
					<Plus className="w-3.5 h-3.5" />
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						node.edit();
					}}
					className="p-1 text-muted-foreground hover:text-primary hover:bg-muted/80 rounded-md transition-colors"
					title={t("folders.rename")}
				>
					<Edit className="w-3.5 h-3.5" />
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onDelete(node.id);
					}}
					className="p-1 text-muted-foreground hover:text-destructive hover:bg-muted/80 rounded-md transition-colors"
					title={t("folders.delete")}
				>
					<Trash2 className="w-3.5 h-3.5" />
				</button>
			</div>
		</div>
	);
};
