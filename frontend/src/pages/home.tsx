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
	clearDrafts,
} from "@/lib/utils";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { useAuth } from "@/context/AuthContext";
import { type UploadState } from "@/hooks/use-file-upload";
import type {
	IdType,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
	ContentMode,
	PasteData,
} from "@/types";
import { CONFIG } from "@/configurations";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { usePaste } from "@/context/PasteContext";

import { LanguageSelector } from "@/components/editor/language-selector";
import { FontSizeControls } from "@/components/editor/font-size-controls";
import { CustomExpiryDialog } from "@/components/home/custom-expiry-dialog";
import { MainToolbar } from "@/components/home/main-toolbar";
import { EditorContent } from "@/components/home/editor-content";

const HomePage = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const navigate = useNavigate();
	const apiHelpers = useApiHelpers();

	// Refs
	const userInputRef = useRef<HTMLTextAreaElement>(null);
	const valueRef = useRef("");
	const previousLengthRef = useRef(0);
	const hasDetectedRef = useRef(false);
	const uploadPromiseRef = useRef<Promise<UploadState> | null>(null);

	const {
		visibility,
		editPermission,
		allowedUsers,
		shareList,
		publicRole,
		allowComments,
		expiresTime,
		setExpiresTime,
		contentType,
		setContentType,
		language,
		setLanguage,
		textValue,
		password,
		setPassword,
		idTypeTab,
		customId,
		setCustomId,
		fastRedirect,
		isSubmitting,
		setIsSubmitting,
		isUploading,
		uploadProgress,
		uploadFile,
		setFileUpload,
		resetFileUpload,
		fileUrl,
		fileName,
		fileSize,
		fileMimeType,
		onContentTypeChange,
	} = usePaste();

	const [pendingFile, setPendingFile] = useState<File | null>(null);
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

	// Keep valueRef in sync with context's textValue
	useEffect(() => {
		previousLengthRef.current = valueRef.current.trim().length;
		valueRef.current = textValue;
	}, [textValue]);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const tab = params.get("tab");
		const fs = params.get("fullscreen");

		if (
			tab &&
			["text", "code", "draw", "link", "file"].includes(tab) &&
			tab !== contentType
		) {
			setContentType(tab as ContentMode);
		}

		if (fs === "true") {
			setIsFullscreen(true);
		}
	}, [contentType, setContentType]);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		let changed = false;

		if (contentType !== params.get("tab")) {
			if (contentType === CONFIG.DEFAULTS.CONTENT_MODE) {
				params.delete("tab");
			} else {
				params.set("tab", contentType);
			}
			changed = true;
		}

		if (isFullscreen.toString() !== (params.get("fullscreen") || "false")) {
			if (isFullscreen) params.set("fullscreen", "true");
			else params.delete("fullscreen");
			changed = true;
		}

		if (changed) {
			const newRelativePathQuery =
				window.location.pathname +
				(params.toString() ? "?" + params.toString() : "") +
				window.location.hash;
			window.history.replaceState(null, "", newRelativePathQuery);
		}
	}, [contentType, isFullscreen]);

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

	const [shortenedResult, setShortenedResult] = useState<{
		id: string;
		url: string;
	} | null>(null);
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
				t("messages.snippet_created", {
					idType: selectedIdType,
					id: `/${data.id}`,
					defaultValue: `Snippet created: /${data.id}`,
				}),
				{
					position: "bottom-right",
				},
			);

			if (contentType === "link") {
				setShortenedResult({
					id: data.id,
					url: window.location.origin + "/" + data.id,
				});
				return true;
			}

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

	const handleEditorMount: OnMount = (editor) => {
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
		const result = await handleSubmit(idTypeTab, selectedId, {
			redirectUrl: fastRedirect,
		});
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
				/>

				<div className="flex flex-wrap items-center gap-2">
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

			{/* Editor: takes all remaining space */}
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
		</div>
	);
};

export default HomePage;
