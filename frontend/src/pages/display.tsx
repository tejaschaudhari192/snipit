import {
	useEffect,
	useRef,
	useCallback,
	Suspense,
	lazy,
	useState,
} from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { OnMount, BeforeMount, Monaco } from "@monaco-editor/react";
import { type editor } from "monaco-editor";
import { type Socket } from "socket.io-client";

import { useApiHelpers } from "@/lib/api";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useAiEnhance } from "@/hooks/use-ai-enhance";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { useTerminalLayout } from "@/hooks/use-terminal-layout";
import { defineMonacoThemes } from "@/lib/monaco";
import { cn } from "@/utils";
import { storage } from "@/utils/storage";
import { useAiAutocomplete } from "@/hooks/use-ai-autocomplete";

const DisplayLoading = lazy(() =>
	import("@/components/display/display-loading").then((m) => ({
		default: m.DisplayLoading,
	})),
);
const DisplayError = lazy(() =>
	import("@/components/common/core/error").then((m) => ({
		default: m.default,
	})),
);
import { useRemoteCursors } from "@/hooks/use-remote-cursors";

import { useDisplayState } from "@/hooks/use-display-state";
import { usePasteSync } from "@/hooks/use-paste-sync";
import { useEditorSync } from "@/hooks/use-editor-sync";
import { useDisplayInit } from "@/hooks/display/use-display-init";
import { useDisplayActions } from "@/hooks/display/use-display-actions";
import { useAutosave } from "@/hooks/display/use-autosave";

import type {
	CommentData,
	CursorPosition,
	SelectionRange,
	SocketUpdateData,
} from "@/types";
import { CONFIG } from "@/configurations";
import { Skeleton } from "@/components/ui/skeleton";
const DisplayToolbar = lazy(() =>
	import("@/components/display/display-toolbar").then((m) => ({
		default: m.DisplayToolbar,
	})),
);
const AiWriterDialog = lazy(() =>
	import("@/components/editor/ai-writer-dialog").then((m) => ({
		default: m.AiWriterDialog,
	})),
);
const DisplayMetadata = lazy(() =>
	import("@/components/display/display-metadata").then((m) => ({
		default: m.DisplayMetadata,
	})),
);
const EditControls = lazy(() =>
	import("@/components/display/edit-controls").then((m) => ({
		default: m.EditControls,
	})),
);
const PasswordGate = lazy(() =>
	import("@/components/display/password-gate").then((m) => ({
		default: m.PasswordGate,
	})),
);
const DisplayWorkspace = lazy(() =>
	import("@/components/display/display-workspace").then((m) => ({
		default: m.DisplayWorkspace,
	})),
);
const DisplayDialogs = lazy(() =>
	import("@/components/display/display-dialogs").then((m) => ({
		default: m.DisplayDialogs,
	})),
);

