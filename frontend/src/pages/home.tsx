import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { type OnMount, type BeforeMount } from "@monaco-editor/react";
import { AxiosError } from "axios";

import { useApiHelpers } from "@/lib/api";
import { saveToLocal } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { useAuth } from "@/context/AuthContext";
import { useFileUpload } from "@/hooks/use-file-upload";
import type { IdType } from "@/types";
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

	const [visibility, setVisibility] = useState<
		"public" | "private" | "shared"
	>("public");
	const [editPermission, setEditPermission] = useState<
		"owner" | "shared" | "public"
	>("owner");
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
	const [shareList, setShareList] = useState<
		{ email: string; role: "viewer" | "editor" | "admin" | "commenter" }[]
	>([]);
	const [publicRole, setPublicRole] = useState<
		"viewer" | "editor" | "commenter"
	>("viewer");
	const [allowComments, setAllowComments] = useState(false);
	const [expiresTime, setExpiresTime] = useState(CONFIG.DEFAULTS.EXPIRY);
	const [textValue, _setTextValue] = useState("");
	const [contentType, setContentType] = useState<
		"text" | "code" | "link" | "file"
	>("text");
	const [language, setLanguage] = useState(CONFIG.DEFAULTS.LANGUAGE);
	const { isDetecting, detectLanguage } = useLanguageDetection();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isCustomExpiryDialogOpen, setIsCustomExpiryDialogOpen] =
		useState(false);
	const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(
		new Date(Date.now() + 24 * 60 * 60 * 1000),
	);
	const [customId, setCustomId] = useState("");
	const [password, setPassword] = useState("");
	const [idTypeTab, setIdTypeTab] = useState<"system" | "dynamic">("system");
	const [dialogError, setDialogError] = useState("");
	const [fastRedirect, setFastRedirect] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// File upload state
	const {
		isUploading,
		progress: uploadProgress,
		error: uploadError,
		fileUrl,
		fileName,
		fileSize,
		fileMimeType,
		uploadFile,
		reset: resetFileUpload,
	} = useFileUpload();

	const setTextValue = (val: string) => {
		_setTextValue(val);
		valueRef.current = val;
	};

	const handleSubmit = async (
		selectedIdType: IdType,
		providedId?: string,
		options: {
			visibility?: "public" | "private" | "shared";
			password?: string;
			editPermission?: "owner" | "shared" | "public";
			allowedUsers?: string[];
			shareList?: {
				email: string;
				role: "viewer" | "editor" | "admin" | "commenter";
			}[];
			publicRole?: "viewer" | "editor" | "commenter";
			allowComments?: boolean;
			redirectUrl?: boolean;
		} = {},
	) => {
		try {
			setIsSubmitting(true);
			const finalVisibility = options.visibility ?? visibility;
			const finalEditPermission =
				options.editPermission ?? editPermission;

			const data = await apiHelpers.submitPaste({
				content:
					contentType === "file"
						? fileUrl || fileName || "File upload"
						: textValue,
				expiresTime,
				idType: selectedIdType,
				customId: providedId,
				contentMode: contentType,
				fileUrl: contentType === "file" ? fileUrl : undefined,
				fileName: contentType === "file" ? fileName : undefined,
				fileSize: contentType === "file" ? fileSize : undefined,
				fileMimeType: contentType === "file" ? fileMimeType : undefined,
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
			toast.success(
				t("messages.snippet_created", { idType: selectedIdType }),
				{
					position: "bottom-right",
				},
			);
			navigate("/" + data.id, { state: { pasteData: data } });
			if (!user) {
				saveToLocal(data);
			}
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

	const handleLanguageDetection = async (content: string) => {
		const result = await detectLanguage(content);
		if (result) {
			if (result.isCode) {
				setContentType("code");
				setLanguage(result.language);
			} else {
				setContentType("text");
			}
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		if (valueRef.current.trim() !== "") return;
		handleLanguageDetection(e.clipboardData.getData("text"));
	};

	const handleEditorMount: OnMount = (editor) => {
		editor.onDidPaste(() => {
			const value = editor.getValue();
			if (valueRef.current.trim() === "") handleLanguageDetection(value);
		});
	};

	const handleCreationClick = () => {
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
		<div className="flex-1 flex flex-col bg-gradient-to-br from-background via-muted/5 to-background">
			<div className="flex flex-col gap-4 my-2 mx-3 md:my-4 md:mx-5">
				<MainToolbar
					contentType={contentType}
					setContentType={setContentType}
					expiresTime={expiresTime}
					setExpiresTime={setExpiresTime}
					setIsCustomExpiryDialogOpen={setIsCustomExpiryDialogOpen}
					hasContent={
						contentType === "file"
							? !!fileUrl
							: textValue.length > 0
					}
					handleCreationClick={handleCreationClick}
					handleQuickPaste={handleQuickPaste}
				/>

				<div className="flex flex-wrap items-center gap-3">
					{(isDetecting || contentType === "code") && (
						<div className="w-full sm:w-auto">
							<LanguageSelector
								value={language}
								onValueChange={setLanguage}
								isDetecting={isDetecting}
							/>
						</div>
					)}

					{contentType !== "link" && (
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
				onFileSelect={async (file) => {
					const result = await uploadFile(file);
					if (result.error) {
						toast.error(result.error);
					}
				}}
				uploadProgress={uploadProgress}
				isUploading={isUploading}
				uploadedFileName={fileName}
				uploadError={uploadError}
				onClearFile={resetFileUpload}
			/>
		</div>
	);
};

export default HomePage;
