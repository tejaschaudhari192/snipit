import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { type BeforeMount } from "@monaco-editor/react";
import { AxiosError } from "axios";

import { useApiHelpers } from "@/lib/api";
import { saveToLocal } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import type { PasteData } from "@/types";

import Loader from "@/components/loader";
import Error from "@/components/error";

// Extracted Components
import { DisplayToolbar } from "@/components/display/display-toolbar";
import { DisplayMetadata } from "@/components/display/display-metadata";
import { DisplayContent } from "@/components/display/display-content";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { EditControls } from "@/components/display/edit-controls";

const DisplayPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const apiHelpers = useApiHelpers();
	const { theme } = useTheme();
	const { user } = useAuth();
	const { t } = useTranslation();

	// State
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [paste, setPaste] = useState<PasteData>();
	const [updatedContent, setUpdatedContent] = useState<string>();
	const [loading, setLoading] = useState<boolean>(true);
	const [language, setLanguage] = useState<string>("text");
	const [contentType, setContentType] = useState<"text" | "code" | "link">(
		"text",
	);
	const [visibility, setVisibility] = useState<
		"public" | "private" | "shared"
	>("public");
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
	const [customId, setCustomId] = useState<string>("");
	const { isDetecting, detectLanguage } = useLanguageDetection();
	const { fontSize, ref: contentRef, setFontSize } = usePinchZoom(14);

	const handleEditorWillMount: BeforeMount = (monaco) =>
		defineMonacoThemes(monaco);

	useEffect(() => {
		async function loadData() {
			if (location.state?.pasteData) {
				const data = location.state.pasteData;
				setPaste(data);
				setUpdatedContent(data.content);
				setLanguage(data.language || "text");
				setContentType(
					data.redirectUrl
						? "link"
						: data.language !== "text"
							? "code"
							: "text",
				);
				setVisibility(data.visibility || "public");
				setAllowedUsers(data.allowedUsers || []);
				setLoading(false);
				window.history.replaceState({}, document.title);
				return;
			}

			const data = await apiHelpers.getPaste(id!);
			if (data) {
				if (data.redirectUrl) {
					let url = data.content;
					if (!/^https?:\/\//i.test(url)) url = "https://" + url;
					window.location.href = url;
					return;
				}
				setPaste(data);
				setUpdatedContent(data.content);
				setLanguage(data.language || "text");
				setContentType(
					data.redirectUrl
						? "link"
						: data.language !== "text"
							? "code"
							: "text",
				);
				setVisibility(data.visibility || "public");
				setAllowedUsers(data.allowedUsers || []);
				if (!user) {
					saveToLocal(data);
				}
			} else {
				setPaste(undefined);
			}
			setLoading(false);
		}
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleLanguageDetection = async (content: string) => {
		const result = await detectLanguage(content);
		if (result) {
			setLanguage(result.language);
		}
	};

	const handleDelete = async () => {
		toast(
			t(
				"messages.delete_confirm",
				"Are you sure you want to delete this snippet?",
			),
			{
				position: "top-center",
				action: {
					label: t("history.clear_action", "Delete"),
					onClick: async () => {
						const data = await apiHelpers.deletePaste(id!);
						if (data) {
							toast.success(
								t(
									"messages.snippet_deleted",
									"Snippet deleted",
								),
								{
									position: "bottom-right",
								},
							);
							navigate("/");
						} else {
							toast.error(
								t(
									"messages.delete_failed",
									"Failed to delete snippet",
								),
								{
									position: "bottom-right",
								},
							);
						}
					},
				},
				cancel: {
					label: t("history.cancel", "Cancel"),
					onClick: () =>
						toast.info(
							t("messages.action_cancelled", "Action cancelled"),
							{
								position: "bottom-right",
							},
						),
				},
			},
		);
	};
	const handleEditSave = async () => {
		const isUnchanged =
			updatedContent === paste?.content &&
			(contentType === "link") === paste?.redirectUrl &&
			language === paste?.language &&
			visibility === paste?.visibility &&
			customId.trim() === paste?.id &&
			JSON.stringify(allowedUsers) ===
				JSON.stringify(paste?.allowedUsers);

		if (isUnchanged) {
			setIsEdit(false);
			return;
		}

		try {
			const data = await apiHelpers.updatePaste(
				id!,
				updatedContent!,
				contentType === "link",
				contentType === "code" ? language : "text",
				visibility,
				visibility === "shared" ? allowedUsers : [],
				customId.trim() !== id ? customId.trim() : undefined,
			);
			if (data) {
				toast.success(
					t(
						"messages.snippet_updated",
						"Snippet updated successfully",
					),
				);
				setPaste(data);
				setUpdatedContent(data.content);
				setLanguage(data.language || "text");
				setContentType(
					data.redirectUrl
						? "link"
						: data.language !== "text"
							? "code"
							: "text",
				);
				setVisibility(data.visibility || "public");
				setAllowedUsers(data.allowedUsers || []);
				if (!user) {
					saveToLocal(data);
				}

				// If ID changed, navigate to new URL
				if (data.id !== id) {
					navigate("/" + data.id, { replace: true });
				}
			} else {
				toast.error("Failed to update paste");
			}
			setIsEdit(false);
		} catch (error) {
			const axiosError = error as AxiosError<{
				error: string;
			}>;
			if (axiosError.response?.status === 409) {
				toast.error(
					t(
						"messages.id_conflict",
						"This ID is already taken. Please try another one.",
					),
				);
			} else {
				toast.error(
					axiosError.response?.data?.error ||
						t("messages.update_failed", "Failed to update snippet"),
				);
			}
		}
	};

	const handleCancel = () => {
		setIsEdit(false);
		setUpdatedContent(paste?.content);
		setContentType(
			paste?.redirectUrl
				? "link"
				: paste?.language !== "text"
					? "code"
					: "text",
		);
		setLanguage(paste?.language || "text");
		setVisibility(paste?.visibility || "public");
		setAllowedUsers(paste?.allowedUsers || []);
		setCustomId(paste?.id || "");
	};

	return (
		<div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-background via-muted/5 to-background">
			{loading ? (
				<div className="flex-1 flex justify-center items-center">
					<Loader />
				</div>
			) : paste?.content ? (
				<>
					<div className="flex flex-col border-b bg-background/50 backdrop-blur-md sticky top-0 z-40">
						<DisplayToolbar
							isEdit={isEdit}
							content={paste.content}
							onEdit={(val) => {
								if (val) {
									// Sync state when entering edit mode
									setUpdatedContent(paste?.content);
									setVisibility(
										paste?.visibility || "public",
									);
									setAllowedUsers(paste?.allowedUsers || []);
									setLanguage(paste?.language || "text");
									setContentType(
										paste?.redirectUrl
											? "link"
											: paste?.language !== "text"
												? "code"
												: "text",
									);
									setCustomId(paste?.id || "");
								}
								setIsEdit(val);
							}}
							onDelete={handleDelete}
							onSave={handleEditSave}
							onCancel={handleCancel}
							fontSize={fontSize}
							setFontSize={setFontSize}
							showFontControls={contentType !== "link"}
						/>
						{!isEdit && <DisplayMetadata paste={paste} />}
					</div>

					<div className="mx-3 sm:mx-5 my-4 h-[75vh] flex flex-col gap-4">
						{isEdit && (
							<EditControls
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
									handleLanguageDetection(updatedContent!)
								}
								customId={customId}
								setCustomId={setCustomId}
							/>
						)}
						<DisplayContent
							isEdit={isEdit}
							contentType={contentType}
							language={language}
							content={updatedContent || ""}
							onContentChange={setUpdatedContent}
							theme={theme}
							fontSize={fontSize}
							contentRef={contentRef}
							handleEditorWillMount={handleEditorWillMount}
							paste={paste}
						/>
					</div>
				</>
			) : (
				<Error />
			)}
		</div>
	);
};

export default DisplayPage;
