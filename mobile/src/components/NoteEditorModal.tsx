import React, { useState, useEffect, useRef, useCallback } from "react";
import {
	View,
	TextInput,
	TouchableOpacity,
	Modal,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Share,
	StatusBar,
	Animated,
	Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	ArrowLeft,
	Star,
	Trash2,
	Share2,
	Folder as FolderIcon,
	Plus,
	ChevronDown,
	Check,
} from "lucide-react-native";
import { PasswordItem, Folder } from "../core/vault-storage";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { CreatableCombobox } from "./ui/creatable-combobox";

interface NoteEditorModalProps {
	visible: boolean;
	note: PasswordItem | null;
	folders: Folder[];
	theme?: "dark" | "light";
	onClose: () => void;
	onSave: (updatedItem: Partial<PasswordItem>) => Promise<PasswordItem | void> | void;
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
	const [title, setTitle] = useState("");
	const [notes, setNotes] = useState("");
	const [isFavorite, setIsFavorite] = useState(false);
	const [folderId, setFolderId] = useState<string | undefined>(undefined);

	// Track current active note ID (for updating created note in-place)
	const currentNoteIdRef = useRef<string | undefined>(note?.id);

	// Slide from right animation
	const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
	const [isModalMounted, setIsModalMounted] = useState(visible);

