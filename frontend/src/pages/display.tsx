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
import type { OnMount, BeforeMount } from "@monaco-editor/react";
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

import { ShimmerSection } from "@/components/common/shimmer-section";
import DisplayError from "@/components/common/core/error";
import { PasswordGate } from "@/components/display/password-gate";
import { useRemoteCursors } from "@/hooks/use-remote-cursors";

import { useDisplayState } from "@/hooks/use-display-state";
import { usePasteSync } from "@/hooks/use-paste-sync";
import { useEditorSync } from "@/hooks/use-editor-sync";
import { useDisplayInit } from "@/hooks/display/use-display-init";
import { useDisplayActions } from "@/hooks/display/use-display-actions";

import { DisplayLoading } from "@/components/display/display-loading";
import { DisplayWorkspace } from "@/components/display/display-workspace";
import { DisplayDialogs } from "@/components/display/display-dialogs";
import { useAutosave } from "@/hooks/display/use-autosave";

import type {
	CommentData,
	CursorPosition,
	SelectionRange,
	SocketUpdateData,
} from "@/types";

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
const EditControls = lazy(() =>
	import("@/components/display/edit-controls").then((m) => ({
		default: m.EditControls,
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

	const { fontSize, ref: contentRef, setFontSize } = usePinchZoom(14);
	const isOwner = !!(user && paste?.owner === user._id);
	const handleEditorWillMount: BeforeMount = (m) => defineMonacoThemes(m);

	const {
		isAiDialogOpen,
		setIsAiDialogOpen,
		selectedText,
		prefillInstruction,
		setupAiAction,
		applyEnhancedText,
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
		setupAiAction(ed, monaco);
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

	if (loading) return <DisplayLoading />;
	if (!paste) return <DisplayError />;

	if ((paste.isPasswordProtected || !!paste.password) && !paste.content) {
		return (
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
						<Suspense fallback={<ShimmerSection type="toolbar" />}>
							<DisplayToolbar
								activeUsers={visibleActiveUsers}
								isEdit={isEdit}
								showAutosave={contentType !== "file"}
								showSaveButton={contentType === "file"}
								saveStatus={saveStatus}
								content={updatedContent || paste.content}
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
									fallback={<ShimmerSection type="toolbar" />}
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
				isAiDialogOpen={isAiDialogOpen}
				setIsAiDialogOpen={setIsAiDialogOpen}
				selectedText={selectedText}
				prefillInstruction={prefillInstruction}
				applyEnhancedText={applyEnhancedText}
			/>
		</>
	);
};

export default DisplayPage;
