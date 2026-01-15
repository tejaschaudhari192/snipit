import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { type BeforeMount } from "@monaco-editor/react";

import { useApiHelpers } from "@/lib/api";
import { saveToLocal } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { defineMonacoThemes } from "@/lib/monaco";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import type { PasteData } from "@/types";

import Loader from "@/components/loader";
import Error from "@/components/error";

// Extracted Components
import { DisplayToolbar } from "@/components/display/display-toolbar";
import { DisplayMetadata } from "@/components/display/display-metadata";
import { DisplayContent } from "@/components/display/display-content";
import { EditControls } from "@/components/display/edit-controls";

const DisplayPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const apiHelpers = useApiHelpers();
	const { theme } = useTheme();

	// State
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [paste, setPaste] = useState<PasteData>();
	const [updatedContent, setUpdatedContent] = useState<string>();
	const [loading, setLoading] = useState<boolean>(true);
	const [language, setLanguage] = useState<string>("text");
	const [contentType, setContentType] = useState<"text" | "code" | "link">(
		"text",
	);
	const [isDetecting, setIsDetecting] = useState<boolean>(false);
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
				saveToLocal(data);
			} else {
				setPaste(undefined);
			}
			setLoading(false);
		}
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

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
			if (result.language) {
				const detectedLang =
					result.language === "bash" ? "shell" : result.language;
				setLanguage(detectedLang);
				toast.success(`Detected language: ${detectedLang}`);
			}
		} catch (error) {
			console.error("Failed to detect language", error);
		} finally {
			setIsDetecting(false);
		}
	};

	const handleDelete = async () => {
		toast("Are you sure you want to delete this paste?", {
			position: "top-center",
			action: {
				label: "Delete",
				onClick: async () => {
					const data = await apiHelpers.deletePaste(id!);
					if (data) {
						toast.success("Paste deleted", {
							position: "bottom-right",
						});
						navigate("/");
					} else {
						toast.error("Failed to delete paste", {
							position: "bottom-right",
						});
					}
				},
			},
			cancel: {
				label: "Cancel",
				onClick: () =>
					toast.info("Action cancelled", {
						position: "bottom-right",
					}),
			},
		});
	};

	const handleEditSave = async () => {
		if (
			updatedContent === paste?.content &&
			(contentType === "link") === paste?.redirectUrl
		) {
			setIsEdit(false);
			return;
		}

		const data = await apiHelpers.updatePaste(
			id!,
			updatedContent!,
			contentType === "link",
			contentType === "code" ? language : "text",
		);
		if (data) {
			toast.success("Paste updated Successfully ✔️");
			setPaste(data);
			saveToLocal(data);
		} else {
			toast.error("Failed to update paste", {
				style: { backgroundColor: "#ef4444", color: "#fff" },
				duration: 2000,
			});
		}
		setIsEdit(false);
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
	};

	return (
		<div className="flex-1 flex flex-col min-h-0">
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
							onEdit={setIsEdit}
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
								isDetecting={isDetecting}
								onAutoDetect={() =>
									handleLanguageDetection(updatedContent!)
								}
								showLanguageSelector={contentType === "code"}
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