	// Autosave debounce timer
	const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Keep refs for latest values so unmount/exit always saves exact state
	const latestValuesRef = useRef({ title, notes, isFavorite, folderId });
	useEffect(() => {
		latestValuesRef.current = { title, notes, isFavorite, folderId };
	}, [title, notes, isFavorite, folderId]);

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
			currentNoteIdRef.current = note.id;
			setTitle(note.title || "");
			setNotes(note.notes || "");
			setIsFavorite(!!note.isFavorite);
			setFolderId(note.folderId);
		} else {
			currentNoteIdRef.current = undefined;
			setTitle("");
			setNotes("");
			setIsFavorite(false);
			setFolderId(undefined);
		}
	}, [note, visible]);

	// Automatic background autosave
	const triggerAutoSave = useCallback(() => {
		const { title: t, notes: n, isFavorite: fav, folderId: fid } = latestValuesRef.current;
		const cleanTitle = t.trim();
		const cleanNotes = n.trim();

		// Don't save completely blank notes
		if (!cleanTitle && !cleanNotes) return;

		const res = onSave({
			id: currentNoteIdRef.current,
			title: cleanTitle || "Untitled Note",
			notes: n,
			category: "note",
			isFavorite: fav,
			folderId: fid,
			updatedAt: new Date().toISOString(),
		});

		// If a Promise is returned with saved item, preserve its id for future edits
		if (res && typeof (res as any).then === "function") {
			(res as Promise<any>).then((saved) => {
				if (saved?.id) {
					currentNoteIdRef.current = saved.id;
				}
			});
		}
	}, [onSave]);

	const scheduleAutoSave = useCallback(() => {
		if (autosaveTimerRef.current) {
			clearTimeout(autosaveTimerRef.current);
		}
		autosaveTimerRef.current = setTimeout(() => {
			triggerAutoSave();
		}, 800);
	}, [triggerAutoSave]);

	// Automatically schedule autosave whenever user types or changes folder/favorite
	const handleTitleChange = (val: string) => {
		setTitle(val);
		scheduleAutoSave();
	};

	const handleNotesChange = (val: string) => {
		setNotes(val);
		scheduleAutoSave();
	};

	const handleToggleFavorite = () => {
		const nextFav = !isFavorite;
		setIsFavorite(nextFav);
		if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
		latestValuesRef.current.isFavorite = nextFav;
		triggerAutoSave();
	};

	const handleSelectFolder = (fid?: string) => {
		setFolderId(fid);
		if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
		latestValuesRef.current.folderId = fid;
		triggerAutoSave();
	};

	if (!isModalMounted && !visible) return null;

	const handleClose = () => {
		if (autosaveTimerRef.current) {
			clearTimeout(autosaveTimerRef.current);
		}
		// Final flush autosave on exit
		triggerAutoSave();

		// Animate slide out to right
		Animated.timing(slideAnim, {
			toValue: SCREEN_WIDTH,
			duration: 220,
			useNativeDriver: true,
		}).start(() => {
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
				className="flex-1 bg-background"
			>
				<SafeAreaView
					className="flex-1 bg-background"
					edges={["top", "bottom", "left", "right"]}
				>
				{/* Top App Bar */}
				<View className="flex-row items-center justify-between px-4 py-2.5 border-b border-border bg-background">
					{/* Left: Back & Folder Selector */}
					<View className="flex-row items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onPress={handleClose}
							className="h-8 w-8"
						>
							<ArrowLeft className="text-foreground" size={18} />
						</Button>

						{/* Unified Creatable Combobox Folder Trigger */}
						<CreatableCombobox
							options={folders.map((f) => ({ id: f.id, label: f.name, color: f.color }))}
							selectedId={folderId}
							onSelect={handleSelectFolder}
							onCreate={onCreateFolder ? async (name, color) => {
								const created = await onCreateFolder(name, color);
								if (created && created.id) {
									return { id: created.id, label: created.name, color: created.color };
								}
							} : undefined}
							placeholder="No Folder"
							noneLabel="No Folder (Root)"
							createLabel="Create new folder"
							title="Move Note to Folder"
							triggerRender={({ selectedOption, open }) => (
								<TouchableOpacity
									onPress={open}
									className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/60"
									activeOpacity={0.7}
								>
									{selectedOption ? (
										<View
											className="w-2.5 h-2.5 rounded-full"
											style={{ backgroundColor: selectedOption.color || "#09090b" }}
										/>
									) : (
										<FolderIcon className="text-muted-foreground" size={13} />
									)}
									<Text
										className="text-xs font-medium max-w-[100px] text-foreground"
										numberOfLines={1}
									>
										{selectedOption ? selectedOption.label : "No Folder"}
									</Text>
									<ChevronDown className="text-muted-foreground" size={13} />
								</TouchableOpacity>
							)}
						/>
					</View>

					{/* Right Actions */}
					<View className="flex-row items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							onPress={handleToggleFavorite}
							className="h-8 w-8"
						>
							<Star
								className={isFavorite ? "text-foreground fill-foreground" : "text-muted-foreground"}
								size={18}
							/>
						</Button>

						{(title.trim() || notes.trim()) && (
							<Button
								variant="ghost"
								size="icon"
								onPress={handleShare}
								className="h-8 w-8"
							>
								<Share2 className="text-foreground" size={18} />
							</Button>
						)}

						{note?.id && onDelete && (
							<Button
								variant="ghost"
								size="icon"
								onPress={() => {
									onDelete(note.id);
									onClose();
								}}
								className="h-8 w-8"
							>
								<Trash2 className="text-destructive" size={18} />
							</Button>
						)}
					</View>
				</View>

				{/* Note Editor Body */}
				<KeyboardAvoidingView
					className="flex-1 bg-background"
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
							<Text className="text-xs text-muted-foreground">
								{formattedDate}
							</Text>
							<Text className="text-xs text-muted-foreground">
								{wordCount} words • {charCount} chars
							</Text>
						</View>

						{/* Note Title Input */}
						<TextInput
							className="text-2xl font-bold tracking-tight pb-2 text-foreground"
							placeholder="Title"
							placeholderTextColor="#71717a"
							value={title}
							onChangeText={handleTitleChange}
							multiline={false}
							returnKeyType="next"
						/>

						{/* Subtle Divider */}
						<Separator className="my-2" />

						{/* Note Content Text Area */}
						<TextInput
							className="text-base leading-6 pt-1 pb-32 text-foreground"
							placeholder="Start writing..."
							placeholderTextColor="#71717a"
							multiline
							textAlignVertical="top"
							value={notes}
							onChangeText={handleNotesChange}
							autoFocus={!note}
						/>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>
			</Animated.View>
		</Modal>
	);
}
