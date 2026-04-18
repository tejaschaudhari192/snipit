import {
	useEffect,
	useState,
	useRef,
	useCallback,
	lazy,
	Suspense,
} from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { AxiosError } from "axios";
import { io, type Socket } from "socket.io-client";
import { CONFIG } from "@/configurations";

import { useApiHelpers } from "@/lib/api";
import {
	saveToLocal,
	playErrorSound,
	playRemoveSound,
	detectContentMode,
	saveDraft,
	getDraft,
	clearDrafts,
	cn,
} from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { useRemoteCursors } from "@/hooks/use-remote-cursors";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { useTerminalLayout } from "@/hooks/use-terminal-layout";
import { useTranslation } from "react-i18next";
import type {
	ActiveUser,
	CursorPosition,
	PasteData,
	ContentMode,
	Visibility,
	EditPermission,
	PublicRole,
	ShareRole,
} from "@/types";

import { ShimmerSection } from "@/components/common/shimmer-section";
import DisplayError from "@/components/common/core/error";

import { TerminalContainer } from "@/components/terminal/terminal-container";
import { ResizablePanels } from "@/components/common/resizable-panels";
const DisplayToolbar = lazy(() =>
	import("@/components/display/display-toolbar").then((m) => ({
		default: m.DisplayToolbar,
	})),
);
const DisplayMetadata = lazy(() =>
	import("@/components/display/display-metadata").then((m) => ({
		default: m.DisplayMetadata,
	})),
);
const DisplayContent = lazy(() =>
	import("@/components/display/display-content").then((m) => ({
		default: m.DisplayContent,
	})),
);
const EditControls = lazy(() =>
	import("@/components/display/edit-controls").then((m) => ({
		default: m.EditControls,
	})),
);
const CustomExpiryDialog = lazy(() =>
	import("@/components/home/custom-expiry-dialog").then((m) => ({
		default: m.CustomExpiryDialog,
	})),
);
const PasswordGate = lazy(() =>
	import("@/components/display/password-gate").then((m) => ({
		default: m.PasswordGate,
	})),
);
const AiEnhanceDialog = lazy(() =>
	import("@/components/editor/ai-enhance-dialog").then((m) => ({
		default: m.AiEnhanceDialog,
	})),
);
const DeletePasteDialog = lazy(() =>
	import("@/components/display/delete-paste-dialog").then((m) => ({
		default: m.DeletePasteDialog,
	})),
);

import { useLanguageDetection } from "@/hooks/use-language-detection";
import { useAiEnhance } from "@/hooks/use-ai-enhance";
import { useFileUpload } from "@/hooks/use-file-upload";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ShareEntry {
	email: string;
	role: ShareRole;
}

interface SyncState {
	content?: string;
	language?: string;
	contentMode?: ContentMode;
	visibility?: Visibility;
	allowedUsers?: string[];
	editPermission?: EditPermission;
	publicRole?: PublicRole;
	allowComments?: boolean;
	expiresTime?: string;
	id?: string;
	isAutosave?: boolean;
}

const DisplayPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const apiHelpers = useApiHelpers();
	const { theme } = useTheme();
	const { user } = useAuth();
	const { t } = useTranslation();

	const [isEdit, setIsEdit] = useState(false);
	const [paste, setPaste] = useState<PasteData>();
	usePageTitle(
		undefined,
		paste ? `/${paste.id} (${paste.language || "text"})` : `/${id}`,
	);
	const [updatedContent, setUpdatedContent] = useState<string>();
	const [loading, setLoading] = useState(true);
	const [contentType, setContentType] = useState<ContentMode>(
		CONFIG.DEFAULTS.CONTENT_MODE,
	);
	const [visibility, setVisibility] = useState<Visibility>(
		CONFIG.DEFAULTS.VISIBILITY,
	);
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
	const [editPermission, setEditPermission] = useState<EditPermission>(
		CONFIG.DEFAULTS.EDIT_PERMISSION,
	);
	const [shareList, setShareList] = useState<ShareEntry[]>([]);
	const [publicRole, setPublicRole] = useState<PublicRole>(
		CONFIG.DEFAULTS.PUBLIC_ROLE,
	);
	const [allowComments, setAllowComments] = useState(false);
	const [customId, setCustomId] = useState("");
	const [passwordInput, setPasswordInput] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [editPassword, setEditPassword] = useState("");
	const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
	const [expiresTime, setExpiresTime] = useState(CONFIG.DEFAULTS.EXPIRY);
	const [isCustomExpiryDialogOpen, setIsCustomExpiryDialogOpen] =
		useState(false);
	const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(
		new Date(Date.now() + 24 * 60 * 60 * 1000),
	);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
	const [isAutosave, setIsAutosave] = useState(true);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isWindowFullscreen, setIsWindowFullscreen] = useState(false);
	const [isServerFileRemoved, setIsServerFileRemoved] = useState(false);
	const [isTerminalOpen, setIsTerminalOpen] = useState(false);
	const { terminalPosition, setTerminalPosition } = useTerminalLayout();
	const [socket, setSocket] = useState<Socket | null>(null);

	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const {
		isUploading: isFileUploading,
		progress: fileUploadProgress,
		error: fileUploadError,
		fileName: uploadedFileName,
		uploadFile,
		setFile: setFileUpload,
		reset: resetFileUpload,
	} = useFileUpload();

	useEffect(() => {
		if (!pendingFile) {
			setPreviewUrl(null);
			return;
		}
		const objectUrl = URL.createObjectURL(pendingFile);
		setPreviewUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [pendingFile]);

	const {
		isAiDialogOpen,
		setIsAiDialogOpen,
		selectedText,
		setupAiAction,
		applyEnhancedText,
	} = useAiEnhance();

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsWindowFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () =>
			document.removeEventListener(
				"fullscreenchange",
				handleFullscreenChange,
			);
	}, []);

	const onContentTypeChange = (newMode: ContentMode) => {
		const isTextOrCode = (m: ContentMode) => m === "text" || m === "code";

		if (isTextOrCode(contentType) && isTextOrCode(newMode)) {
			if (newMode === "text") {
				_setLanguage("text");
			} else if (newMode === "code" && language === "text") {
				const backendLang = paste?.language;
				_setLanguage(
					backendLang && backendLang !== "text"
						? backendLang
						: "javascript",
				);
			}
			setContentType(newMode);
			return;
		}

		if (id) saveDraft(contentType, updatedContent || "", id);
		const draft = id ? getDraft(newMode, id) : null;
		if (draft !== null) {
			setUpdatedContent(draft);
		} else if (newMode === "draw") {
			if (paste && detectContentMode(paste) === "draw") {
				setUpdatedContent(paste.content);
			} else {
				setUpdatedContent(
					JSON.stringify({ elements: [], appState: {} }),
				);
			}
		} else {
			if (paste && detectContentMode(paste) === newMode) {
				setUpdatedContent(paste.content);
			} else {
				setUpdatedContent("");
			}
		}
		setContentType(newMode);
	};
	const [remoteCursors, setRemoteCursors] = useState<
		Record<string, CursorPosition>
	>({});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [editorInstance, setEditorInstance] = useState<any | null>(null);

	const socketRef = useRef<Socket | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const editorRef = useRef<any | null>(null);
	const syncStateRef = useRef<SyncState>({});
	const isRemoteUpdate = useRef(false);
	const isEditRef = useRef(isEdit);
	const hasDetectedRef = useRef(false);

	const { isDetecting, detectLanguage } = useLanguageDetection();
	const [language, _setLanguage] = useState(CONFIG.DEFAULTS.LANGUAGE);
	const setLanguage = useCallback(
		(newLang: string) => {
			_setLanguage(newLang);
			if (newLang === "text") {
				setContentType((prev) => (prev === "code" ? "text" : prev));
			} else {
				if (isDetecting) return; // Don't flip tab while detecting
				setContentType((prev) => (prev === "text" ? "code" : prev));
			}
		},
		[isDetecting],
	);

	const handleEditSave = useCallback(
		async (shouldClose = true) => {
			setSaveStatus("saving");

			const hasContent =
				contentType === "file"
					? !!pendingFile ||
						(!!paste?.fileUrl && !isServerFileRemoved)
					: (updatedContent?.trim().length ?? 0) > 0;

			if (!hasContent) {
				playErrorSound();
				toast.warning(
					contentType === "file"
						? t(
								"messages.empty_file",
								"Please select a file first!",
							)
						: t(
								"messages.empty_content",
								"Please enter some content first!",
							),
				);
				return;
			}

			const wasProtected =
				!!paste?.password || !!paste?.isPasswordProtected;
			const passwordChanged =
				isPasswordEnabled !== wasProtected || !!editPassword;

			const isUnchanged =
				(contentType === "file"
					? !pendingFile && !isServerFileRemoved
					: updatedContent === paste?.content) &&
				(contentType === "link") === paste?.redirectUrl &&
				language === paste?.language &&
				visibility === paste?.visibility &&
				editPermission === (paste?.editPermission ?? "owner") &&
				customId.trim() === paste?.id &&
				!passwordChanged &&
				JSON.stringify(allowedUsers) ===
					JSON.stringify(paste?.allowedUsers) &&
				JSON.stringify(shareList) ===
					JSON.stringify(paste?.shareList) &&
				publicRole === paste?.publicRole &&
				allowComments === (paste?.allowComments ?? false) &&
				expiresTime === (paste?.expiresTime ?? "1d") &&
				contentType ===
					(paste?.contentMode ??
						(paste?.redirectUrl
							? "link"
							: paste?.fileUrl
								? "file"
								: paste?.language !== "text"
									? "code"
									: "text"));

			if (isUnchanged) {
				if (shouldClose) setIsEdit(false);
				return;
			}

			const passwordPayload =
				!isPasswordEnabled && wasProtected
					? ""
					: isPasswordEnabled && editPassword
						? editPassword
						: undefined;

			try {
				setIsSaving(true);

				let currentFileUrl = paste?.fileUrl;
				let currentFileName = paste?.fileName;
				let currentFileSize = paste?.fileSize;
				let currentFileMimeType = paste?.fileMimeType;

				if (contentType === "file" && pendingFile) {
					const uploadResult = await uploadFile(pendingFile);
					if (uploadResult.error) {
						throw new Error(uploadResult.error);
					}
					currentFileUrl = uploadResult.fileUrl!;
					currentFileName = uploadResult.fileName!;
					currentFileSize = uploadResult.fileSize!;
					currentFileMimeType = uploadResult.fileMimeType!;
				}

				const data = await apiHelpers.updatePaste(id!, {
					content:
						contentType === "file"
							? currentFileUrl || "File upload"
							: updatedContent!,
					redirectUrl: contentType === "link",
					language:
						isDetecting || contentType === "code"
							? language
							: "text",
					visibility,
					allowedUsers:
						visibility === "shared" || editPermission === "shared"
							? allowedUsers
							: [],
					newId: customId.trim() !== id ? customId.trim() : undefined,
					password: passwordPayload,
					editPermission,
					shareList,
					publicRole,
					allowComments,
					expiresTime,
					contentMode: contentType,
					fileUrl: currentFileUrl,
					fileName: currentFileName,
					fileSize: currentFileSize,
					fileMimeType: currentFileMimeType,
				});

				if (data) {
					if (shouldClose) {
						toast.success(
							t(
								"messages.snippet_updated",
								"Snippet updated successfully",
							),
						);
					}
					setPaste(data);
					setSaveStatus("saved");
					setTimeout(() => setSaveStatus("idle"), 3000);
					setUpdatedContent(data.content);
					setLanguage(data.language ?? "text");
					setContentType(
						data.contentMode ??
							(data.redirectUrl
								? "link"
								: data.language !== "text"
									? "code"
									: "text"),
					);
					setVisibility(data.visibility ?? "public");
					setAllowedUsers(data.allowedUsers ?? []);
					setEditPermission(data.editPermission ?? "owner");
					setAllowComments(data.allowComments ?? false);
					setIsPasswordEnabled(
						!!data.password || !!data.isPasswordProtected,
					);
					setEditPassword("");
					setPendingFile(null);
					setIsServerFileRemoved(false);
					if (!user) saveToLocal(data);
					if (data.id !== id)
						navigate(`/${data.id}`, { replace: true });
					if (id) clearDrafts(id);
				}

				if (shouldClose) {
					setIsEdit(false);
					if (id) clearDrafts(id);
				}
			} catch (error) {
				setSaveStatus("error");
				setTimeout(() => setSaveStatus("idle"), 5000);
				const axiosError = error as AxiosError<{ error: string }>;
				toast.error(
					axiosError.response?.data?.error ??
						t("messages.update_failed", "Failed to update snippet"),
				);
			} finally {
				setIsSaving(false);
			}
		},
		[
			contentType,
			paste,
			updatedContent,
			t,
			isPasswordEnabled,
			editPassword,
			language,
			visibility,
			editPermission,
			customId,
			allowedUsers,
			shareList,
			publicRole,
			allowComments,
			expiresTime,
			id,
			apiHelpers,
			isDetecting,
			setLanguage,
			user,
			navigate,
			pendingFile,
			uploadFile,
			isServerFileRemoved,
		],
	);
	const { fontSize, ref: contentRef, setFontSize } = usePinchZoom(14);

	const isOwner = !paste?.owner || (!!user && paste.owner === user._id);

	const handleEditorWillMount: BeforeMount = (m) => defineMonacoThemes(m);

	useRemoteCursors(editorInstance, remoteCursors, activeUsers);

	useEffect(() => {
		isEditRef.current = isEdit;
	}, [isEdit]);

	useEffect(() => {
		async function loadData() {
			try {
				if (location.state?.pasteData) {
					const data = location.state.pasteData as PasteData;
					const detectedType = detectContentMode(data);

					setPaste(data);
					setUpdatedContent(data.content);
					setLanguage(data.language ?? "text");
					setContentType(detectedType);
					setVisibility(data.visibility ?? "public");
					setAllowedUsers(data.allowedUsers ?? []);
					setEditPermission(data.editPermission ?? "owner");
					setShareList(data.shareList ?? []);
					setPublicRole(data.publicRole ?? "viewer");
					setAllowComments(data.allowComments ?? false);
					setIsPasswordEnabled(
						!!data.password || !!data.isPasswordProtected,
					);
					setExpiresTime(data.expiresTime ?? "1d");
					setCustomId(data.id ?? "");
					setLoading(false);
					if (location.state.isCollaborative) setIsEdit(true);
					window.history.replaceState({}, document.title);
					return;
				}

				const data = await apiHelpers.getPaste(id!);
				if (data) {
					const detectedType = detectContentMode(data);

					setContentType(detectedType);
					setVisibility(data.visibility ?? "public");
					setAllowedUsers(data.allowedUsers ?? []);
					setEditPermission(data.editPermission ?? "owner");
					setShareList(data.shareList ?? []);
					setPublicRole(data.publicRole ?? "viewer");
					setAllowComments(data.allowComments ?? false);
					setIsPasswordEnabled(
						!!data.password || !!data.isPasswordProtected,
					);
					setExpiresTime(data.expiresTime ?? "1d");
					setLanguage(data.language ?? "text");
					setUpdatedContent(data.content);
					setCustomId(data.id ?? "");
					setPaste(data);
					syncStateRef.current = {
						...syncStateRef.current,
						content: data.content,
						id: data.id,
					};
					if (!user) saveToLocal(data);
				} else {
					setPaste(undefined);
				}
			} catch (err) {
				console.error("Failed to load snippet", err);
				setPaste(undefined);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, [
		id,
		apiHelpers,
		location.state,
		user,
		setLanguage,
		setContentType,
		setVisibility,
		setEditPermission,
		setAllowComments,
		setExpiresTime,
		setPublicRole,
		setCustomId,
		setAllowedUsers,
		setIsAutosave,
	]);

	useEffect(() => {
		if (!paste) return;
		syncStateRef.current = {
			content: paste.content,
			language: paste.language,
			contentMode: paste.contentMode,
			visibility: paste.visibility,
			allowedUsers: paste.allowedUsers ?? [],
			editPermission: paste.editPermission ?? "owner",
			publicRole: paste.publicRole ?? "viewer",
			allowComments: paste.allowComments ?? false,
			expiresTime: paste.expiresTime ?? "1d",
			id: paste.id,
			isAutosave: true,
		};
	}, [paste]);

	useEffect(() => {
		if (loading || !id || !paste) return;

		const socketUrl = CONFIG.API_BASE_URL
			? CONFIG.API_BASE_URL.replace(/\/api\/?$/, "")
			: "";
		const s = io(socketUrl, { withCredentials: true });
		socketRef.current = s;
		setSocket(s);

		s.on("connect", () => {
			s.emit("join-paste", {
				pasteId: id,
				userName: user?.username,
			});
			if (isEditRef.current) {
				s.emit("set-editing-status", {
					pasteId: id,
					isEditing: true,
				});
			}
		});

		s.on("room-users", (users: ActiveUser[]) => {
			setActiveUsers(users);
			const currentIds = new Set(users.map((u) => u.socketId));
			setRemoteCursors((prev) => {
				const next = { ...prev };
				let changed = false;
				for (const key of Object.keys(next)) {
					if (!currentIds.has(key)) {
						delete next[key];
						changed = true;
					}
				}
				return changed ? next : prev;
			});
		});

		s.on(
			"paste-updated",
			(
				data: Partial<PasteData> & {
					socketId: string;
					isAutosave?: boolean;
				},
			) => {
				isRemoteUpdate.current = true;
				syncStateRef.current = { ...syncStateRef.current, ...data };

				if (data.content !== undefined) {
					const currentEditor = editorRef.current;
					const currentVal =
						currentEditor?.getValue() ?? updatedContent;

					if (data.content !== currentVal) {
						if (currentEditor) {
							const model = currentEditor.getModel();
							if (model) {
								if (isEditRef.current) {
									const scrollTop =
										currentEditor.getScrollTop();
									const scrollLeft =
										currentEditor.getScrollLeft();
									currentEditor.executeEdits("remote-sync", [
										{
											range: model.getFullModelRange(),
											text: data.content,
											forceMoveMarkers: true,
										},
									]);
									currentEditor.setScrollTop(scrollTop);
									currentEditor.setScrollLeft(scrollLeft);
								} else {
									model.setValue(data.content);
								}
							}
						}
						setUpdatedContent(data.content);
					}
				}

				if (data.language !== undefined) setLanguage(data.language);
				if (data.contentMode !== undefined)
					setContentType(data.contentMode);
				if (data.visibility !== undefined)
					setVisibility(data.visibility);
				if (data.editPermission !== undefined)
					setEditPermission(data.editPermission);
				if (data.allowComments !== undefined)
					setAllowComments(data.allowComments);
				if (data.expiresTime !== undefined)
					setExpiresTime(data.expiresTime);
				if (data.publicRole !== undefined)
					setPublicRole(data.publicRole);
				if (data.id !== undefined) setCustomId(data.id);
				if (data.allowedUsers !== undefined)
					setAllowedUsers(data.allowedUsers);
				if (data.isAutosave !== undefined)
					setIsAutosave(data.isAutosave);

				setTimeout(() => {
					isRemoteUpdate.current = false;
				}, 100);
			},
		);

		s.on(
			"user-cursor-move",
			(data: { socketId: string; position: CursorPosition }) => {
				setRemoteCursors((prev) => ({
					...prev,
					[data.socketId]: data.position,
				}));
			},
		);

		return () => {
			s.emit("leave-paste", id);
			s.disconnect();
			socketRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, loading, paste?.id, user?.username, setLanguage]);

	useEffect(() => {
		if (paste) {
			let displayContent = "";
			const mode = paste.contentMode || contentType;

			if (mode === "draw") {
				displayContent = t("home.tab_draw", "Drawing");
			} else if (mode === "link" || paste.redirectUrl) {
				displayContent = t("home.tab_link_short", "Link");
			} else if (mode === "file") {
				displayContent = paste.fileName || t("home.tab_file", "File");
			} else {
				displayContent =
					(updatedContent || paste.content)?.replace(
						/\r?\n|\r/g,
						" ",
					) ?? "";
			}

			const trimmed =
				displayContent.length > 30
					? `${displayContent.substring(0, 30).trim()}...`
					: displayContent;
			document.title = `${paste.id}${trimmed ? ` - ${trimmed}` : ""} | Snipit`;
		} else {
			document.title = "Snipit";
		}
		return () => {
			document.title = "Snipit";
		};
	}, [paste, updatedContent, contentType, t]);

	useEffect(() => {
		if (socketRef.current && id) {
			socketRef.current.emit("set-editing-status", {
				pasteId: id,
				isEditing: isEdit,
			});
		}
	}, [isEdit, id]);

	useEffect(() => {
		if (!isEdit || contentType === "file") return;

		const isSettingsChanged =
			(contentType === "link") !== paste?.redirectUrl ||
			language !== paste?.language ||
			visibility !== paste?.visibility ||
			editPermission !== (paste?.editPermission ?? "owner") ||
			customId.trim() !== paste?.id ||
			JSON.stringify(allowedUsers) !==
				JSON.stringify(paste?.allowedUsers) ||
			JSON.stringify(shareList) !== JSON.stringify(paste?.shareList) ||
			publicRole !== paste?.publicRole ||
			allowComments !== (paste?.allowComments ?? false) ||
			expiresTime !== (paste?.expiresTime ?? "1d");

		const isFileChanged =
			(contentType as ContentMode) === "file" &&
			(!!pendingFile || isServerFileRemoved);
		const isContentChanged =
			(contentType as ContentMode) === "file"
				? isFileChanged
				: updatedContent !== paste?.content;
		if (!isSettingsChanged && !isContentChanged) return;
		if (!isSettingsChanged && isContentChanged && !isAutosave) return;

		const timer = setTimeout(() => handleEditSave(false), 2000);
		return () => clearTimeout(timer);
	}, [
		updatedContent,
		customId,
		language,
		contentType,
		visibility,
		allowedUsers,
		editPermission,
		publicRole,
		allowComments,
		expiresTime,
		isAutosave,
		isEdit,
		paste,
		handleEditSave,
		shareList,
		pendingFile,
		isServerFileRemoved,
	]);

	useEffect(() => {
		if (!socketRef.current || !isEdit) return;

		const sync = syncStateRef.current;
		const isFileChanged =
			contentType === "file" && (!!pendingFile || isServerFileRemoved);
		const isDifferent =
			(contentType === "file"
				? isFileChanged
				: updatedContent !== sync.content) ||
			language !== sync.language ||
			contentType !== sync.contentMode ||
			visibility !== sync.visibility ||
			JSON.stringify(allowedUsers) !==
				JSON.stringify(sync.allowedUsers ?? []) ||
			editPermission !== sync.editPermission ||
			publicRole !== sync.publicRole ||
			allowComments !== sync.allowComments ||
			expiresTime !== sync.expiresTime ||
			customId !== sync.id ||
			isAutosave !== (sync.isAutosave ?? true);

		if (!isDifferent) return;

		const newState = {
			pasteId: id,
			content: updatedContent,
			language,
			contentMode: contentType,
			visibility,
			allowedUsers,
			editPermission,
			publicRole,
			allowComments,
			expiresTime,
			id: customId,
			isAutosave,
		};

		const timer = setTimeout(() => {
			if (!socketRef.current) return;
			socketRef.current.emit("edit-paste", newState);
			syncStateRef.current = { ...sync, ...newState };
		}, 50);
		return () => clearTimeout(timer);
	}, [
		updatedContent,
		customId,
		language,
		contentType,
		visibility,
		allowedUsers,
		editPermission,
		publicRole,
		allowComments,
		expiresTime,
		isAutosave,
		isEdit,
		id,
		pendingFile,
		isServerFileRemoved,
	]);

	const handleEditorMount: OnMount = (ed, monaco) => {
		setupAiAction(ed, monaco);
		setEditorInstance(ed);
		editorRef.current = ed;

		ed.onDidPaste(() => {
			const value = ed.getValue();
			if (updatedContent?.trim() === "") {
				handleLanguageDetection(value);
			}
		});

		ed.onDidChangeCursorPosition((e) => {
			if (
				!isRemoteUpdate.current &&
				socketRef.current &&
				id &&
				isEditRef.current
			) {
				socketRef.current.emit("cursor-move", {
					pasteId: id,
					position: e.position,
				});
			}
		});
	};

	const handleLanguageDetection = async (
		content: string,
		isManual = false,
	) => {
		if (hasDetectedRef.current && !isManual) return;
		const result = await detectLanguage(content);
		if (result) {
			hasDetectedRef.current = true;
			setLanguage(result.language);
			if (result.isCode) {
				setContentType("code");
			} else {
				setContentType("text");
			}
		}
	};

	const confirmDelete = async () => {
		try {
			playRemoveSound();
			await apiHelpers.deletePaste(id!);
			toast.success(t("messages.deleted_success"));
			navigate("/");
		} catch (error) {
			console.error("Delete failed", error);
			toast.error(t("messages.delete_failed"));
		}
	};

	const handleDelete = () => setIsDeleteDialogOpen(true);

	const handleCancel = () => {
		setIsEdit(false);
		setUpdatedContent(paste?.content);
		setContentType(
			paste?.contentMode ??
				(paste?.redirectUrl
					? "link"
					: paste?.language !== "text"
						? "code"
						: "text"),
		);
		setLanguage(paste?.language ?? "text");
		setVisibility(paste?.visibility ?? "public");
		setAllowedUsers(paste?.allowedUsers ?? []);
		setEditPermission(paste?.editPermission ?? "owner");
		setCustomId(paste?.id ?? "");
		setEditPassword("");
		setIsPasswordEnabled(!!paste?.password || !!paste?.isPasswordProtected);
		setAllowComments(paste?.allowComments ?? false);
		setExpiresTime(paste?.expiresTime ?? "1d");
		setSaveStatus("idle");
		setPendingFile(null);
		setIsServerFileRemoved(false);
		if (id) clearDrafts(id);
	};

	const handleContentChange = (val: string) => {
		if (val === updatedContent) return;
		setUpdatedContent(val);
		if (isAutosave) setSaveStatus("saving");

		// Immediate socket emit for cursor position if editing
		if (socketRef.current && id && isEdit) {
			const position = editorRef.current?.getPosition();
			if (position) {
				socketRef.current.emit("cursor-move", {
					pasteId: id,
					position,
				});
			}
		}
	};

	const handleVerifyPassword = async () => {
		try {
			const data = await apiHelpers.verifyPassword(id!, passwordInput);
			setPaste(data);
			setUpdatedContent(data.content);
			setLanguage(data.language ?? "text");
			setContentType(
				data.redirectUrl
					? "link"
					: data.language !== "text"
						? "code"
						: "text",
			);
			setVisibility(data.visibility ?? "public");
			setAllowedUsers(data.allowedUsers ?? []);
			setEditPermission(data.editPermission ?? "owner");

			// Redirect after password verification if it's a link
			if (data.redirectUrl && data.contentMode === "link") {
				const url = data.content;
				window.location.href = url;
			}
		} catch {
			setPasswordError(
				t("messages.password_incorrect", "Incorrect password"),
			);
		}
	};

	if (loading) {
		return (
			<div className="flex-1 flex flex-col bg-background">
				<ShimmerSection
					type="toolbar"
					className="sticky top-0 z-40 rounded-none border-x-0 !bg-background/40 backdrop-blur-xl h-[60px]"
				/>
				<ShimmerSection
					type="metadata"
					className="sticky top-[60px] z-30"
				/>
				<div className="flex-1 flex flex-col px-3 sm:px-5 py-6">
					<ShimmerSection type="editor" className="min-h-[70vh]" />
				</div>
			</div>
		);
	}

	if (!paste) return <DisplayError />;

	if ((paste.isPasswordProtected || !!paste.password) && !paste.content) {
		return (
			<PasswordGate
				passwordInput={passwordInput}
				setPasswordInput={setPasswordInput}
				passwordError={passwordError}
				setPasswordError={setPasswordError}
				handleVerifyPassword={handleVerifyPassword}
			/>
		);
	}

	const visibleActiveUsers = activeUsers.map((u) => ({
		...u,
		isMe: u.socketId === socketRef.current?.id,
	}));

	return (
		<>
			<div
				className={cn(
					"relative z-10 flex-1 h-full flex flex-col overflow-hidden",
					isFullscreen || isWindowFullscreen
						? "fixed inset-0 z-[100] bg-background"
						: "",
				)}
			>
				{!isFullscreen && !isWindowFullscreen && (
					<div className="flex flex-col border-b bg-background/50 backdrop-blur-md sticky top-0 z-40 shrink-0">
						<Suspense fallback={<ShimmerSection type="toolbar" />}>
							<DisplayToolbar
								activeUsers={visibleActiveUsers}
								isEdit={isEdit}
								isAutosave={isAutosave}
								setIsAutosave={setIsAutosave}
								showAutosave={
									(contentType as ContentMode) !== "file"
								}
								showSaveButton={
									(contentType as ContentMode) === "file"
								}
								saveStatus={saveStatus}
								content={updatedContent || paste.content}
								onEdit={(val) => {
									if (val) {
										setUpdatedContent(paste?.content);
										setVisibility(
											paste?.visibility ?? "public",
										);
										setAllowedUsers(
											paste?.allowedUsers ?? [],
										);
										setLanguage(paste?.language ?? "text");
										setContentType(
											detectContentMode(paste),
										);
										setCustomId(paste?.id ?? "");
										setEditPermission(
											paste?.editPermission ?? "owner",
										);
										setIsPasswordEnabled(
											!!paste?.password ||
												!!paste?.isPasswordProtected,
										);
										setAllowComments(
											paste?.allowComments ?? false,
										);
									}
									setIsEdit(val);
									setSaveStatus("idle");
								}}
								onDelete={handleDelete}
								onSave={() => handleEditSave()}
								onCancel={handleCancel}
								isSaving={isSaving}
								fontSize={fontSize}
								setFontSize={setFontSize}
								showFontControls={
									contentType !== "link" &&
									contentType !== "file" &&
									contentType !== "draw"
								}
								allowComments={allowComments}
								commentCount={paste.comments?.length ?? 0}
								paste={paste}
								onCommentAdded={(updated: PasteData) =>
									setPaste(updated)
								}
								customId={customId}
								setCustomId={setCustomId}
								expiresTime={expiresTime}
								setExpiresTime={setExpiresTime}
								setIsCustomExpiryDialogOpen={
									setIsCustomExpiryDialogOpen
								}
								isTerminalOpen={isTerminalOpen}
								onToggleTerminal={() => {
									const opening = !isTerminalOpen;
									setIsTerminalOpen(opening);
									if (
										opening &&
										socket &&
										(updatedContent ?? paste?.content)
									) {
										socket.emit("run-code", {
											code:
												updatedContent ??
												paste?.content ??
												"",
											language,
										});
									}
								}}
								isCode={contentType === "code"}
								language={language}
							/>
						</Suspense>
						{!isEdit && (
							<Suspense
								fallback={<ShimmerSection type="metadata" />}
							>
								<DisplayMetadata paste={paste} />
							</Suspense>
						)}
					</div>
				)}

				<div
					className={cn(
						"flex-1 flex flex-col w-full min-h-0 h-full overflow-hidden",
					)}
				>
					<div
						className={cn(
							"w-full flex-1 flex flex-col transition-all duration-300 min-h-0 h-full",
							!isFullscreen && !isWindowFullscreen
								? "px-1 sm:px-5 py-1.5 sm:py-3"
								: "p-3",
						)}
					>
						{isEdit && !isFullscreen && !isWindowFullscreen && (
							<div className="mb-1 sm:mb-2 shrink-0 px-1">
								<Suspense
									fallback={<ShimmerSection type="toolbar" />}
								>
									<EditControls
										contentType={contentType}
										setContentType={onContentTypeChange}
										language={language}
										setLanguage={setLanguage}
										visibility={visibility}
										setVisibility={setVisibility}
										allowedUsers={allowedUsers}
										setAllowedUsers={setAllowedUsers}
										isDetecting={isDetecting}
										onAutoDetect={() =>
											handleLanguageDetection(
												updatedContent || "",
												true,
											)
										}
										newPassword={editPassword}
										setNewPassword={setEditPassword}
										isPasswordEnabled={isPasswordEnabled}
										setIsPasswordEnabled={
											setIsPasswordEnabled
										}
										editPermission={editPermission}
										setEditPermission={setEditPermission}
										isOwner={isOwner}
										isAdmin={
											!!user &&
											shareList.some(
												(item) =>
													item.email === user.email &&
													item.role === "admin",
											)
										}
										shareList={shareList}
										setShareList={setShareList}
										publicRole={publicRole}
										setPublicRole={setPublicRole}
										allowComments={allowComments}
										setAllowComments={setAllowComments}
									/>
								</Suspense>
							</div>
						)}

						{/* Editor + Terminal with resizable split */}
						{(() => {
							const isTerminalVisible =
								isTerminalOpen &&
								!!paste &&
								contentType === "code";

							const editorPanel = (
								<div className="h-full w-full min-h-0 min-w-0 flex flex-col">
									<Suspense
										fallback={
											<ShimmerSection type="editor" />
										}
									>
										<DisplayContent
											id={id ?? ""}
											isEdit={isEdit}
											contentType={contentType}
											language={language}
											content={updatedContent ?? ""}
											onContentChange={
												handleContentChange
											}
											theme={theme}
											fontSize={fontSize}
											contentRef={contentRef}
											handleEditorWillMount={
												handleEditorWillMount
											}
											paste={paste}
											onMount={handleEditorMount}
											socketRef={socketRef}
											activeUsers={activeUsers}
											isFullscreen={isFullscreen}
											setIsFullscreen={setIsFullscreen}
											isWindowFullscreen={
												isWindowFullscreen
											}
											setIsWindowFullscreen={
												setIsWindowFullscreen
											}
											onFileSelect={(file) => {
												setPendingFile(file);
												setFileUpload(file);
												setUpdatedContent(
													paste?.content ||
														"File Update",
												);
											}}
											onClearFile={() => {
												resetFileUpload();
												setPendingFile(null);
												setIsServerFileRemoved(true);
											}}
											previewUrl={
												previewUrl ||
												(isServerFileRemoved
													? null
													: paste?.fileUrl)
											}
											uploadedFileName={
												uploadedFileName ||
												(isServerFileRemoved
													? null
													: paste?.fileName)
											}
											isFileUploading={isFileUploading}
											fileUploadProgress={
												fileUploadProgress
											}
											fileUploadError={fileUploadError}
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
									code={updatedContent ?? paste.content}
									language={language}
									socket={socket}
									className="mx-2 sm:mx-4 mb-2"
								/>
							);

							if (!isTerminalVisible) {
								return (
									<div className="flex-1 min-h-0 min-w-0 h-full flex flex-col">
										{editorPanel}
									</div>
								);
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
									storageKey={`display-terminal-split-${terminalPosition}`}
								/>
							);
						})()}
					</div>
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

				<DeletePasteDialog
					isOpen={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={confirmDelete}
				/>

				<Suspense fallback={null}>
					<AiEnhanceDialog
						isOpen={isAiDialogOpen}
						onClose={() => setIsAiDialogOpen(false)}
						selectedText={selectedText}
						onApply={applyEnhancedText}
					/>
				</Suspense>
			</Suspense>
		</>
	);
};

export default DisplayPage;
