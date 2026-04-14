import { useRef, useState, useEffect, lazy, Suspense } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { type OnMount, type BeforeMount } from "@monaco-editor/react";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useApiHelpers } from "@/lib/api";
import { playErrorSound } from "@/lib/utils";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { useAuth } from "@/context/AuthContext";
import type { PasteData } from "@/types";
import { CONFIG } from "@/configurations";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { usePaste } from "@/context/PasteContext";
import { useAiEnhance } from "@/hooks/use-ai-enhance";
import { useHomeUrlSync } from "@/hooks/use-home-url-sync";
import { usePasteSubmission } from "@/hooks/use-paste-submission";

const LanguageSelector = lazy(() =>
	import("@/components/editor/language-selector").then((m) => ({
		default: m.LanguageSelector,
	})),
);
const FontSizeControls = lazy(() =>
	import("@/components/editor/font-size-controls").then((m) => ({
		default: m.FontSizeControls,
	})),
);
const CustomExpiryDialog = lazy(() =>
	import("@/components/home/custom-expiry-dialog").then((m) => ({
		default: m.CustomExpiryDialog,
	})),
);
const MainToolbar = lazy(() =>
	import("@/components/home/main-toolbar").then((m) => ({
		default: m.MainToolbar,
	})),
);
const EditorContent = lazy(() =>
	import("@/components/home/editor-content").then((m) => ({
		default: m.EditorContent,
	})),
);
const AiEnhanceDialog = lazy(() =>
	import("@/components/editor/ai-enhance-dialog").then((m) => ({
		default: m.AiEnhanceDialog,
	})),
);

