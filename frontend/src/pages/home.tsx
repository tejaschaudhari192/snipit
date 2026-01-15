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
import type { IdType } from "@/types";
import { CONFIG } from "@/configurations";

// Extracted Components
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

	// State
	const [visibility, setVisibility] = useState<
		"public" | "private" | "shared"
	>("public");
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
	const [expiresTime, setExpiresTime] = useState(CONFIG.DEFAULTS.EXPIRY);
	const [textValue, _setTextValue] = useState("");
	const [contentType, setContentType] = useState<"text" | "code" | "link">(
		"text",
	);
	const [language, setLanguage] = useState(CONFIG.DEFAULTS.LANGUAGE);
	const [isDetecting, setIsDetecting] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isCustomExpiryDialogOpen, setIsCustomExpiryDialogOpen] =
		useState(false);
	const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(
		new Date(Date.now() + 24 * 60 * 60 * 1000),
	);
	const [customId, setCustomId] = useState("");
	const [idTypeTab, setIdTypeTab] = useState<"system" | "dynamic">("system");
	const [dialogError, setDialogError] = useState("");

	const setTextValue = (val: string) => {
		_setTextValue(val);
		valueRef.current = val;
	};

	const handleSubmit = async (
		selectedIdType: IdType,
		providedId?: string,
	) => {
		try {
			const data = await apiHelpers.submitPaste({
				content: textValue,
				expiresTime,
				idType: selectedIdType,
				customId: providedId,
				redirectUrl: contentType === "link",
				language: contentType === "code" ? language : "text",
				burnAfterRead: expiresTime === "one-time",
				visibility,
				allowedUsers:
					visibility === "shared" ? allowedUsers : undefined,
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
		}
	};

	const handleLanguageDetection = async (content: string) => {
		setIsDetecting(true);
		const startTime = Date.now();
		try {
			const result = await apiHelpers.detectLanguage(content);
			const elapsedTime = Date.now() - startTime;
			if (elapsedTime < 2000) {
				await new Promise((resolve) =>
					setTimeout(resolve, 2000 - elapsedTime),
				);
			}

			if (result.language && result.language !== "text") {
				setContentType("code");
				const detectedLang =
					result.language === "bash" ? "shell" : result.language;
				setLanguage(detectedLang);
				toast.success(
					t("home.detected_language", { language: detectedLang }),
				);
			} else if (result.language === "text") {
				setContentType("text");
			}
		} catch (error) {
			console.error("Failed to detect language", error);
		} finally {
			setIsDetecting(false);
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
		const result = await handleSubmit(idTypeTab, selectedId);
		if (result === true) {
			setIsDialogOpen(false);
			if (idTypeTab === "dynamic") setCustomId("");
		} else {
			setDialogError(result as string);
		}
	};

	const handleEditorWillMount: BeforeMount = (monaco) =>
		defineMonacoThemes(monaco);

	return (
		<div className="h-fit max-h-screen">
			<div className="flex flex-col gap-4 my-2 mx-3 md:my-4 md:mx-5">
				<MainToolbar
					contentType={contentType}
					setContentType={setContentType}
					expiresTime={expiresTime}
					setExpiresTime={setExpiresTime}
					setIsCustomExpiryDialogOpen={setIsCustomExpiryDialogOpen}
					textValue={textValue}
					handleCreationClick={handleCreationClick}
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
				dialogError={dialogError}
				user={user}
				onSubmit={handleDialogSubmit}
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
			/>
		</div>
	);
};

export default HomePage;
