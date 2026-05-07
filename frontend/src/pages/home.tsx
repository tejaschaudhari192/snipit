import { useRef, useState, useEffect, lazy, Suspense } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
	type OnMount,
	type BeforeMount,
	type Monaco,
} from "@monaco-editor/react";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { playErrorSound, isSnipitDrawing } from "@/utils";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { CONFIG } from "@/configurations";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { usePaste } from "@/context/PasteContext";
import { useAiEnhance } from "@/hooks/use-ai-enhance";
import { useHomeUrlSync } from "@/hooks/use-home-url-sync";
import { usePasteSubmission } from "@/hooks/use-paste-submission";
import { useSnippets } from "@/context/SnippetContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTerminalLayout } from "@/hooks/use-terminal-layout";
import { TerminalContainer } from "@/components/terminal/terminal-container";
import { ResizablePanels } from "@/components/common/resizable-panels";

import { useAiAutocomplete } from "@/hooks/use-ai-autocomplete";
import { AiAutocompleteToggle } from "@/components/editor/ai-autocomplete-toggle";
import { storage } from "@/utils/storage";

import { MainToolbar } from "@/components/home/main-toolbar";
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

// Shimmer Skeletons
const EditorSkeleton = () => (
	<div className="mx-2 mt-0.5 sm:mx-4 sm:mt-1 mb-4 glass-card overflow-hidden flex-1 flex flex-col rounded-2xl border border-border/20">
		<div className="h-10 border-b border-border/10 flex items-center px-4 gap-4">
			<div className="w-20 h-4 skeleton rounded" />
			<div className="w-20 h-4 skeleton rounded" />
		</div>
		<div className="flex-1 p-6 space-y-4">
			<div className="w-3/4 h-4 skeleton rounded" />
			<div className="w-1/2 h-4 skeleton rounded" />
			<div className="w-5/6 h-4 skeleton rounded" />
		</div>
	</div>
);

