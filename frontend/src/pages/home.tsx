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
import { Code2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { playErrorSound } from "@/utils";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { CONFIG } from "@/configurations";
import { usePaste } from "@/context/PasteContext";
import { useAiEnhance } from "@/hooks/use-ai-enhance";
import { useHomeUrlSync } from "@/hooks/use-home-url-sync";
import { usePasteSubmission } from "@/hooks/use-paste-submission";
import { useSnippets } from "@/context/SnippetContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { useAiDraw } from "@/hooks/use-ai-draw";
import { TerminalContainer } from "@/components/terminal/terminal-container";
import { ResizablePanels } from "@/components/common/resizable-panels";
import { useAiAutocomplete } from "@/hooks/use-ai-autocomplete";
import { AiAutocompleteToggle } from "@/components/editor/ai-autocomplete-toggle";
import { storage } from "@/utils/storage";
import { AiDrawDialog } from "@/components/editor/ai-draw-dialog";
import { MainToolbar } from "@/components/home/main-toolbar";
import { usePasteHandlers } from "@/hooks/use-paste-handlers";
import { useTerminalExecution } from "@/hooks/use-terminal-execution";
import { VoiceInputButton } from "@/components/editor/voice-input-button";

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
		setFileUpload,
		resetFileUpload,
		fileName,
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
	const { handleSubmit, pendingFile, setPendingFile } =
		usePasteSubmission(setShortenedResult);
	const {
		fontSize,
		ref: editorContainerRefSetter,
		setFontSize,
	} = usePinchZoom(CONFIG.defaults.fontSize);

	const editorContainerRef = useRef<HTMLElement | null>(null);

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
		setPendingFile,
		setFileUpload,
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

	// Handle File Context
	useEffect(() => {
		if (contentType === "file") setExpiresTime("1d");
		setShortenedResult(null);
	}, [contentType, setExpiresTime]);

	useEffect(() => {
		if (textValue === "" && shortenedResult) setShortenedResult(null);
	}, [textValue, shortenedResult]);

	useEffect(() => {
		if (!pendingFile) {
			setPreviewUrl(null);
			return;
		}
		const objectUrl = URL.createObjectURL(pendingFile);
		setPreviewUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [pendingFile]);

	// Actions
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
				? !!fileName
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
									title={t("home.auto_detecting")}
								>
									<Code2 className="h-4 w-4 text-muted-foreground" />
								</Button>
							)}
						</div>
					)}

					{contentType === "draw" && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsAiDrawDialogOpen(true)}
							className="gap-2 h-9 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 shadow-lg shadow-primary/5 shrink-0"
						>
							<Sparkles className="h-4 w-4" />
							<span>{t("ai.draw_title")}</span>
						</Button>
					)}

					{["text", "code"].includes(contentType) && (
						<>
							<VoiceInputButton />
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

			<div className="flex-1 flex min-h-0 min-w-0 w-full h-full">
				{(() => {
					const isTerminalVisible =
						isTerminalOpen && contentType === "code";
					const editorPanel = (
						<div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-clip h-full w-full">
							<Suspense fallback={<EditorSkeleton />}>
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
									historyItems={history.items}
									onDeleteHistoryItem={deleteSnippet}
									drawRevision={drawRevision}
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
							className="m-2 md:mx-4 "
						/>
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
					onApply={applyEnhancedText}
					initialInstruction={prefillInstruction}
				/>
				<AiDrawDialog
					isOpen={isAiDrawDialogOpen}
					onClose={() => setIsAiDrawDialogOpen(false)}
					onApply={handleAiDrawApply}
				/>
			</Suspense>
		</div>
	);
};

export default HomePage;
