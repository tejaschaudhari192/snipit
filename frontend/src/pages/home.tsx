import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { type OnMount, type BeforeMount } from "@monaco-editor/react";
import { AxiosError } from "axios";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useApiHelpers } from "@/lib/api";
import {
	saveToLocal,
	playErrorSound,
	playSuccessSound,
	saveDraft,
	getDraft,
	clearDrafts,
} from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { useAuth } from "@/context/AuthContext";
import { useFileUpload, type UploadState } from "@/hooks/use-file-upload";
import type {
	IdType,
	ContentMode,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
} from "@/types";
import { CONFIG } from "@/configurations";
import { useLanguageDetection } from "@/hooks/use-language-detection";

import { LanguageSelector } from "@/components/editor/language-selector";
import { FontSizeControls } from "@/components/editor/font-size-controls";
import { CustomExpiryDialog } from "@/components/home/custom-expiry-dialog";
import { PasteDialog } from "@/components/home/paste-dialog";
import { MainToolbar } from "@/components/home/main-toolbar";
import { EditorContent } from "@/components/home/editor-content";

const HomePage = () => {
	const userInputRef = useRef<HTMLTextAreaElement>(null);
	const valueRef = useRef("");
	const previousLengthRef = useRef(0);
	const {
		fontSize,
		ref: editorContainerRef,
		setFontSize,
	} = usePinchZoom(CONFIG.DEFAULTS.FONT_SIZE);
	const { user } = useAuth();
	const navigate = useNavigate();
	const apiHelpers = useApiHelpers();
	const { t } = useTranslation();
	const { theme } = useTheme();

	const [visibility, setVisibility] = useState<Visibility>(
		CONFIG.DEFAULTS.VISIBILITY,
	);
	const [editPermission, setEditPermission] = useState<EditPermission>(
		CONFIG.DEFAULTS.EDIT_PERMISSION,
	);
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
	const [shareList, setShareList] = useState<
		{ email: string; role: ShareRole }[]
	>([]);
	const [publicRole, setPublicRole] = useState<PublicRole>(
		CONFIG.DEFAULTS.PUBLIC_ROLE,
	);
	const [allowComments, setAllowComments] = useState(false);
	const [expiresTime, setExpiresTime] = useState(CONFIG.DEFAULTS.EXPIRY);
	const [textValue, _setTextValue] = useState(() => {
		return getDraft(CONFIG.DEFAULTS.CONTENT_MODE) || "";
	});
	const [contentType, setContentType] = useState<ContentMode>(
		CONFIG.DEFAULTS.CONTENT_MODE,
	);
	const onContentTypeChange = (newMode: ContentMode) => {
		// Update language based on target mode
		if (newMode === "text") {
			_setLanguage("text");
		} else if (newMode === "code") {
			// If currently plain text, switch to default code language
			_setLanguage(
				CONFIG.DEFAULTS.LANGUAGE === "text"
					? "javascript"
					: CONFIG.DEFAULTS.LANGUAGE,
			);
		}

		// Persist current content
		saveDraft(contentType, textValue);

		// Load appropriate draft for the new mode
		const draft = getDraft(newMode);
		if (draft !== null) {
			_setTextValue(draft);
			valueRef.current = draft;
		} else if (newMode === "draw") {
			const emptyDraw = JSON.stringify({ elements: [], appState: {} });
			_setTextValue(emptyDraw);
			valueRef.current = emptyDraw;
		} else {
			_setTextValue("");
			valueRef.current = "";
		}

		setContentType(newMode);
	};
	const { isDetecting, detectLanguage } = useLanguageDetection();
	const [language, _setLanguage] = useState(CONFIG.DEFAULTS.LANGUAGE);
	const setLanguage = (newLang: string) => {
		_setLanguage(newLang);
		if (newLang === "text") {
			if (contentType === "code") setContentType("text");
		} else {
			if (isDetecting) return; // Don't flip tab while detecting
			if (contentType === "text") setContentType("code");
		}
	};
	const hasDetectedRef = useRef(false);
	const uploadPromiseRef = useRef<Promise<UploadState> | null>(null);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isCustomExpiryDialogOpen, setIsCustomExpiryDialogOpen] =
		useState(false);
	const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(
		new Date(Date.now() + 24 * 60 * 60 * 1000),
	);

	useEffect(() => {
		if (contentType === "file") {
			setExpiresTime("1d");
		}
	}, [contentType]);

	// Reset detection flag whenever the editor is cleared or mode changes

	useEffect(() => {
		if (!pendingFile) {
			setPreviewUrl(null);
			return;
		}
		const objectUrl = URL.createObjectURL(pendingFile);
		setPreviewUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [pendingFile]);

	const [customId, setCustomId] = useState("");
	const [password, setPassword] = useState("");
	const [idTypeTab, setIdTypeTab] = useState<"system" | "dynamic">("system");
	const [dialogError, setDialogError] = useState("");
	const [fastRedirect, setFastRedirect] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const {
		isUploading,
		progress: uploadProgress,
		error: uploadError,
		fileUrl,
		fileName,
		fileSize,
		fileMimeType,
		uploadFile,
		setFile: setFileUpload,
		reset: resetFileUpload,
	} = useFileUpload();

	const setTextValue = (val: string) => {
		previousLengthRef.current = valueRef.current.trim().length;
		_setTextValue(val);
		valueRef.current = val;
		saveDraft(contentType, val);
	};

	const handleSubmit = async (
		selectedIdType: IdType,
		providedId?: string,
		options: {
			visibility?: Visibility;
			password?: string;
			editPermission?: EditPermission;
			allowedUsers?: string[];
			shareList?: {
				email: string;
				role: ShareRole;
			}[];
			publicRole?: PublicRole;
			allowComments?: boolean;
			redirectUrl?: boolean;
			isCollaborative?: boolean;
		} = {},
	) => {
		try {
			setIsSubmitting(true);
			const finalVisibility = options.visibility ?? visibility;
			const finalEditPermission =
				options.editPermission ?? editPermission;

			let currentFileUrl = fileUrl;
			let currentFileName = fileName;
			let currentFileSize = fileSize;
			let currentFileMimeType = fileMimeType;

			if (contentType === "file" && pendingFile && !currentFileUrl) {
				const uploadResult = await uploadFile(pendingFile);
				if (uploadResult.error) {
					throw new Error(uploadResult.error);
				}
				currentFileUrl = uploadResult.fileUrl;
				currentFileName = uploadResult.fileName;
				currentFileSize = uploadResult.fileSize;
				currentFileMimeType = uploadResult.fileMimeType;
				setPendingFile(null);
			} else if (
				contentType === "file" &&
				isUploading &&
				uploadPromiseRef.current
			) {
				const uploadResult = await uploadPromiseRef.current;
				if (uploadResult.error) {
					throw new Error(uploadResult.error);
				}
				currentFileUrl = uploadResult.fileUrl;
				currentFileName = uploadResult.fileName;
				currentFileSize = uploadResult.fileSize;
				currentFileMimeType = uploadResult.fileMimeType;
			}

			const data = await apiHelpers.submitPaste({
				content:
					contentType === "file"
						? currentFileUrl || currentFileName || "File upload"
						: contentType === "draw" && !valueRef.current.trim()
							? JSON.stringify({ elements: [], appState: {} })
							: valueRef.current,
				expiresTime,
				idType: selectedIdType,
				customId: providedId,
				contentMode: contentType,
				fileUrl: contentType === "file" ? currentFileUrl : undefined,
				fileName: contentType === "file" ? currentFileName : undefined,
				fileSize: contentType === "file" ? currentFileSize : undefined,
				fileMimeType:
					contentType === "file" ? currentFileMimeType : undefined,
				redirectUrl:
					contentType === "link" ||
					(contentType === "file" && options.redirectUrl === true),
				language: contentType === "code" ? language : "text",
				burnAfterRead: expiresTime === "one-time",
				visibility: finalVisibility,
				allowedUsers:
					finalVisibility === "shared" ||
					finalEditPermission === "shared"
						? (options.allowedUsers ?? allowedUsers)
						: undefined,
				password: (options.password ?? password) || undefined,
				editPermission: finalEditPermission,
				shareList: options.shareList ?? shareList,
				publicRole: options.publicRole ?? publicRole,
				allowComments: options.allowComments ?? allowComments,
			});
			playSuccessSound();
			toast.success(
				t("messages.snippet_created", { idType: selectedIdType }),
				{
					position: "bottom-right",
				},
			);
			navigate("/" + data.id, {
				state: {
					pasteData: data,
					isCollaborative: options.isCollaborative,
				},
			});
			if (!user) {
				saveToLocal(data);
			}
			clearDrafts();
			return true;
		} catch (error) {
			const axiosError = error as AxiosError<{
				error: string;
				details?: { path: string[]; message: string }[];
			}>;
			if (axiosError.response?.status === 409)
				return t("messages.id_conflict");
			const details = axiosError.response?.data?.details;
			if (details && details.length > 0) return details[0].message;
			return (
				axiosError.response?.data?.error || t("messages.snippet_failed")
			);
		} finally {
			setIsSubmitting(false);
		}
	};

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
		const result = await handleSubmit("system", undefined, {
			visibility: "public",
			password: "",
			editPermission: "owner",
			allowedUsers: [],
			shareList: [],
			publicRole: "viewer",
			allowComments: false,
		});
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
		const result = await handleSubmit("system", undefined, {
			visibility: "public",
			password: "",
			editPermission: "public",
			allowedUsers: [],
			shareList: [],
			publicRole: "editor",
			allowComments: false,
			isCollaborative: true,
		});
		if (result !== true) {
			toast.error(result as string);
		}
	};

	const handleLanguageDetection = async (content: string) => {
		if (hasDetectedRef.current) return;
		// Mark as attempted so subsequent pastes are ignored
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
		// Only detect on first paste when editor is empty
		if (valueRef.current.trim() !== "") return;
		handleLanguageDetection(
			e.clipboardData.getData("text/plain") ||
				e.clipboardData.getData("text"),
		);
	};

	const handleEditorMount: OnMount = (editor) => {
		editor.onDidPaste(() => {
			const value = editor.getValue();
			// Only auto detect if the editor was completely empty before the paste
			if (previousLengthRef.current === 0) {
				handleLanguageDetection(value);
			}
		});
	};

	const handleCreationClick = () => {
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
		setIsDialogOpen(true);
		setDialogError("");
	};

	const handleDialogSubmit = async () => {
		setDialogError("");
		const selectedId =
			idTypeTab === "dynamic" ? customId.trim() : undefined;
		const result = await handleSubmit(idTypeTab, selectedId, {
			redirectUrl: fastRedirect,
		});
		if (result === true) {
			setIsDialogOpen(false);
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
			{/* Ambient Background Glows */}
			<div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
			<div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

			<div className="relative z-10 flex flex-col gap-4 my-2 mx-3 md:my-4 md:mx-5">
				<MainToolbar
					contentType={contentType}
					setContentType={onContentTypeChange}
					expiresTime={expiresTime}
					setExpiresTime={setExpiresTime}
					setIsCustomExpiryDialogOpen={setIsCustomExpiryDialogOpen}
					handleCreationClick={handleCreationClick}
					handleQuickPaste={handleQuickPaste}
					handleCollaborative={handleCollaborative}
					isSubmitting={isSubmitting}
					isUploading={isUploading}
					uploadProgress={uploadProgress}
				/>

				<div className="flex flex-wrap items-center gap-3">
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
				</div>
			</div>

			<PasteDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				idTypeTab={idTypeTab}
				setIdTypeTab={setIdTypeTab}
				customId={customId}
				setCustomId={setCustomId}
				visibility={visibility}
				setVisibility={setVisibility}
				allowedUsers={allowedUsers}
				setAllowedUsers={setAllowedUsers}
				password={password}
				setPassword={setPassword}
				editPermission={editPermission}
				setEditPermission={setEditPermission}
				shareList={shareList}
				setShareList={setShareList}
				publicRole={publicRole}
				setPublicRole={setPublicRole}
				allowComments={allowComments}
				setAllowComments={setAllowComments}
				dialogError={dialogError}
				user={user}
				isSubmitting={isSubmitting}
				onSubmit={handleDialogSubmit}
				fastRedirect={fastRedirect}
				setFastRedirect={setFastRedirect}
				contentType={contentType}
				isUploading={isUploading}
				uploadProgress={uploadProgress}
			/>

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

			<EditorContent
				contentType={contentType}
				language={language}
				textValue={textValue}
				setTextValue={setTextValue}
				theme={theme}
				fontSize={fontSize}
				editorContainerRef={editorContainerRef}
				userInputRef={userInputRef}
				handleEditorWillMount={handleEditorWillMount}
				handleEditorMount={handleEditorMount}
				handlePaste={handlePaste}
				onFileSelect={(file) => {
					setPendingFile(file);
					setFileUpload(file);
				}}
				uploadProgress={uploadProgress}
				isUploading={isUploading}
				uploadedFileName={fileName}
				uploadError={uploadError}
				onClearFile={() => {
					resetFileUpload();
					setPendingFile(null);
				}}
				fileMimeType={fileMimeType}
				previewUrl={previewUrl}
			/>
		</div>
	);
};

export default HomePage;
