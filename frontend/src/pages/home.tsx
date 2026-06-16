import {
	useRef,
	useState,
	useEffect,
	lazy,
	Suspense,
	useCallback,
} from "react";
import { type Monaco } from "@monaco-editor/react";
import { type editor } from "monaco-editor";
import { useTranslation } from "react-i18next";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import { cn, playErrorSound } from "@/utils";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { CONFIG } from "@/configurations";
import { Editor } from "@tiptap/core";
import { usePaste } from "@/context/PasteContext";
import { useAiEnhance } from "@/hooks/use-ai-enhance";
import { useHomeUrlSync } from "@/hooks/use-home-url-sync";
import { usePasteSubmission } from "@/hooks/use-paste-submission";
import { useSnippets } from "@/context/SnippetContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAiDraw } from "@/hooks/use-ai-draw";
const TerminalContainer = lazy(() =>
	import("@/components/terminal/terminal-container").then((m) => ({
		default: m.TerminalContainer,
	})),
);
const ResizablePanels = lazy(() =>
	import("@/components/common/resizable-panels").then((m) => ({
		default: m.ResizablePanels,
	})),
);
import { useAiAutocomplete } from "@/hooks/use-ai-autocomplete";
import { storage } from "@/utils/storage";
import { MainToolbar } from "@/components/home/main-toolbar";
const AiDrawDialog = lazy(() =>
	import("@/components/editor/ai-draw-dialog").then((m) => ({
		default: m.AiDrawDialog,
	})),
);
import { usePasteHandlers } from "@/hooks/use-paste-handlers";
import { useTerminalExecution } from "@/hooks/use-terminal-execution";

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
import { EditorContent } from "@/components/home/editor-content";
const VoiceInputButton = lazy(() =>
	import("@/components/editor/voice-input-button").then((m) => ({
		default: m.VoiceInputButton,
	})),
);
const AiAutocompleteToggle = lazy(() =>
	import("@/components/editor/ai-autocomplete-toggle").then((m) => ({
		default: m.AiAutocompleteToggle,
	})),
);
const TransliterationToggle = lazy(() =>
	import("@/components/editor/transliteration-toggle").then((m) => ({
		default: m.TransliterationToggle,
	})),
);
import { useTransliteration } from "@/hooks/use-transliteration";
const AiEnhanceDialog = lazy(() =>
	import("@/components/editor/ai-enhance-dialog").then((m) => ({
		default: m.AiEnhanceDialog,
	})),
);
const AiWriterDialog = lazy(() =>
	import("@/components/editor/ai-writer-dialog").then((m) => ({
		default: m.AiWriterDialog,
	})),
);

// New Lazy Buttons
const AiDrawButton = lazy(() =>
	import("@/components/editor/ai-draw-button").then((m) => ({
		default: m.AiDrawButton,
	})),
);
const AiWriterButton = lazy(() =>
	import("@/components/editor/ai-writer-button").then((m) => ({
		default: m.AiWriterButton,
	})),
);

// Shimmer Skeletons

