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

import { DisplayToolbar } from "@/components/display/display-toolbar";
import { DisplayMetadata } from "@/components/display/display-metadata";
import { DisplayContent } from "@/components/display/display-content";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { EditControls } from "@/components/display/edit-controls";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { CustomExpiryDialog } from "@/components/home/custom-expiry-dialog";

const DisplayPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const apiHelpers = useApiHelpers();
	const { theme } = useTheme();
	const { user } = useAuth();
	const { t } = useTranslation();

	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [paste, setPaste] = useState<PasteData>();
	const [updatedContent, setUpdatedContent] = useState<string>();
	const [loading, setLoading] = useState<boolean>(true);
	const [language, setLanguage] = useState<string>("text");
	const [contentType, setContentType] = useState<
		"text" | "code" | "link" | "file"
	>("text");
	const [visibility, setVisibility] = useState<
		"public" | "private" | "shared"
	>("public");
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);
	const [editPermission, setEditPermission] = useState<
		"owner" | "shared" | "public"
	>("owner");
	const [shareList, setShareList] = useState<
		{ email: string; role: "viewer" | "editor" | "admin" | "commenter" }[]
	>([]);
	const [publicRole, setPublicRole] = useState<
		"viewer" | "editor" | "commenter"
	>("viewer");
	const [allowComments, setAllowComments] = useState(false);
	const [customId, setCustomId] = useState<string>("");
	const { isDetecting, detectLanguage } = useLanguageDetection();
	const { fontSize, ref: contentRef, setFontSize } = usePinchZoom(14);
	const [passwordInput, setPasswordInput] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [editPassword, setEditPassword] = useState("");
	const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
	const [expiresTime, setExpiresTime] = useState("1d");
	const [isCustomExpiryDialogOpen, setIsCustomExpiryDialogOpen] =
		useState(false);
	const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(
		new Date(Date.now() + 24 * 60 * 60 * 1000),
	);

	const isOwner = !paste?.owner || (!!user && paste.owner === user._id);

	const handleEditorWillMount: BeforeMount = (monaco) =>
		defineMonacoThemes(monaco);

	useEffect(() => {
		async function loadData() {
			if (location.state?.pasteData) {
				const data = location.state.pasteData;
				setPaste(data);
				setUpdatedContent(data.content);
				setLanguage(data.language || "text");
				const detectedType: "text" | "code" | "link" | "file" =
					data.contentMode ||
					(data.redirectUrl
						? "link"
						: data.fileUrl
							? "file"
							: data.language !== "text"
								? "code"
								: "text");
				setContentType(detectedType);

				// Auto-redirect for links OR files if redirectUrl is true
				if (data.redirectUrl) {
					if (detectedType === "link") {
						let url = data.content;
						if (!/^https?:\/\//i.test(url)) url = "https://" + url;
						window.location.href = url;
						return;
					}
				}
				setVisibility(data.visibility || "public");
				setAllowedUsers(data.allowedUsers || []);
				setEditPermission(data.editPermission || "owner");
				setShareList(data.shareList || []);
				setPublicRole(data.publicRole || "viewer");
				setAllowComments(data.allowComments || false);
				setIsPasswordEnabled(
					!!data.password || !!data.isPasswordProtected,
				);
				setExpiresTime(data.expiresTime || "1d");
				setCustomId(data.id || "");
				setLoading(false);
				window.history.replaceState({}, document.title);
				return;
			}

			const data = await apiHelpers.getPaste(id!);
			if (data) {
				const detectedType: "text" | "code" | "link" | "file" =
					data.contentMode ||
					(data.redirectUrl
						? "link"
						: data.fileUrl
							? "file"
							: data.language !== "text"
								? "code"
								: "text");
				setContentType(detectedType);

				// Auto-redirect for links OR files if redirectUrl is true
				if (data.redirectUrl) {
					if (detectedType === "link") {
						let url = data.content;
						if (!/^https?:\/\//i.test(url)) url = "https://" + url;
						window.location.href = url;
						return;
					}
				}
				setVisibility(data.visibility || "public");
				setAllowedUsers(data.allowedUsers || []);
				setEditPermission(data.editPermission || "owner");
				setShareList(data.shareList || []);
				setPublicRole(data.publicRole || "viewer");
				setAllowComments(data.allowComments || false);
				setIsPasswordEnabled(
					!!data.password || !!data.isPasswordProtected,
				);
				setExpiresTime(data.expiresTime || "1d");
				setLanguage(data.language || "text");
				setUpdatedContent(data.content);
				setCustomId(data.id || "");
				setPaste(data);
				if (!user) {
					saveToLocal(data);
				}
			} else {
				setPaste(undefined);
			}
			setLoading(false);
		}
		loadData();
	}, [id, apiHelpers, location.state, user]);

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
		const wasProtected = !!paste?.password || !!paste?.isPasswordProtected;
		const passwordChanged =
			isPasswordEnabled !== wasProtected || !!editPassword;

		const isUnchanged =
			updatedContent === paste?.content &&
			(contentType === "link") === paste?.redirectUrl &&
			language === paste?.language &&
			visibility === paste?.visibility &&
			editPermission === (paste?.editPermission || "owner") &&
			customId.trim() === paste?.id &&
			!passwordChanged &&
			JSON.stringify(allowedUsers) ===
				JSON.stringify(paste?.allowedUsers) &&
			JSON.stringify(shareList) === JSON.stringify(paste?.shareList) &&
			JSON.stringify(shareList) === JSON.stringify(paste?.shareList) &&
			publicRole === paste?.publicRole &&
			allowComments === (paste?.allowComments || false) &&
			expiresTime === (paste?.expiresTime || "1d");

		if (isUnchanged) {
			setIsEdit(false);
			return;
		}

		let passwordPayload: string | undefined = undefined;
		if (!isPasswordEnabled && wasProtected) {
			passwordPayload = "";
		} else if (isPasswordEnabled && editPassword) {
			passwordPayload = editPassword;
		}

		try {
			const data = await apiHelpers.updatePaste(
				id!,
				updatedContent!,
				contentType === "link",
				contentType === "code" ? language : "text",
				visibility,
				visibility === "shared" || editPermission === "shared"
					? allowedUsers
					: [],
				customId.trim() !== id ? customId.trim() : undefined,
				passwordPayload,
				editPermission,
				shareList,
				publicRole,
				allowComments,
				expiresTime,
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
				setEditPermission(data.editPermission || "owner");
				setAllowComments(data.allowComments || false);
				setIsPasswordEnabled(
					!!data.password || !!data.isPasswordProtected,
				);
				setEditPassword("");
				if (!user) {
					saveToLocal(data);
				}

				if (data.id !== id) {
					navigate("/" + data.id, { replace: true });
				}
			} else {
				toast.error(t("messages.update_failed"));
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
		setEditPermission(paste?.editPermission || "owner");
		setCustomId(paste?.id || "");
		setEditPassword("");
		setIsPasswordEnabled(!!paste?.password || !!paste?.isPasswordProtected);
		setAllowComments(paste?.allowComments || false);
		setExpiresTime(paste?.expiresTime || "1d");
	};

	const handleVerifyPassword = async () => {
		try {
			const data = await apiHelpers.verifyPassword(id!, passwordInput);
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
			setEditPermission(data.editPermission || "owner");
		} catch {
			setPasswordError(
				t("messages.password_incorrect", "Incorrect password"),
			);
		}
	};

	return (
		<div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-background via-muted/5 to-background">
			{loading ? (
				<div className="flex-1 flex justify-center items-center">
					<Loader />
				</div>
			) : paste ? (
				(paste.isPasswordProtected || !!paste.password) &&
				!paste.content ? (
					<div className="flex-1 flex justify-center items-center p-4">
						<Card className="w-full max-w-md shadow-lg border-2">
							<CardHeader className="space-y-1 text-center">
								<div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<Lock className="w-6 h-6 text-primary" />
								</div>
								<CardTitle className="text-2xl">
									{t(
										"common.password_protected",
										"Password Protected",
									)}
								</CardTitle>
								<CardDescription>
									{t(
										"common.enter_password_desc",
										"This snippet is password protected. Please enter the password to view it.",
									)}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Input
										type="password"
										placeholder={t(
											"common.password_placeholder",
											"Enter password...",
										)}
										value={passwordInput}
										onChange={(e) => {
											setPasswordInput(e.target.value);
											setPasswordError("");
										}}
										onKeyDown={(e) =>
											e.key === "Enter" &&
											handleVerifyPassword()
										}
										className={
											passwordError
												? "border-red-500"
												: ""
										}
									/>
									{passwordError && (
										<p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
											{passwordError}
										</p>
									)}
								</div>
								<Button
									className="w-full font-bold"
									onClick={handleVerifyPassword}
									disabled={!passwordInput}
								>
									{t("common.unlock", "Unlock Snippet")}
								</Button>
							</CardContent>
						</Card>
					</div>
				) : (
					<div className="flex-1 overflow-y-auto">
						<div className="flex flex-col border-b bg-background/50 backdrop-blur-md sticky top-0 z-40">
							<DisplayToolbar
								isEdit={isEdit}
								content={paste.content}
								onEdit={(val) => {
									if (val) {
										setUpdatedContent(paste?.content);
										setVisibility(
											paste?.visibility || "public",
										);
										setAllowedUsers(
											paste?.allowedUsers || [],
										);
										setLanguage(paste?.language || "text");
										setContentType(
											paste?.redirectUrl
												? "link"
												: paste?.language !== "text"
													? "code"
													: "text",
										);
										setCustomId(paste?.id || "");
										setEditPermission(
											paste?.editPermission || "owner",
										);
										setIsPasswordEnabled(
											!!paste?.password ||
												!!paste?.isPasswordProtected,
										);
										setAllowComments(
											paste?.allowComments || false,
										);
									}
									setIsEdit(val);
								}}
								onDelete={handleDelete}
								onSave={handleEditSave}
								onCancel={handleCancel}
								fontSize={fontSize}
								setFontSize={setFontSize}
								showFontControls={contentType !== "link"}
								allowComments={allowComments}
								commentCount={paste.comments?.length || 0}
								paste={paste}
								onCommentAdded={(updated) => setPaste(updated)}
							/>
							{!isEdit && <DisplayMetadata paste={paste} />}
						</div>

						<div className="w-full px-3 sm:px-5 py-6">
							{isEdit && (
								<div className="mb-4">
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
											handleLanguageDetection(
												updatedContent!,
											)
										}
										customId={customId}
										setCustomId={setCustomId}
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
										expiresTime={expiresTime}
										setExpiresTime={setExpiresTime}
										setIsCustomExpiryDialogOpen={
											setIsCustomExpiryDialogOpen
										}
									/>
								</div>
							)}
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
					</div>
				)
			) : (
				<Error />
			)}
		</div>
	);
};

export default DisplayPage;