const HomePage = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const apiHelpers = useApiHelpers();

	// Refs
	const userInputRef = useRef<HTMLTextAreaElement>(null);
	const valueRef = useRef("");
	const previousLengthRef = useRef(0);
	const hasDetectedRef = useRef(false);

	const {
		expiresTime,
		setExpiresTime,
		contentType,
		setContentType,
		language,
		setLanguage,
		textValue,
		setPassword,
		idTypeTab,
		customId,
		setCustomId,
		isSubmitting,
		isUploading,
		uploadProgress,
		setFileUpload,
		resetFileUpload,
		fileName,
		onContentTypeChange,
	} = usePaste();

	const [shortenedResult, setShortenedResult] = useState<{
		id: string;
		url: string;
	} | null>(null);

	const { handleSubmit, pendingFile, setPendingFile } =
		usePasteSubmission(setShortenedResult);

	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isCustomExpiryDialogOpen, setIsCustomExpiryDialogOpen] =
		useState(false);
	const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(
		new Date(Date.now() + 24 * 60 * 60 * 1000),
	);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [dialogError, setDialogError] = useState("");

	const {
		fontSize,
		ref: editorContainerRef,
		setFontSize,
	} = usePinchZoom(CONFIG.DEFAULTS.FONT_SIZE);

	const { isDetecting, detectLanguage } = useLanguageDetection();

	const {
		isAiDialogOpen,
		setIsAiDialogOpen,
		selectedText,
		setupAiAction,
		applyEnhancedText,
	} = useAiEnhance();

	useHomeUrlSync({
		contentType,
		isFullscreen,
		onContentTypeChange,
		setIsFullscreen,
	});

	// Keep valueRef in sync with context's textValue
	useEffect(() => {
		previousLengthRef.current = valueRef.current.trim().length;
		valueRef.current = textValue;
	}, [textValue]);

	// Effects
	useEffect(() => {
		const handleGlobalPaste = (e: ClipboardEvent) => {
			if (isSubmitting || isUploading) return;

			// 1. Detect Snipit Drawing JSON
			const textData =
				e.clipboardData?.getData("text/plain") ||
				e.clipboardData?.getData("text");
			if (textData) {
				try {
					const parsed = JSON.parse(textData);
					if (
						parsed &&
						Array.isArray(parsed.elements) &&
						parsed.appState
					) {
						if (contentType !== "draw") setContentType("draw");
						return;
					}
				} catch {
					// Not JSON, continue
				}
			}

			// 2. Ignore file pastes if already in Drawing mode (let Excalidraw handle it)
			if (contentType === "draw") return;

			const items = e.clipboardData?.items;
			if (!items) return;

			for (const item of items) {
				if (item.kind === "file") {
					const file = item.getAsFile();
					if (file) {
						setContentType("file");
						setPendingFile(file);
						setFileUpload(file);
						toast.success(
							t(
								"home.file_selected_via_paste",
								"File selected via paste!",
							),
						);
						break;
					}
				}
			}
		};

		document.addEventListener("paste", handleGlobalPaste);
		return () => {
			document.removeEventListener("paste", handleGlobalPaste);
		};
	}, [
		isSubmitting,
		isUploading,
		contentType,
		t,
		setFileUpload,
		setContentType,
		setPendingFile,
	]);

	useEffect(() => {
		if (contentType === "file") {
			setExpiresTime("1d");
		}
	}, [contentType, setExpiresTime]);

	useEffect(() => {
		if (!pendingFile) {
			setPreviewUrl(null);
			return;
		}
		const objectUrl = URL.createObjectURL(pendingFile);
		setPreviewUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [pendingFile]);

	// Handlers
	// Removed duplicate logic since it's in PasteContext now

	const [historyItems, setHistoryItems] = useState<Array<PasteData>>([]);

	// Effects
	useEffect(() => {
		const loadHistory = async () => {
			const stored = localStorage.getItem("items");
			const localItems: Array<PasteData> = stored
				? JSON.parse(stored)
				: [];
			let finalItems = [...localItems];

			if (user) {
				try {
					const userPastes = await apiHelpers.getUserPastes();
					const userPasteIds = new Set(
						userPastes.map((p: PasteData) => p.id),
					);
					const filteredLocal = localItems.filter(
						(p) => !userPasteIds.has(p.id),
					);
					finalItems = [...userPastes, ...filteredLocal];
				} catch (err) {
					console.error("Failed to fetch user pastes", err);
				}
			}

			finalItems.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime(),
			);
			setHistoryItems(finalItems);
		};

		loadHistory();
	}, [user, apiHelpers]);

	const handleDeleteHistory = async (id: string) => {
		try {
			// Find the item first to see if it's a server paste
			const item = historyItems.find((p) => p.id === id);

			if (user && item && item.owner) {
				// If logged in and paste has a userId, try deleting from server
				await apiHelpers.deletePaste(id);
			}

			// Update state
			const newItems = historyItems.filter((p) => p.id !== id);
			setHistoryItems(newItems);

			// Update localStorage
			const stored = localStorage.getItem("items");
			if (stored) {
				const localItems: Array<PasteData> = JSON.parse(stored);
				const updatedLocal = localItems.filter((p) => p.id !== id);
				localStorage.setItem("items", JSON.stringify(updatedLocal));
			}

			toast.success(
				t("messages.snippet_deleted_id", {
					id: `/${id}`,
					defaultValue: `Snippet /${id} deleted`,
				}),
			);
		} catch (error) {
			console.error("Failed to delete history item", error);
			toast.error(
				t("messages.delete_failed", "Failed to delete snippet"),
			);
		}
	};

	useEffect(() => {
		setShortenedResult(null);
	}, [contentType]);

	useEffect(() => {
		if (textValue === "" && shortenedResult) {
			setShortenedResult(null);
		}
	}, [textValue, shortenedResult]);

	const handleQuickPaste = async () => {
		const hasContent =
			contentType === "file"
				? !!fileName
				: contentType === "draw"
					? true
					: valueRef.current.trim().length > 0;
		if (!hasContent) {
			playErrorSound();
			toast.warning(
				contentType === "file"
					? t("messages.empty_file", "Please select a file first!")
					: t(
							"messages.empty_content",
							"Please enter some content first!",
						),
			);
			return;
		}

		const selectedId =
			idTypeTab === "dynamic" ? customId.trim() : undefined;
		const result = await handleSubmit(idTypeTab, selectedId, {});

		if (result !== true) {
			toast.error(result as string);
		}
	};

	const handleCollaborative = async () => {
		const hasContent =
			contentType === "file"
				? !!fileName
				: contentType === "draw"
					? true
					: valueRef.current.trim().length > 0;
		if (!hasContent) {
			playErrorSound();
			toast.warning(
				contentType === "file"
					? t("messages.empty_file", "Please select a file first!")
					: t(
							"messages.empty_content",
							"Please enter some content first!",
						),
			);
			return;
		}
		const selectedId =
			idTypeTab === "dynamic" ? customId.trim() : undefined;
		const result = await handleSubmit(idTypeTab, selectedId, {
			visibility: "public",
			editPermission: "public",
			publicRole: "editor",
			isCollaborative: true,
		});
		if (result !== true) {
			toast.error(result as string);
		}
	};

	const handleLanguageDetection = async (content: string) => {
		if (hasDetectedRef.current) return;

		// 1. Local check for Drawing JSON
		try {
			const parsed = JSON.parse(content);
			if (parsed && Array.isArray(parsed.elements) && parsed.appState) {
				hasDetectedRef.current = true;
				setContentType("draw");
				return;
			}
		} catch {
			// Not JSON, continue to API detection
		}

		hasDetectedRef.current = true;
		const result = await detectLanguage(content);
		if (result) {
			setLanguage(result.language);
			if (result.isCode) {
				setContentType("code");
			} else {
				setContentType("text");
			}
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		if (valueRef.current.trim() !== "") return;
		handleLanguageDetection(
			e.clipboardData.getData("text/plain") ||
				e.clipboardData.getData("text"),
		);
	};

	const handleEditorMount: OnMount = (editor, monaco) => {
		setupAiAction(editor, monaco);
		editor.onDidPaste(() => {
			const value = editor.getValue();
			if (previousLengthRef.current === 0) {
				handleLanguageDetection(value);
			}
		});
	};

	const handleDialogSubmit = async () => {
		setDialogError("");
		const selectedId =
			idTypeTab === "dynamic" ? customId.trim() : undefined;
		const result = await handleSubmit(idTypeTab, selectedId, {});
		if (result === true) {
			if (idTypeTab === "dynamic") setCustomId("");
			setPassword("");
		} else {
			setDialogError(result as string);
		}
	};

	const handleEditorWillMount: BeforeMount = (monaco) =>
		defineMonacoThemes(monaco);

	return (
		<div className="relative flex-1 flex flex-col bg-background overflow-hidden">
			{/* Toolbar: fixed height, does not grow */}
			<div className="relative z-10 flex flex-col gap-1.5 my-1 mx-2 md:my-1.5 md:mx-4 shrink-0">
				<Suspense fallback={null}>
					<MainToolbar
						contentType={contentType}
						setContentType={onContentTypeChange}
						expiresTime={expiresTime}
						setExpiresTime={setExpiresTime}
						setIsCustomExpiryDialogOpen={
							setIsCustomExpiryDialogOpen
						}
						handleQuickPaste={handleQuickPaste}
						handleCollaborative={handleCollaborative}
						isSubmitting={isSubmitting}
						isUploading={isUploading}
						uploadProgress={uploadProgress}
						handleDialogSubmit={handleDialogSubmit}
						dialogError={dialogError}
						shortenedResult={shortenedResult}
					/>
				</Suspense>

				<div className="flex flex-wrap items-center gap-2">
					<Suspense fallback={null}>
						{(isDetecting || contentType === "code") && (
							<div className="w-full sm:w-auto flex items-center gap-2">
								<LanguageSelector
									value={language}
									onValueChange={setLanguage}
									isDetecting={isDetecting}
								/>
								{!isDetecting && (
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-10 shrink-0 bg-background/80 backdrop-blur-sm border-border/50 shadow-sm"
										onClick={() => {
											// allow manual detection even if previously pasted
											hasDetectedRef.current = false;
											handleLanguageDetection(textValue);
										}}
										title={t(
											"home.auto_detecting",
											"Auto-detect language",
										)}
									>
										<Code2 className="h-4 w-4 text-muted-foreground" />
									</Button>
								)}
							</div>
						)}

						{contentType !== "link" &&
							contentType !== "file" &&
							contentType !== "draw" && (
								<FontSizeControls
									fontSize={fontSize}
									setFontSize={setFontSize}
								/>
							)}
					</Suspense>
				</div>
			</div>

			<Suspense fallback={null}>
				<CustomExpiryDialog
					isOpen={isCustomExpiryDialogOpen}
					onOpenChange={setIsCustomExpiryDialogOpen}
					customExpiryDate={customExpiryDate}
					setCustomExpiryDate={setCustomExpiryDate}
					onConfirm={(date) => {
						setExpiresTime(date.toISOString());
						setIsCustomExpiryDialogOpen(false);
					}}
				/>
			</Suspense>

			{/* Editor: takes all remaining space */}
			<Suspense fallback={null}>
				<EditorContent
					fontSize={fontSize}
					editorContainerRef={editorContainerRef}
					userInputRef={userInputRef}
					handleEditorWillMount={handleEditorWillMount}
					handleEditorMount={handleEditorMount}
					handlePaste={handlePaste}
					isFullscreen={isFullscreen}
					setIsFullscreen={setIsFullscreen}
					onFileSelect={(file) => {
						setPendingFile(file);
						setFileUpload(file);
					}}
					onClearFile={() => {
						resetFileUpload();
						setPendingFile(null);
					}}
					previewUrl={previewUrl}
					shortenedResult={shortenedResult}
					historyItems={historyItems}
					onDeleteHistoryItem={handleDeleteHistory}
				/>
			</Suspense>

			<Suspense fallback={null}>
				<AiEnhanceDialog
					isOpen={isAiDialogOpen}
					onClose={() => setIsAiDialogOpen(false)}
					selectedText={selectedText}
					onApply={applyEnhancedText}
				/>
			</Suspense>
		</div>
	);
};

export default HomePage;
