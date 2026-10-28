import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Pin, FolderInput, Trash2 } from "lucide-react-native";
import { Folder } from "../core/vault-storage";
import { CreatableCombobox } from "./ui/creatable-combobox";

interface NotesBulkActionBarProps {
	selectedCount: number;
	totalNotesCount: number;
	allSelected: boolean;
	folders: Folder[];
	theme?: "dark" | "light";
	onSelectAll: () => void;
	onCancel: () => void;
	onPin: () => void;
	onMove: (folderId: string | null) => void;
	onDelete: () => void;
	onCreateFolder?: (name: string, color?: string) => Promise<Folder | void>;
}

export function NotesBulkActionBar({
	selectedCount,
	totalNotesCount,
	allSelected,
	folders,
	theme = "dark",
	onSelectAll,
	onCancel,
	onPin,
	onMove,
	onDelete,
	onCreateFolder,
}: NotesBulkActionBarProps) {
	const isLight = theme === "light";

	return (
		<>
			{/* Bottom Action Bar (Xiaomi/MI Notes inspired 3 actions: Pin, Move to, Delete) */}
			<View
				className={`absolute bottom-0 left-0 right-0 flex-row justify-around items-center border-t z-40 px-4 pt-2.5 ${
					Platform.OS === "ios" ? "h-[88px] pb-6" : "h-[80px] pb-3"
				} ${
					isLight
						? "bg-white/98 border-slate-200 shadow-lg"
						: "bg-slate-900/98 border-slate-800 shadow-2xl"
				}`}
			>
				{/* 1. Pin */}
				<TouchableOpacity
					className="items-center justify-center gap-1 flex-1 py-1"
					onPress={onPin}
					activeOpacity={0.7}
				>
					<Pin
						color={isLight ? "#0f172a" : "#f8fafc"}
						size={22}
						strokeWidth={2.2}
					/>
					<Text
						className={`text-[11px] font-semibold tracking-tight ${
							isLight ? "text-slate-800" : "text-slate-200"
						}`}
					>
						Pin
					</Text>
				</TouchableOpacity>

				{/* 2. Move to (Unified CreatableCombobox) */}
				<View className="flex-1 items-center justify-center">
					<CreatableCombobox
						options={folders.map((f) => ({ id: f.id, label: f.name, color: f.color }))}
						onSelect={(id) => onMove(id ?? null)}
						onCreate={onCreateFolder ? async (name, color) => {
							const created = await onCreateFolder(name, color);
							if (created && created.id) {
								return { id: created.id, label: created.name, color: created.color };
							}
						} : undefined}
						placeholder="Move to folder"
						noneLabel="No Folder (Root)"
						createLabel="Create new folder"
						title={`Move ${selectedCount} Note${selectedCount > 1 ? "s" : ""} to Folder`}
						triggerRender={({ open }) => (
							<TouchableOpacity
								className="items-center justify-center gap-1 py-1 w-full"
								onPress={open}
								activeOpacity={0.7}
							>
								<FolderInput
									color={isLight ? "#0f172a" : "#f8fafc"}
									size={22}
									strokeWidth={2.2}
								/>
								<Text
									className={`text-[11px] font-semibold tracking-tight ${
										isLight ? "text-slate-800" : "text-slate-200"
									}`}
								>
									Move to
								</Text>
							</TouchableOpacity>
						)}
					/>
				</View>

				{/* 3. Delete */}
				<TouchableOpacity
					className="items-center justify-center gap-1 flex-1 py-1"
					onPress={onDelete}
					activeOpacity={0.7}
				>
					<Trash2
						color="#ef4444"
						size={22}
						strokeWidth={2.2}
					/>
					<Text className="text-[11px] font-semibold tracking-tight text-red-500">
						Delete
					</Text>
				</TouchableOpacity>
			</View>
		</>
	);
}