const HomePage = () => {
	const { t } = useTranslation();

	// Paste Context
	const {
		expiresTime,
		setExpiresTime,
		contentType,
		setContentType,
		language,
		setLanguage,
		textValue,
		setTextValue,
		setPassword,
		idTypeTab,
		customId,
		setCustomId,
		isSubmitting,
		isUploading,
		uploadProgress,
		addFiles,
		resetFileUpload,
		files,
		previewUrl: contextPreviewUrl,
		hasPending,
		onContentTypeChange,
	} = usePaste();

	const getTitle = useCallback(() => {
		const mapping: Record<string, string> = {
			text: t("editor.plain_text"),
			code: t("editor.code"),
			draw: t("editor.drawing"),
			link: t("editor.shorten_link"),
			file: t("editor.file"),
		};
		return mapping[contentType] || t("common.share_code_text");
	}, [contentType, t]);

	usePageTitle(undefined, getTitle());
	const { history, deleteSnippet } = useSnippets();

	// UI States
	const [shortenedResult, setShortenedResult] = useState<{
		id: string;
		url: string;
	} | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isCustomExpiryDialogOpen, setIsCustomExpiryDialogOpen] =
		useState(false);
	const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(
		new Date(Date.now() + 24 * 60 * 60 * 1000),
	);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [dialogError, setDialogError] = useState("");
	const [drawRevision, setDrawRevision] = useState(0);

	// Refs
	const userInputRef = useRef<HTMLTextAreaElement>(null);
	const editorInstanceRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const monacoInstanceRef = useRef<Monaco | null>(null);

	// Custom Hooks
	const { handleSubmit } = usePasteSubmission(setShortenedResult);
	const {
		fontSize,
		ref: editorContainerRefSetter,
		setFontSize,
	} = usePinchZoom(CONFIG.defaults.fontSize);

	const editorContainerRef = useRef<HTMLElement | null>(null);

	const {
		isAiDialogOpen,
		setIsAiDialogOpen,
		isAiWriterDialogOpen,
		setIsAiWriterDialogOpen,
		selectedText,
		setSelectedText,
		prefillInstruction,
		setupAiAction,
		applyEnhancedText,
		applyWriterText,
	} = useAiEnhance();

	const tiptapEditorRef = useRef<Editor | null>(null);
	const handleTiptapMount = useCallback((editor: Editor | null) => {
		tiptapEditorRef.current = editor;
	}, []);

	const handleApplyEnhancedText = useCallback(
		(newText: string) => {
			if (contentType === "richtext" && tiptapEditorRef.current) {
				tiptapEditorRef.current
					.chain()
					.focus()
					.insertContent(newText)
					.run();
				return;
			}
			applyEnhancedText(newText);
		},
		[applyEnhancedText, contentType],
	);

	const handleApplyWriterText = useCallback(
		(newText: string) => {
			if (contentType === "richtext" && tiptapEditorRef.current) {
				tiptapEditorRef.current
					.chain()
					.focus()
					.insertContent(newText)
					.run();
				return;
			}
			applyWriterText(newText);
		},
		[applyWriterText, contentType],
	);

	const [isAiAutocompleteEnabled, setIsAiAutocompleteEnabled] = useState(() =>
		storage.get(CONFIG.storageKeys.aiAutocomplete, false),
	);

	const { setupAutocomplete } = useAiAutocomplete({
		language,
		enabled: isAiAutocompleteEnabled,
	});

	const { isAiDrawDialogOpen, setIsAiDrawDialogOpen, handleAiDrawApply } =
		useAiDraw({
			drawRevision,
			setDrawRevision,
			setTextValue,
		});

	const {
		isTerminalOpen,
		setIsTerminalOpen,
		socket,
		terminalPosition,
		setTerminalPosition,
		toggleTerminal,
	} = useTerminalExecution({ textValue, language });

	const transliteration = useTransliteration();

	const {
		handlePaste,
		handleEditorMount,
		handleLanguageDetection,
		isDetecting,
		valueRef,
		hasDetectedRef,
	} = usePasteHandlers({
		isSubmitting,
		isUploading,
		contentType,
		setContentType,
		addFiles,
		textValue,
		setLanguage,
		setupAiAction,
		setupAutocomplete,
	});

	// Sync Autocomplete
	useEffect(() => {
		storage.set(CONFIG.storageKeys.aiAutocomplete, isAiAutocompleteEnabled);
		if (editorInstanceRef.current && monacoInstanceRef.current) {
			setupAutocomplete(
				editorInstanceRef.current,
				monacoInstanceRef.current,
			);
		}
	}, [isAiAutocompleteEnabled, setupAutocomplete]);

	// URL Sync
	useHomeUrlSync({
		contentType,
		isFullscreen,
		onContentTypeChange,
		setIsFullscreen,
	});

	useEffect(() => {
		setShortenedResult(null);
	}, [contentType, setExpiresTime]);

	useEffect(() => {
		if (textValue === "" && shortenedResult) setShortenedResult(null);
	}, [textValue, shortenedResult]);

	useEffect(() => {
		if (contextPreviewUrl) {
			setPreviewUrl(contextPreviewUrl);
		} else {
			setPreviewUrl(null);
		}
	}, [contextPreviewUrl]);

	// Actions
	const handleQuickPaste = async () => {
		const hasContent =
			contentType === "file"
				? files.length > 0 || hasPending
				: contentType === "video"
					? valueRef.current.trim().length > 0 ||
						files.length > 0 ||
						hasPending
					: contentType === "draw"
						? true
						: valueRef.current.trim().length > 0;
		if (!hasContent) {
			playErrorSound();
			toast.warning(
				t(
					contentType === "file"
						? "messages.empty_file"
						: "messages.empty_content",
				),
			);
			return;
		}
		const result = await handleSubmit(
			idTypeTab,
			idTypeTab === "dynamic" ? customId.trim() : undefined,
			{},
		);
		if (result !== true) toast.error(result as string);
	};

	const handleCollaborative = async () => {
		const hasContent =
			contentType === "file"
				? files.length > 0 || hasPending
				: contentType === "video"
					? valueRef.current.trim().length > 0 ||
						files.length > 0 ||
						hasPending
					: contentType === "draw"
						? true
						: valueRef.current.trim().length > 0;
		if (!hasContent) {
			playErrorSound();
			toast.warning(
				t(
					contentType === "file"
						? "messages.empty_file"
						: "messages.empty_content",
				),
			);
			return;
		}
		const result = await handleSubmit(
			idTypeTab,
			idTypeTab === "dynamic" ? customId.trim() : undefined,
			{
				visibility: "public",
				editPermission: "public",
				publicRole: "editor",
				isCollaborative: true,
			},
		);
		if (result !== true) toast.error(result as string);
	};

	const handleDialogSubmit = async () => {
		setDialogError("");
		const result = await handleSubmit(
			idTypeTab,
			idTypeTab === "dynamic" ? customId.trim() : undefined,
			{},
		);
		if (result === true) {
			if (idTypeTab === "dynamic") setCustomId("");
			setPassword("");
		} else {
			setDialogError(result as string);
		}
	};

	const onEditorMount = useCallback(
		(editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
			editorInstanceRef.current = editor;
			monacoInstanceRef.current = monaco;
			handleEditorMount(editor, monaco);
		},
		[handleEditorMount],
	);

	return (
		<div className="relative flex-1 flex flex-col bg-background overflow-hidden">
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
					onToggleTerminal={toggleTerminal}
				>
					{(isDetecting || contentType === "code") && (
						<Suspense
							fallback={
								<div className="flex items-center gap-2">
									<Skeleton className="w-24 h-9 rounded-lg" />
									<Skeleton className="w-9 h-9 rounded-lg" />
								</div>
							}
						>
							<div className="flex items-center gap-2">
								<LanguageSelector
									value={language}
									onValueChange={setLanguage}
									isDetecting={isDetecting}
								/>
								{!isDetecting && (
									<Button
										variant="outline"
										size="icon"
										className="h-9 w-9 shrink-0 bg-background/50 hover:bg-background/80 border-border/40 shadow-sm"
										onClick={() => {
											hasDetectedRef.current = false;
											handleLanguageDetection(textValue);
										}}
										title={t("home.auto_detecting")}
									>
										<Code2 className="h-4 w-4 text-muted-foreground" />
									</Button>
								)}
							</div>
						</Suspense>
					)}

					{contentType === "draw" && (
						<Suspense
							fallback={
								<Skeleton className="h-9 w-24 rounded-lg shrink-0" />
							}
						>
							<AiDrawButton
								onClick={() => setIsAiDrawDialogOpen(true)}
							/>
						</Suspense>
					)}

					{["text", "code", "richtext"].includes(contentType) && (
						<Suspense
							fallback={
								<div className="flex items-center gap-2">
									<Skeleton className="h-9 w-9 rounded-lg" />
									<Skeleton className="h-9 w-32 rounded-lg" />
									<div className="w-px h-6 bg-border/20 mx-1" />
									<Skeleton className="h-9 w-9 rounded-lg" />
									<Skeleton className="h-9 w-20 rounded-lg" />
								</div>
							}
						>
							<div className="flex items-center gap-2">
								<AiWriterButton
									onClick={() => {
										if (
											contentType === "richtext" &&
											tiptapEditorRef.current
										) {
											const { from, to } =
												tiptapEditorRef.current.state
													.selection;
											const text =
												tiptapEditorRef.current.state.doc.textBetween(
													from,
													to,
													" ",
												);
											setSelectedText(text);
										} else if (editorInstanceRef.current) {
											const selection =
												editorInstanceRef.current.getSelection();
											if (
												selection &&
												!selection.isEmpty()
											) {
												const text =
													editorInstanceRef.current
														.getModel()
														?.getValueInRange(
															selection,
														);
												if (text) setSelectedText(text);
											} else {
												setSelectedText("");
											}
										}
										setIsAiWriterDialogOpen(true);
									}}
								/>

								<AiAutocompleteToggle
									enabled={isAiAutocompleteEnabled}
									onToggle={setIsAiAutocompleteEnabled}
								/>

								<div className="w-px h-6 bg-border/40 mx-1" />

								{["text", "richtext"].includes(contentType) && (
									<TransliterationToggle
										enabled={transliteration.enabled}
										onToggle={transliteration.toggle}
										language={
											transliteration.targetLanguage
										}
										onLanguageChange={
											transliteration.setTargetLanguage
										}
									/>
								)}

								<VoiceInputButton />

								<FontSizeControls
									fontSize={fontSize}
									setFontSize={setFontSize}
								/>
							</div>
						</Suspense>
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

			<div className="flex-1 flex min-h-0 min-w-0 w-full h-full">
				{(() => {
					const isTerminalVisible =
						isTerminalOpen && contentType === "code";
					const editorPanel = (
						<div
							className={cn(
								"flex-1 flex flex-col min-h-0 min-w-0 h-full w-full",
								contentType !== "richtext" && "overflow-clip",
							)}
						>
							<EditorContent
								fontSize={fontSize}
								editorContainerRef={(node) => {
									editorContainerRef.current = node;
									editorContainerRefSetter(node);
								}}
								userInputRef={userInputRef}
								handleEditorWillMount={defineMonacoThemes}
								handleEditorMount={onEditorMount}
								handlePaste={handlePaste}
								isFullscreen={isFullscreen}
								setIsFullscreen={setIsFullscreen}
								onFileSelect={(selectedFiles) => {
									addFiles(selectedFiles);
								}}
								onClearFile={() => {
									resetFileUpload();
								}}
								previewUrl={previewUrl}
								shortenedResult={shortenedResult}
								historyItems={history.items}
								onDeleteHistoryItem={deleteSnippet}
								drawRevision={drawRevision}
								transliteration={transliteration}
								onEditorInstance={handleTiptapMount}
							/>
						</div>
					);

					const terminalPanel = (
						<Suspense
							fallback={
								<div className="m-2 md:mx-4 h-40 skeleton rounded-xl opacity-50" />
							}
						>
							<TerminalContainer
								isOpen={isTerminalVisible}
								position={terminalPosition}
								onPositionChange={setTerminalPosition}
								onClose={() => setIsTerminalOpen(false)}
								code={textValue}
								language={language}
								fontSize={fontSize}
								socket={socket}
								className="m-2 md:mx-4 "
							/>
						</Suspense>
					);

					if (!isTerminalVisible) return editorPanel;

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
					onApply={handleApplyEnhancedText}
					initialInstruction={prefillInstruction}
					contentType={contentType}
				/>
				<AiWriterDialog
					isOpen={isAiWriterDialogOpen}
					onClose={() => setIsAiWriterDialogOpen(false)}
					onApply={handleApplyWriterText}
					selectedText={selectedText}
					contentType={contentType}
				/>
				<Suspense fallback={null}>
					<AiDrawDialog
						isOpen={isAiDrawDialogOpen}
						onClose={() => setIsAiDrawDialogOpen(false)}
						onApply={handleAiDrawApply}
					/>
				</Suspense>
			</Suspense>
		</div>
	);
};

export default HomePage;
