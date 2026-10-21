import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform, Modal, ScrollView, TextInput } from "react-native";
import { Pin, FolderInput, Trash2, X, Plus, Folder as FolderIcon, Check } from "lucide-react-native";
import { Folder } from "../core/vault-storage";

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
	const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [newFolderColor, setNewFolderColor] = useState("#3b82f6");

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

				{/* 2. Move to */}
				<TouchableOpacity
					className="items-center justify-center gap-1 flex-1 py-1"
					onPress={() => setIsMoveModalOpen(true)}
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

			{/* Move to Folder Bottom Sheet Modal */}
			<Modal
				visible={isMoveModalOpen}
				transparent
				animationType="slide"
				onRequestClose={() => setIsMoveModalOpen(false)}
			>
				<View className="flex-1 justify-end bg-black/60">
					<View
						className={`rounded-t-3xl p-5 max-h-[75%] border-t ${
							isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
						}`}
					>
						{/* Sheet Header */}
						<View className="flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
							<View>
								<Text className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
									Move to Folder
								</Text>
								<Text className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
									Moving {selectedCount} note{selectedCount > 1 ? "s" : ""}
								</Text>
							</View>
							<TouchableOpacity
								onPress={() => setIsMoveModalOpen(false)}
								className={`p-2 rounded-full ${isLight ? "bg-slate-100" : "bg-slate-800"}`}
							>
								<X color={isLight ? "#475569" : "#cbd5e1"} size={18} />
							</TouchableOpacity>
						</View>

						{/* Inline Create Folder */}
						{isCreatingFolder ? (
							<View
								className={`p-3 my-2 rounded-2xl border ${
									isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/80 border-slate-700"
								}`}
							>
								<TextInput
									className={`text-sm font-semibold px-3 py-2 rounded-xl border ${
										isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-700 text-white"
									}`}
									placeholder="New folder name..."
									placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
									value={newFolderName}
									onChangeText={setNewFolderName}
									autoFocus
								/>
								<View className="flex-row items-center justify-between mt-3 pt-1 border-t border-slate-200/50">
									<View className="flex-row items-center gap-1.5">
										{["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((col) => (
											<TouchableOpacity
												key={col}
												onPress={() => setNewFolderColor(col)}
												className={`w-6 h-6 rounded-full ${newFolderColor === col ? "border-2 border-white scale-110" : ""}`}
												style={{ backgroundColor: col }}
											/>
										))}
									</View>
									<View className="flex-row items-center gap-2">
										<TouchableOpacity
											onPress={() => {
												setIsCreatingFolder(false);
												setNewFolderName("");
											}}
											className="px-2.5 py-1.5"
										>
											<Text className={`text-xs font-semibold ${isLight ? "text-slate-500" : "text-slate-400"}`}>Cancel</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={async () => {
												if (!newFolderName.trim() || !onCreateFolder) return;
												const created = await onCreateFolder(newFolderName.trim(), newFolderColor);
												if (created && created.id) {
													onMove(created.id);
													setIsMoveModalOpen(false);
												}
												setNewFolderName("");
												setIsCreatingFolder(false);
											}}
											className="px-3 py-1.5 rounded-lg bg-blue-600"
											activeOpacity={0.8}
										>
											<Text className="text-xs font-bold text-white">Create & Move</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						) : (
							onCreateFolder && (
								<TouchableOpacity
									onPress={() => setIsCreatingFolder(true)}
									className="flex-row items-center gap-2 py-3 px-3 rounded-2xl bg-blue-600/10 mb-2 mt-1"
									activeOpacity={0.7}
								>
									<Plus color="#2563eb" size={18} strokeWidth={2.4} />
									<Text className="text-sm font-bold text-blue-600">Create New Folder</Text>
								</TouchableOpacity>
							)
						)}

						{/* Folder Options */}
						<ScrollView showsVerticalScrollIndicator={false} className="mt-1">
							{/* Root (No Folder) */}
							<TouchableOpacity
								onPress={() => {
									onMove(null);
									setIsMoveModalOpen(false);
								}}
								className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-1.5 ${
									isLight ? "bg-slate-50 active:bg-slate-100" : "bg-slate-800/60 active:bg-slate-800"
								}`}
								activeOpacity={0.7}
							>
								<View className="flex-row items-center gap-3">
									<FolderIcon color={isLight ? "#64748b" : "#94a3b8"} size={20} />
									<Text className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
										No Folder (Root)
									</Text>
								</View>
								<Check color="#3b82f6" size={18} />
							</TouchableOpacity>

							{/* Custom Folders */}
							{folders.map((f) => (
								<TouchableOpacity
									key={f.id}
									onPress={() => {
										onMove(f.id);
										setIsMoveModalOpen(false);
									}}
									className={`flex-row items-center justify-between p-3.5 rounded-2xl mb-1.5 ${
										isLight ? "bg-slate-50 active:bg-slate-100" : "bg-slate-800/60 active:bg-slate-800"
									}`}
									activeOpacity={0.7}
								>
									<View className="flex-row items-center gap-3">
										<View
											className="w-4 h-4 rounded-full"
											style={{ backgroundColor: f.color || "#3b82f6" }}
										/>
										<Text className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
											{f.name}
										</Text>
									</View>
									<Check color="#3b82f6" size={18} />
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</>
	);
}
