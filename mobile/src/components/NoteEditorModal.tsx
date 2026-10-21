import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Modal,
	SafeAreaView,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Share,
	StatusBar,
	Animated,
	Dimensions,
} from "react-native";
import {
	ArrowLeft,
	Star,
	Trash2,
	Share2,
	Folder as FolderIcon,
	FolderPlus,
	Plus,
	ChevronDown,
	Check,
} from "lucide-react-native";
import { PasswordItem, Folder } from "../core/vault-storage";
import { useThemeVars } from "../config/theme";

interface NoteEditorModalProps {
	visible: boolean;
	note: PasswordItem | null;
	folders: Folder[];
	theme?: "dark" | "light";
	onClose: () => void;
	onSave: (updatedItem: Partial<PasswordItem>) => void;
	onDelete?: (id: string) => void;
	onCreateFolder?: (name: string, color?: string) => Promise<Folder | void>;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function NoteEditorModal({
	visible,
	note,
	folders = [],
	theme = "dark",
	onClose,
	onSave,
	onDelete,
	onCreateFolder,
}: NoteEditorModalProps) {
	const c = useThemeVars(theme);
	const isLight = theme === "light";

	const [title, setTitle] = useState("");
	const [notes, setNotes] = useState("");
	const [isFavorite, setIsFavorite] = useState(false);
	const [folderId, setFolderId] = useState<string | undefined>(undefined);
	const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
	const [isCreatingFolder, setIsCreatingFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [newFolderColor, setNewFolderColor] = useState("#3b82f6");

	// Slide from right animation
	const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
	const [isModalMounted, setIsModalMounted] = useState(visible);

	useEffect(() => {
		if (visible) {
			setIsModalMounted(true);
			slideAnim.setValue(SCREEN_WIDTH);
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				damping: 24,
				stiffness: 220,
				mass: 0.8,
			}).start();
		} else {
			Animated.timing(slideAnim, {
				toValue: SCREEN_WIDTH,
				duration: 220,
				useNativeDriver: true,
			}).start(() => {
				setIsModalMounted(false);
			});
		}
	}, [visible]);

	useEffect(() => {
		if (note) {
			setTitle(note.title || "");
			setNotes(note.notes || "");
			setIsFavorite(!!note.isFavorite);
			setFolderId(note.folderId);
		} else {
			setTitle("");
			setNotes("");
			setIsFavorite(false);
			setFolderId(undefined);
		}
		setIsFolderPickerOpen(false);
	}, [note, visible]);

	if (!isModalMounted && !visible) return null;

	const handleSaveAndClose = () => {
		const cleanTitle = title.trim();
		const cleanNotes = notes.trim();

		// Animate slide out to right
		Animated.timing(slideAnim, {
			toValue: SCREEN_WIDTH,
			duration: 220,
			useNativeDriver: true,
		}).start(() => {
			if (!cleanTitle && !cleanNotes) {
				onClose();
				return;
			}

			onSave({
				id: note?.id,
				title: cleanTitle || "Untitled Note",
				notes: notes,
				category: "note",
				isFavorite,
				folderId,
				updatedAt: new Date().toISOString(),
			});
			onClose();
		});
	};

	const handleShare = async () => {
		const fullText = [title.trim(), notes.trim()].filter(Boolean).join("\n\n");
		if (!fullText) return;
		try {
			await Share.share({
				title: title || "Note",
				message: fullText,
			});
		} catch (err) {
			console.log("Error sharing note:", err);
		}
	};

	const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
	const charCount = notes.length;

	const formattedDate = note?.updatedAt
		? new Date(note.updatedAt).toLocaleDateString([], {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
		  })
		: new Date().toLocaleDateString([], {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
		  });

	const activeFolder = folders.find((f) => f.id === folderId);

