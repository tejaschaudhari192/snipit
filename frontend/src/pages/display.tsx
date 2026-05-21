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
import { useMusic } from "@/context/use-music";
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

import DisplayError from "@/components/common/core/error";
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
import { DisplayToolbar } from "@/components/display/display-toolbar";
import { AiWriterDialog } from "@/components/editor/ai-writer-dialog";
import { DisplayMetadata } from "@/components/display/display-metadata";
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
import { DisplayWorkspace } from "@/components/display/display-workspace";
import { DisplayDialogs } from "@/components/display/display-dialogs";

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
		collaborators,
		setCollaborators,
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
		isAutosave,
		setIsAutosave,
		language,
		idTypeTab,
		setIdTypeTab,
		isOptionsOpen,
		setIsOptionsOpen,
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
		isDeleting,
		isVerifyingPassword,
		setIsVerifyingPassword,
		isServerFileRemoved,
		setIsServerFileRemoved,
		_setLanguage,
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
		// Preload Monaco Editor only if the content type is code or text
		if (contentType === "code" || contentType === "text") {
			import("@monaco-editor/react").then((m) => {
				m.loader.init();
			});
		}
	}, [contentType]);

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

	const {
		isUploading: isFileUploading,
		error: fileUploadError,
		files: uploadedFiles,
		uploadAll,
		addFiles,
		reset: resetFileUpload,
		hasPending,
	} = useFileUpload();

	const setLanguage = useCallback(
		(newLang: string) => {
			_setLanguage(newLang);
			if (newLang === "text") {
				setContentType((prev) => (prev === "code" ? "text" : prev));
			} else {
				if (isDetecting) return;
				setContentType((prev) => (prev === "text" ? "code" : prev));
			}
		},
		[isDetecting, _setLanguage, setContentType],
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

	const music = useMusic();

	useEffect(() => {
		if (socket && id) {
			music.setPasteSocket(socket, id);
		}
		return () => {
			music.setPasteSocket(null, null);
		};
	}, [socket, id, music]);

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
	} = useDisplayActions({
		id,
		state,
		user,
		hasPending,
		uploadFiles: uploadAll,
	});
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
	const isOwnerOrAdmin =
		isOwner ||
		(!!user &&
			collaborators.some(
				(item) => item.email === user.email && item.role === "admin",
			));
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
		setSaveStatus: state.setSaveStatus,
		config: {
			language,
			visibility,
			editPermission,
			allowedUsers,
			collaborators,
			publicRole,
			allowComments,
			expiresTime,
			customId,
			isPasswordEnabled,
			editPassword,
		},
		originalPaste: paste,
		isAdmin: isOwnerOrAdmin,
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

	if (!loading && !paste) {
		return (
			<Suspense fallback={null}>
				<DisplayError />
			</Suspense>
		);
	}

	if (
		paste &&
		(paste.isPasswordProtected || !!paste.password) &&
		!paste.content
	) {
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

	return (
		<>
			<div className="flex flex-col h-screen overflow-hidden bg-background">
				{!isFullscreen && !isWindowFullscreen && (
					<div className="shrink-0">
						<DisplayToolbar
							activeUsers={visibleActiveUsers}
							isEdit={isEdit}
							showSaveButton={contentType === "file"}
							saveStatus={saveStatus}
							content={updatedContent || paste?.content || ""}
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
								!["link", "file", "draw"].includes(contentType)
							}
							allowComments={allowComments}
							commentCount={paste?.comments?.length ?? 0}
							paste={paste}
							contentType={contentType}
							onCommentAdded={(newComment: CommentData) =>
								setPaste((prev) =>
									prev
										? {
												...prev,
												comments: [
													...(prev.comments || []),
													newComment,
												],
											}
										: prev,
								)
							}
							expiresTime={expiresTime}
							setExpiresTime={setExpiresTime}
							setIsCustomExpiryDialogOpen={
								setIsCustomExpiryDialogOpen
							}
							isAutosave={isAutosave}
							setIsAutosave={setIsAutosave}
							isOptionsOpen={isOptionsOpen}
							setIsOptionsOpen={setIsOptionsOpen}
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
							setLanguage={setLanguage}
							setContentType={setContentType}
							isDetecting={isDetecting}
							onAutoDetect={() =>
								handleLanguageDetection(
									updatedContent || "",
									true,
								)
							}
							isAiAutocompleteEnabled={isAiAutocompleteEnabled}
							setIsAiAutocompleteEnabled={
								setIsAiAutocompleteEnabled
							}
							onContentChange={onContentChange}
							onAiWriterClick={() => {
								if (editorInstanceRef.current) {
									const selection =
										editorInstanceRef.current.getSelection();
									if (selection && !selection.isEmpty()) {
										const text = editorInstanceRef.current
											.getModel()
											?.getValueInRange(selection);
										if (text) setSelectedText(text);
									} else {
										setSelectedText("");
									}
								}
								setIsAiWriterDialogOpen(true);
							}}
						/>
						{!isEdit && (
							<DisplayMetadata paste={paste} loading={loading} />
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
						{isEdit &&
							user &&
							!isFullscreen &&
							!isWindowFullscreen && (
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
											isPasswordEnabled={
												isPasswordEnabled
											}
											setIsPasswordEnabled={
												setIsPasswordEnabled
											}
											editPermission={editPermission}
											setEditPermission={
												setEditPermission
											}
											isOwner={isOwner}
											isAdmin={isOwnerOrAdmin}
											collaborators={collaborators}
											setCollaborators={setCollaborators}
											publicRole={publicRole}
											setPublicRole={setPublicRole}
											allowComments={allowComments}
											setAllowComments={setAllowComments}
											idTypeTab={idTypeTab}
											setIdTypeTab={setIdTypeTab}
											customId={customId}
											setCustomId={setCustomId}
											isOptionsOpen={isOptionsOpen}
											setIsOptionsOpen={setIsOptionsOpen}
											textValue={
												updatedContent || paste?.content
											}
											files={
												uploadedFiles.length > 0
													? uploadedFiles
													: paste?.files
											}
											onSubmit={() =>
												handleEditSave(false)
											}
											originalPasswordProtected={
												!!paste?.isPasswordProtected
											}
											redirectionType={
												state.redirectionType
											}
											setRedirectionType={
												state.setRedirectionType
											}
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
								isAdmin={isOwnerOrAdmin}
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
								onFileSelect={(selectedFiles) => {
									addFiles(selectedFiles);
									setUpdatedContent(
										paste?.content || "File Update",
									);
								}}
								onClearFile={() => {
									resetFileUpload();
									setIsServerFileRemoved(true);
								}}
								isServerFileRemoved={isServerFileRemoved}
								files={uploadedFiles}
								isFileUploading={isFileUploading}
								fileUploadError={fileUploadError}
							/>
						</Suspense>
					</div>
				</div>
			</div>

			<DisplayDialogs
				isCustomExpiryDialogOpen={isCustomExpiryDialogOpen}
				setIsCustomExpiryDialogOpen={setIsCustomExpiryDialogOpen}
				customExpiryDate={state.customExpiryDate}
				setCustomExpiryDate={state.setCustomExpiryDate}
				onCustomExpiryConfirm={async () => {
					setIsCustomExpiryDialogOpen(false);
					if (state.customExpiryDate)
						setExpiresTime(state.customExpiryDate.toISOString());
				}}
				isDeleteDialogOpen={isDeleteDialogOpen}
				setIsDeleteDialogOpen={setIsDeleteDialogOpen}
				onDeleteConfirm={onDeleteConfirm}
				isDeleting={isDeleting}
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
		</>
	);
};

export default DisplayPage;