const HomePage = () => {
	const { t } = useTranslation();
	usePageTitle("common.snipit", "Snipit");
	const { history, deleteSnippet } = useSnippets();
	const historyItems = history.items;

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
	const [isTerminalOpen, setIsTerminalOpen] = useState(false);
	const { terminalPosition, setTerminalPosition } = useTerminalLayout();

	const [dialogError, setDialogError] = useState("");
	const [socket, setSocket] = useState<Socket | null>(null);

	const {
		fontSize,
		ref: editorContainerRef,
		setFontSize,
	} = usePinchZoom(CONFIG.defaults.fontSize);

	const { isDetecting, detectLanguage } = useLanguageDetection();

	const {
		isAiDialogOpen,
		setIsAiDialogOpen,
		selectedText,
		prefillInstruction,
		setupAiAction,
		applyEnhancedText,
	} = useAiEnhance();

	const [isAiAutocompleteEnabled, setIsAiAutocompleteEnabled] = useState(() =>
		storage.get(CONFIG.storageKeys.aiAutocomplete, false),
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const editorInstanceRef = useRef<any>(null);
	const monacoInstanceRef = useRef<Monaco | null>(null);

	const { setupAutocomplete } = useAiAutocomplete({
		language,
		enabled: isAiAutocompleteEnabled,
	});

	useEffect(() => {
		storage.set(CONFIG.storageKeys.aiAutocomplete, isAiAutocompleteEnabled);
		if (editorInstanceRef.current && monacoInstanceRef.current) {
			setupAutocomplete(
				editorInstanceRef.current,
				monacoInstanceRef.current,
			);
		}
	}, [isAiAutocompleteEnabled, setupAutocomplete]);

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

			const textData =
				e.clipboardData?.getData("text/plain") ||
				e.clipboardData?.getData("text");
			if (textData && isSnipitDrawing(textData)) {
				if (contentType !== "draw") setContentType("draw");
				return;
			}

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

	useEffect(() => {
		const socketUrl = CONFIG.apiBaseUrl
			? CONFIG.apiBaseUrl.replace(/\/api(\/v\d+)?\/?$/, "")
			: "";
		const s = io(socketUrl, { withCredentials: true });
		setSocket(s);

		return () => {
			s.disconnect();
			setSocket(null);
		};
	}, []);

	// Handlers
	const handleDeleteHistory = deleteSnippet;

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

		if (isSnipitDrawing(content)) {
			hasDetectedRef.current = true;
			setContentType("draw");
			return;
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
		editorInstanceRef.current = editor;
		monacoInstanceRef.current = monaco;
		setupAiAction(editor, monaco);
		setupAutocomplete(editor, monaco);
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
				<MainToolbar
					contentType={contentType}
					setContentType={onContentTypeChange}
					expiresTime={expiresTime}
					setExpiresTime={setExpiresTime}
					setIsCustomExpiryDialogOpen={setIsCustomExpiryDialogOpen}
					handleQuickPaste={handleQuickPaste}
					handleCollaborative={handleCollaborative}
					isSubmitting={isSubmitting}
					isUploading={isUploading}
					uploadProgress={uploadProgress}
					handleDialogSubmit={handleDialogSubmit}
					dialogError={dialogError}
					shortenedResult={shortenedResult}
					isCode={contentType === "code"}
					language={language}
					isTerminalOpen={isTerminalOpen}
					onToggleTerminal={() => {
						const opening = !isTerminalOpen;
						setIsTerminalOpen(opening);
						if (opening && socket && textValue) {
							socket.emit("run-code", {
								code: textValue,
								language,
							});
						}
					}}
				>
					{(isDetecting || contentType === "code") && (
						<div className="flex items-center gap-2">
							<Suspense
								fallback={
									<div className="w-24 h-9 skeleton rounded-lg" />
								}
							>
								<LanguageSelector
									value={language}
									onValueChange={setLanguage}
									isDetecting={isDetecting}
								/>
							</Suspense>
							{!isDetecting && (
								<Button
									variant="outline"
									size="icon"
									className="h-9 w-9 shrink-0 bg-background/50 hover:bg-background/80 border-border/40 shadow-sm"
									onClick={() => {
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
							<>
								<Suspense
									fallback={
										<div className="w-20 h-9 skeleton rounded-lg" />
									}
								>
									<FontSizeControls
										fontSize={fontSize}
										setFontSize={setFontSize}
									/>
								</Suspense>
								<AiAutocompleteToggle
									enabled={isAiAutocompleteEnabled}
									onToggle={setIsAiAutocompleteEnabled}
								/>
							</>
						)}
				</MainToolbar>
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

			{/* Editor + Terminal: takes all remaining space */}
			<div className="flex-1 flex min-h-0 min-w-0 w-full h-full overflow-hidden">
				{(() => {
					const isTerminalVisible =
						isTerminalOpen && contentType === "code";

					const editorPanel = (
						<div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden h-full w-full">
							<Suspense fallback={<EditorSkeleton />}>
								<EditorContent
									fontSize={fontSize}
									editorContainerRef={editorContainerRef}
									userInputRef={userInputRef}
									handleEditorWillMount={
										handleEditorWillMount
									}
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
						</div>
					);

					const terminalPanel = (
						<TerminalContainer
							isOpen={isTerminalVisible}
							position={terminalPosition}
							onPositionChange={setTerminalPosition}
							onClose={() => setIsTerminalOpen(false)}
							code={textValue}
							language={language}
							fontSize={fontSize}
							socket={socket}
							className="mx-2 md:mx-4 mb-2"
						/>
					);

					if (!isTerminalVisible) {
						return editorPanel;
					}

					return (
						<ResizablePanels
							direction={
								terminalPosition === "bottom"
									? "vertical"
									: "horizontal"
							}
							initialSize={
								terminalPosition === "bottom" ? 62 : 65
							}
							minSize={20}
							maxSize={85}
							className="flex-1"
							first={editorPanel}
							second={terminalPanel}
							storageKey={`home-terminal-split-${terminalPosition}`}
						/>
					);
				})()}
			</div>

			<Suspense fallback={null}>
				<AiEnhanceDialog
					isOpen={isAiDialogOpen}
					onClose={() => setIsAiDialogOpen(false)}
					selectedText={selectedText}
					onApply={applyEnhancedText}
					initialInstruction={prefillInstruction}
				/>
			</Suspense>
		</div>
	);
};

export default HomePage;