const DisplayPage = () => {
	const { id } = useParams<{ id: string }>();
	const apiHelpers = useApiHelpers();
	const { theme } = useTheme();
	const { user } = useAuth();
	const { t } = useTranslation();

	const state = useDisplayState();
	const {
		isEdit,
		setIsEdit,
		paste,
		setPaste,
		updatedContent,
		setUpdatedContent,
		loading,
		contentType,
		setContentType,
		visibility,
		setVisibility,
		allowedUsers,
		setAllowedUsers,
		editPermission,
		setEditPermission,
		shareList,
		setShareList,
		publicRole,
		setPublicRole,
		allowComments,
		setAllowComments,
		customId,
		setCustomId,
		editPassword,
		setEditPassword,
		isPasswordEnabled,
		setIsPasswordEnabled,
		expiresTime,
		setExpiresTime,
		saveStatus,
		setIsAutosave,
		language,
		updateAllFromData,
		isTerminalOpen,
		setIsTerminalOpen,
		isFullscreen,
		setIsFullscreen,
		isWindowFullscreen,
		setIsWindowFullscreen,
		isCustomExpiryDialogOpen,
		setIsCustomExpiryDialogOpen,
		isDeleteDialogOpen,
		setIsDeleteDialogOpen,
		passwordInput,
		setPasswordInput,
		passwordError,
		setPasswordError,
		isSaving,
		isVerifyingPassword,
		setIsVerifyingPassword,
		isServerFileRemoved,
		setIsServerFileRemoved,
	} = state;

	const [remoteCursors, setRemoteCursors] = useState<
		Record<string, { position: CursorPosition; selection?: SelectionRange }>
	>({});
	const [editorInstance, setEditorInstance] =
		useState<editor.IStandaloneCodeEditor | null>(null);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const isEditRef = useRef(isEdit);
	const hasDetectedRef = useRef(false);

	const [isAiAutocompleteEnabled, setIsAiAutocompleteEnabled] = useState(() =>
		storage.get(CONFIG.storageKeys.aiAutocomplete, false),
	);

	const editorInstanceRef = useRef<editor.IStandaloneCodeEditor | null>(null);
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

	const { isDetecting, detectLanguage } = useLanguageDetection();
	const { terminalPosition, setTerminalPosition } = useTerminalLayout();

	const [pendingFile, setPendingFile] = useState<File | null>(null);

	const {
		isUploading: isFileUploading,
		progress: fileUploadProgress,
		error: fileUploadError,
		fileName: uploadedFileName,
		uploadFile,
		setFile: setFileUpload,
		reset: resetFileUpload,
	} = useFileUpload();

	const setLanguage = useCallback(
		(newLang: string) => {
			updateAllFromData({ language: newLang });
			if (newLang === "text") {
				setContentType((prev) => (prev === "code" ? "text" : prev));
			} else {
				if (isDetecting) return;
				setContentType((prev) => (prev === "text" ? "code" : prev));
			}
		},
		[isDetecting, updateAllFromData, setContentType],
	);

	const sharedSocketRef = useRef<Socket | null>(null);
	const hoistedRemoteUpdateRef =
		useRef<(data: SocketUpdateData) => void>(null);

	const {
		socket,
		activeUsers: syncUsers,
		remoteCursors: syncCursors,
	} = usePasteSync(
		id,
		state.paste,
		user,
		isEdit,
		loading,
		(data) => hoistedRemoteUpdateRef.current?.(data),
		sharedSocketRef,
	);

	const { applyPulse } = useRemoteCursors(
		editorInstance,
		remoteCursors,
		syncUsers,
	);

	const {
		onRemoteUpdate,
		handleEditorChange,
		isRemoteUpdateRef,
		lastLocalEditRef,
	} = useEditorSync({
		id,
		isEdit,
		socketRef: sharedSocketRef,
		applyPulse,
		setUpdatedContent,
		updateAllFromData,
		setPaste,
		setIsAutosave,
	});

	useEffect(() => {
		hoistedRemoteUpdateRef.current = (data) =>
			onRemoteUpdate(data, editorInstance, syncUsers);
	}, [onRemoteUpdate, editorInstance, syncUsers]);

	useEffect(() => {
		setRemoteCursors(syncCursors);
	}, [syncCursors]);
	useEffect(() => {
		isEditRef.current = isEdit;
	}, [isEdit]);

	const handleLanguageDetection = async (
		content: string,
		isManual = false,
	) => {
		if (hasDetectedRef.current && !isManual) return;
		const result = await detectLanguage(content);
		if (result) {
			hasDetectedRef.current = true;
			setLanguage(result.language);
			setContentType(result.isCode ? "code" : "text");
		}
	};

	const {
		handleEditSave,
		handleDelete,
		handleCancel,
		handleContentChange,
		onDeleteConfirm,
	} = useDisplayActions({ id, state, user, pendingFile, uploadFile });
	useDisplayInit({ id, state, user });

	const handleRecordingChange = useCallback(
		(isRecording: boolean) => {
			if (sharedSocketRef.current && id) {
				sharedSocketRef.current.emit("set-recording-status", {
					pasteId: id,
					isRecording,
				});
			}
		},
		[id],
	);

	const onContentChange = useCallback(
		(val: string) => {
			handleContentChange(
				val,
				isRemoteUpdateRef,
				editorInstance,
				handleEditorChange,
			);
			if (editorInstance) {
				handleEditorChange({
					content: val,
				});
			}
		},
		[
			handleContentChange,
			isRemoteUpdateRef,
			editorInstance,
			handleEditorChange,
		],
	);

	const { fontSize, ref: contentRef, setFontSize } = usePinchZoom(14);
	const isOwner = !!(user && paste?.owner === user._id);
	const handleEditorWillMount: BeforeMount = (m) => defineMonacoThemes(m);

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

	useAutosave({
		isAutosave: state.isAutosave,
		isEdit,
		loading,
		isSaving,
		content: updatedContent,
		originalContent: paste?.content,
		onSave: () => handleEditSave(false),
		isRemoteUpdateRef,
		lastLocalEditRef,
	});

	const handleEditorMount: OnMount = (ed, monaco) => {
		editorInstanceRef.current = ed;
		monacoInstanceRef.current = monaco;
		setupAiAction(ed, monaco);
		setupAutocomplete(ed, monaco);
		setEditorInstance(ed);
		editorRef.current = ed;
		ed.onDidPaste(() => {
			if (updatedContent?.trim() === "")
				handleLanguageDetection(ed.getValue());
		});
		ed.onDidChangeCursorSelection((e) => {
			if (
				!isRemoteUpdateRef.current &&
				sharedSocketRef.current &&
				id &&
				isEditRef.current
			) {
				sharedSocketRef.current.emit("cursor-move", {
					pasteId: id,
					position: e.selection.getPosition(),
					selection: {
						startLineNumber: e.selection.startLineNumber,
						startColumn: e.selection.startColumn,
						endLineNumber: e.selection.endLineNumber,
						endColumn: e.selection.endColumn,
					},
				});
			}
		});
	};

	usePageTitle(
		undefined,
		paste ? `/${paste.id} (${paste.language || "text"})` : `/${id}`,
	);

	if (loading) {
		return (
			<Suspense
				fallback={
					<div className="flex flex-col items-center justify-center h-screen space-y-6 animate-pulse">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div className="space-y-2 flex flex-col items-center">
							<Skeleton className="h-6 w-48 rounded" />
							<Skeleton className="h-4 w-32 rounded" />
						</div>
					</div>
				}
			>
				<DisplayLoading />
			</Suspense>
		);
	}
	if (!paste) {
		return (
			<Suspense fallback={null}>
				<DisplayError />
			</Suspense>
		);
	}

	if ((paste.isPasswordProtected || !!paste.password) && !paste.content) {
		return (
			<Suspense
				fallback={
					<div className="max-w-md mx-auto mt-20 p-8 glass-card space-y-6 animate-pulse">
						<div className="flex flex-col items-center gap-4">
							<Skeleton className="h-12 w-12 rounded-xl" />
							<Skeleton className="h-8 w-40" />
						</div>
						<div className="space-y-3">
							<Skeleton className="h-10 w-full rounded-lg" />
							<Skeleton className="h-10 w-full rounded-lg" />
						</div>
					</div>
				}
			>
				<PasswordGate
					passwordInput={passwordInput}
					setPasswordInput={setPasswordInput}
					passwordError={passwordError}
					setPasswordError={setPasswordError}
					handleVerifyPassword={async () => {
						setIsVerifyingPassword(true);
						try {
							const data = await apiHelpers.verifyPassword(
								id!,
								passwordInput,
							);
							updateAllFromData(data);
							if (data.redirectUrl && data.contentMode === "link")
								window.location.href = data.content;
						} catch {
							setPasswordError(t("messages.password_incorrect"));
						} finally {
							setIsVerifyingPassword(false);
						}
					}}
					isVerifying={isVerifyingPassword}
				/>
			</Suspense>
		);
	}

	const visibleActiveUsers = syncUsers.map((u) => ({
		...u,
		isMe: u.socketId === sharedSocketRef.current?.id,
	}));

	const isOwnerOrAdmin =
		isOwner ||
		(!!user &&
			shareList.some(
				(item) => item.email === user.email && item.role === "admin",
			));

	return (
		<>
			<div className="flex flex-col h-screen overflow-hidden bg-background">
				{!isFullscreen && !isWindowFullscreen && (
					<div className="shrink-0">
						<Suspense
							fallback={
								<div className="flex items-center justify-between gap-3 px-4 py-1.5 md:px-6 bg-background/40 backdrop-blur-xl relative z-20 shadow-sm border-b border-border/50 animate-pulse h-[52px]">
									<div className="flex items-center gap-2">
										<Skeleton className="h-9 w-24 rounded-lg" />
										<Skeleton className="h-9 w-20 rounded-lg hidden sm:block" />
									</div>
									<div className="flex-1" />
									<div className="flex items-center gap-3">
										<Skeleton className="h-8 w-32 rounded-full hidden md:block" />
										<Skeleton className="h-9 w-9 rounded-lg" />
										<Skeleton className="h-9 w-9 rounded-lg" />
										<Skeleton className="h-9 w-32 rounded-lg" />
									</div>
								</div>
							}
						>
							<DisplayToolbar
								activeUsers={visibleActiveUsers}
								isEdit={isEdit}
								showAutosave={contentType !== "file"}
								showSaveButton={contentType === "file"}
								saveStatus={saveStatus}
								content={updatedContent || paste.content}
								onRecordingChange={handleRecordingChange}
								onEdit={(val) => {
									if (val && paste) updateAllFromData(paste);
									setIsEdit(val);
								}}
								onDelete={handleDelete}
								onSave={() => handleEditSave()}
								onCancel={handleCancel}
								isSaving={isSaving}
								fontSize={fontSize}
								setFontSize={setFontSize}
								showFontControls={
									!["link", "file", "draw"].includes(
										contentType,
									)
								}
								allowComments={allowComments}
								commentCount={paste.comments?.length ?? 0}
								paste={paste}
								contentType={contentType}
								onCommentAdded={(newComment: CommentData) =>
									setPaste((prev) =>
										prev
											? {
													...prev,
													comments: [
														...(prev.comments ||
															[]),
														newComment,
													],
												}
											: prev,
									)
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
								isAiAutocompleteEnabled={
									isAiAutocompleteEnabled
								}
								setIsAiAutocompleteEnabled={
									setIsAiAutocompleteEnabled
								}
								onContentChange={onContentChange}
								onAiWriterClick={() => {
									if (editorInstanceRef.current) {
										const selection =
											editorInstanceRef.current.getSelection();
										if (selection && !selection.isEmpty()) {
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
						</Suspense>
						{!isEdit && (
							<Suspense
								fallback={
									<div className="px-4 py-2 border-b border-border/10 flex gap-4 animate-pulse">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-24" />
									</div>
								}
							>
								<DisplayMetadata paste={paste} />
							</Suspense>
						)}
					</div>
				)}

				<div className="flex-1 flex flex-col w-full min-h-0 h-full overflow-hidden">
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
									fallback={
										<div className="h-10 w-full flex items-center gap-4 px-2 animate-pulse">
											<Skeleton className="h-8 w-32 rounded-lg" />
											<Skeleton className="h-8 w-24 rounded-lg" />
											<Skeleton className="h-8 w-24 rounded-lg" />
											<div className="flex-1" />
											<Skeleton className="h-8 w-8 rounded-lg" />
										</div>
									}
								>
									<EditControls
										pasteId={id}
										contentType={contentType}
										setContentType={setContentType}
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
										isAdmin={isOwnerOrAdmin}
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

						<Suspense
							fallback={
								<div className="flex-1 flex flex-col p-6 space-y-4 animate-pulse bg-background/50 rounded-xl">
									<div className="space-y-2">
										<Skeleton className="h-4 w-[80%]" />
										<Skeleton className="h-4 w-[60%]" />
										<Skeleton className="h-4 w-[70%]" />
									</div>
									<div className="flex-1 bg-muted/5 rounded-lg border border-border/50" />
								</div>
							}
						>
							<DisplayWorkspace
								id={id ?? ""}
								isEdit={isEdit}
								contentType={contentType}
								language={language}
								updatedContent={updatedContent}
								paste={paste}
								handleContentChange={(val) =>
									handleContentChange(
										val,
										isRemoteUpdateRef,
										editorInstance,
										handleEditorChange,
									)
								}
								handleEditorChange={handleEditorChange}
								handleEditorMount={handleEditorMount}
								handleEditorWillMount={handleEditorWillMount}
								theme={theme}
								fontSize={fontSize}
								contentRef={contentRef}
								sharedSocketRef={sharedSocketRef}
								syncUsers={syncUsers}
								isFullscreen={isFullscreen}
								setIsFullscreen={setIsFullscreen}
								isWindowFullscreen={isWindowFullscreen}
								setIsWindowFullscreen={setIsWindowFullscreen}
								isTerminalOpen={isTerminalOpen}
								setIsTerminalOpen={setIsTerminalOpen}
								terminalPosition={terminalPosition}
								setTerminalPosition={setTerminalPosition}
								socket={socket}
								onFileSelect={(file) => {
									setPendingFile(file);
									setFileUpload(file);
									setUpdatedContent(
										paste?.content || "File Update",
									);
								}}
								onClearFile={() => {
									setPendingFile(null);
									resetFileUpload();
									setIsServerFileRemoved(true);
								}}
								isServerFileRemoved={isServerFileRemoved}
								uploadedFileName={uploadedFileName}
								isFileUploading={isFileUploading}
								fileUploadProgress={fileUploadProgress}
								fileUploadError={fileUploadError}
							/>
						</Suspense>
					</div>
				</div>
			</div>

			<Suspense fallback={null}>
				<DisplayDialogs
					isCustomExpiryDialogOpen={isCustomExpiryDialogOpen}
					setIsCustomExpiryDialogOpen={setIsCustomExpiryDialogOpen}
					customExpiryDate={state.customExpiryDate}
					setCustomExpiryDate={state.setCustomExpiryDate}
					onCustomExpiryConfirm={async () => {
						setIsCustomExpiryDialogOpen(false);
						if (state.customExpiryDate)
							setExpiresTime(
								state.customExpiryDate.toISOString(),
							);
					}}
					isDeleteDialogOpen={isDeleteDialogOpen}
					setIsDeleteDialogOpen={setIsDeleteDialogOpen}
					onDeleteConfirm={onDeleteConfirm}
					isAiDialogOpen={isAiDialogOpen}
					setIsAiDialogOpen={setIsAiDialogOpen}
					selectedText={selectedText}
					prefillInstruction={prefillInstruction}
					applyEnhancedText={applyEnhancedText}
				/>
				<AiWriterDialog
					isOpen={isAiWriterDialogOpen}
					onClose={() => setIsAiWriterDialogOpen(false)}
					onApply={applyWriterText}
					selectedText={selectedText}
				/>
			</Suspense>
		</>
	);
};

export default DisplayPage;