	return (
		<Modal visible={isModalMounted} transparent animationType="none" statusBarTranslucent>
			<Animated.View
				style={{
					flex: 1,
					transform: [{ translateX: slideAnim }],
				}}
				className={`flex-1 ${isLight ? "bg-white" : "bg-slate-950"}`}
			>
				<SafeAreaView
					className={`flex-1 ${isLight ? "bg-white" : "bg-slate-950"}`}
					style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
				>
				{/* Top App Bar inspired by Samsung & Apple Notes */}
				<View
					className={`flex-row items-center justify-between px-4 py-2.5 border-b ${
						isLight ? "border-slate-100 bg-white" : "border-slate-900 bg-slate-950"
					}`}
				>
					{/* Left: Back & Folder Selector */}
					<View className="flex-row items-center gap-2">
						<TouchableOpacity
							onPress={handleSaveAndClose}
							className={`p-2 rounded-full ${isLight ? "bg-slate-100" : "bg-slate-900"}`}
							hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
						>
							<ArrowLeft color={isLight ? "#0f172a" : "#f8fafc"} size={20} />
						</TouchableOpacity>

						{/* Folder Pill Button */}
						<TouchableOpacity
							onPress={() => setIsFolderPickerOpen(!isFolderPickerOpen)}
							className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
								isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"
							}`}
							activeOpacity={0.7}
						>
							{activeFolder ? (
								<View
									className="w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: activeFolder.color || "#3b82f6" }}
								/>
							) : (
								<FolderIcon color={isLight ? "#64748b" : "#94a3b8"} size={13} />
							)}
							<Text
								className={`text-xs font-semibold max-w-[100px] ${
									isLight ? "text-slate-700" : "text-slate-300"
								}`}
								numberOfLines={1}
							>
								{activeFolder ? activeFolder.name : "No Folder"}
							</Text>
							<ChevronDown color={isLight ? "#64748b" : "#94a3b8"} size={13} />
						</TouchableOpacity>
					</View>

					{/* Right Actions: Favorite, Share, Delete, Done */}
					<View className="flex-row items-center gap-2">
						<TouchableOpacity
							onPress={() => setIsFavorite(!isFavorite)}
							className="p-2"
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Star
								color={isFavorite ? "#eab308" : isLight ? "#94a3b8" : "#64748b"}
								fill={isFavorite ? "#eab308" : "transparent"}
								size={20}
							/>
						</TouchableOpacity>

						{(title.trim() || notes.trim()) && (
							<TouchableOpacity
								onPress={handleShare}
								className="p-2"
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Share2 color={isLight ? "#64748b" : "#94a3b8"} size={19} />
							</TouchableOpacity>
						)}

						{note?.id && onDelete && (
							<TouchableOpacity
								onPress={() => {
									onDelete(note.id);
									onClose();
								}}
								className="p-2"
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<Trash2 color="#ef4444" size={19} />
							</TouchableOpacity>
						)}

						<TouchableOpacity
							onPress={handleSaveAndClose}
							className="px-3 py-1.5 rounded-full bg-blue-600 ml-1"
							activeOpacity={0.8}
						>
							<Text className="text-white text-xs font-bold">Done</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Folder Picker Dropdown Sheet */}
				{isFolderPickerOpen && (
					<View
						className={`mx-4 mt-2 p-2 rounded-2xl border shadow-lg z-50 ${
							isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
						}`}
					>
						<View className="flex-row items-center justify-between px-2 py-1">
							<Text className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-400" : "text-slate-500"}`}>
								Move to Folder
							</Text>
							{onCreateFolder && !isCreatingFolder && (
								<TouchableOpacity
									onPress={() => setIsCreatingFolder(true)}
									className="flex-row items-center gap-1 py-0.5 px-2 rounded-md bg-blue-600/10"
									activeOpacity={0.7}
								>
									<Plus color="#2563eb" size={13} strokeWidth={2.5} />
									<Text className="text-[11px] font-bold text-blue-600">New</Text>
								</TouchableOpacity>
							)}
						</View>

						{/* Inline Create Folder Input */}
						{isCreatingFolder && (
							<View className={`p-2.5 my-1.5 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/60 border-slate-700"}`}>
								<TextInput
									className={`text-sm font-semibold px-2 py-1.5 rounded-lg border ${
										isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-700 text-white"
									}`}
									placeholder="New folder name..."
									placeholderTextColor={isLight ? "#94a3b8" : "#64748b"}
									value={newFolderName}
									onChangeText={setNewFolderName}
									autoFocus
								/>
								<View className="flex-row items-center justify-between mt-2 pt-1 border-t border-slate-200/50">
									<View className="flex-row items-center gap-1.5">
										{["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((col) => (
											<TouchableOpacity
												key={col}
												onPress={() => setNewFolderColor(col)}
												className={`w-5 h-5 rounded-full ${newFolderColor === col ? "border-2 border-white scale-110" : ""}`}
												style={{ backgroundColor: col }}
											/>
										))}
									</View>
									<View className="flex-row items-center gap-1.5">
										<TouchableOpacity
											onPress={() => {
												setIsCreatingFolder(false);
												setNewFolderName("");
											}}
											className="px-2 py-1"
										>
											<Text className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Cancel</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={async () => {
												if (!newFolderName.trim() || !onCreateFolder) return;
												const created = await onCreateFolder(newFolderName.trim(), newFolderColor);
												if (created && created.id) {
													setFolderId(created.id);
												}
												setNewFolderName("");
												setIsCreatingFolder(false);
											}}
											className="px-2.5 py-1 rounded-md bg-blue-600"
											activeOpacity={0.8}
										>
											<Text className="text-xs font-bold text-white">Create</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						)}

						<TouchableOpacity
							onPress={() => {
								setFolderId(undefined);
								setIsFolderPickerOpen(false);
							}}
							className={`flex-row items-center justify-between px-3 py-2.5 rounded-xl ${
								folderId === undefined ? (isLight ? "bg-blue-50" : "bg-blue-950/40") : ""
							}`}
						>
							<View className="flex-row items-center gap-2.5">
								<FolderIcon color={isLight ? "#64748b" : "#94a3b8"} size={16} />
								<Text className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
									No Folder (Root)
								</Text>
							</View>
							{folderId === undefined && <Check color="#3b82f6" size={16} />}
						</TouchableOpacity>

						{folders.map((f) => (
							<TouchableOpacity
								key={f.id}
								onPress={() => {
									setFolderId(f.id);
									setIsFolderPickerOpen(false);
								}}
								className={`flex-row items-center justify-between px-3 py-2.5 rounded-xl ${
									folderId === f.id ? (isLight ? "bg-blue-50" : "bg-blue-950/40") : ""
								}`}
							>
								<View className="flex-row items-center gap-2.5">
									<View
										className="w-3.5 h-3.5 rounded-full"
										style={{ backgroundColor: f.color || "#3b82f6" }}
									/>
									<Text className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
										{f.name}
									</Text>
								</View>
								{folderId === f.id && <Check color="#3b82f6" size={16} />}
							</TouchableOpacity>
						))}
					</View>
				)}

				{/* Note Editor Body */}
				<KeyboardAvoidingView
					className="flex-1"
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<ScrollView
						className="flex-1 px-5 pt-3"
						contentContainerStyle={{ paddingBottom: 220 }}
						automaticallyAdjustKeyboardInsets={true}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						{/* Timestamp & Info Bar */}
						<View className="flex-row items-center justify-between mb-2">
							<Text className={`text-xs font-medium ${isLight ? "text-slate-400" : "text-slate-500"}`}>
								{formattedDate}
							</Text>
							<Text className={`text-xs font-medium ${isLight ? "text-slate-400" : "text-slate-500"}`}>
								{wordCount} words • {charCount} chars
							</Text>
						</View>

						{/* Note Title Input (Samsung / MI Notes style bold header) */}
						<TextInput
							className={`text-2xl font-bold tracking-tight pb-2 ${
								isLight ? "text-slate-900" : "text-white"
							}`}
							placeholder="Title"
							placeholderTextColor={isLight ? "#94a3b8" : "#475569"}
							value={title}
							onChangeText={setTitle}
							multiline={false}
							returnKeyType="next"
						/>

						{/* Subtle Divider */}
						<View
							className={`h-[1px] my-2 ${
								isLight ? "bg-slate-100" : "bg-slate-900"
							}`}
						/>

						{/* Note Content Text Area (fluid full height) */}
						<TextInput
							className={`text-base leading-6 pt-1 pb-32 ${
								isLight ? "text-slate-800" : "text-slate-200"
							}`}
							placeholder="Start writing..."
							placeholderTextColor={isLight ? "#94a3b8" : "#475569"}
							multiline
							textAlignVertical="top"
							value={notes}
							onChangeText={setNotes}
							autoFocus={!note}
						/>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
			</Animated.View>
		</Modal>
	);
}
