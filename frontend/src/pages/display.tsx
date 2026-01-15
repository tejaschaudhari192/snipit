import { Button } from "@/components/ui/button";
import { Editor, type BeforeMount } from "@monaco-editor/react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiHelpers } from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Error from "@/components/error";
import { toast } from "sonner";
import Loader from "@/components/loader";
import type { PasteData } from "@/types";
import { getTimeRemaining, saveToLocal } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ButtonGroup } from "@/components/ui/button-group";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import aiGif from "@/assets/images/ai.gif";
import {
	Code2,
	Edit,
	Trash2,
	Save,
	X,
	Clock,
	Minus,
	Plus,
	Link,
	FileText,
} from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { defineMonacoThemes } from "@/lib/monaco";
import { LanguageIcon } from "@/components/language-icon";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background";

const DisplayPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const apiHelpers = useApiHelpers();
	const { t } = useTranslation();
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [paste, setPaste] = useState<PasteData>();
	const [updatedContent, setUpdatedContent] = useState<string>();

	const [loading, setLoading] = useState<boolean>(true);
	const [language, setLanguage] = useState<string>("text");
	const [contentType, setContentType] = useState<"text" | "code" | "link">(
		"text",
	);
	const [isDetecting, setIsDetecting] = useState<boolean>(false);
	const { theme } = useTheme();
	const { fontSize, ref: contentRef, setFontSize } = usePinchZoom(14);

	const handleEditorWillMount: BeforeMount = (monaco) => {
		defineMonacoThemes(monaco);
	};

	useEffect(() => {
		async function loadData() {
			// Check if we already have the paste data from navigation state (creator's first view)
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
				// Clear the state so a refresh will trigger a real fetch
				window.history.replaceState({}, document.title);
				return;
			}

			const data = await apiHelpers.getPaste(id!);
			if (data) {
				if (data.redirectUrl) {
					let url = data.content;
					if (!/^https?:\/\//i.test(url)) {
						url = "https://" + url;
					}
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

			// Wait for at least 2 seconds to make the animation feel natural
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
				onClick: () => {
					toast.info("Action cancelled", {
						position: "bottom-right",
					});
				},
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

	return (
		<div className="flex-1 flex flex-col min-h-0">
			{loading ? (
				<div className="flex-1 flex justify-center items-center">
					<Loader />
				</div>
			) : paste?.content ? (
				<>
					<div className="flex flex-col border-b bg-background/50 backdrop-blur-md sticky top-0 z-40">
						<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
							<div className="flex items-center gap-2">
								{!isEdit ? (
									<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5 max-w-[75vw] sm:max-w-none">
										<CopyButton
											variant="outline"
											content={paste.content}
											className="gap-2 px-3 h-9 w-auto rounded-md text-sm font-medium shrink-0"
										>
											<span className="hidden sm:inline">
												{t("display.copy_button")}
											</span>
										</CopyButton>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setIsEdit(true)}
											className="gap-2 h-9 shrink-0"
										>
											<Edit className="h-4 w-4" />
											<span className="hidden sm:inline">
												{t("display.edit_button")}
											</span>
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={handleDelete}
											className="gap-2 h-9 shrink-0 text-destructive hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
											<span className="hidden sm:inline">
												{t("display.delete_button")}
											</span>
										</Button>
									</div>
								) : (
									<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5 max-w-[75vw] sm:max-w-none">
										<Button
											variant="default"
											size="sm"
											onClick={handleEditSave}
											className="gap-2 h-9"
										>
											<Save className="h-4 w-4" />
											<span className="hidden sm:inline">
												{t("display.save_button")}
											</span>
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setIsEdit(false);
												setUpdatedContent(
													paste?.content,
												);
												setContentType(
													paste?.redirectUrl
														? "link"
														: paste?.language !==
															  "text"
															? "code"
															: "text",
												);
												setLanguage(
													paste?.language || "text",
												);
											}}
											className="gap-2 h-9"
										>
											<X className="h-4 w-4" />
											<span className="hidden sm:inline">
												Cancel
											</span>
										</Button>
									</div>
								)}
							</div>

							<div className="flex items-center gap-2 ml-auto">
								{contentType !== "link" && (
									<ButtonGroup className="h-10">
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												setFontSize((prev: number) =>
													Math.max(prev - 1, 8),
												)
											}
											className="h-10 w-10 px-0 shrink-0"
										>
											<Minus className="h-4 w-4" />
										</Button>
										<div className="flex items-center justify-center px-4 bg-muted/30 text-xs font-bold min-w-[44px]">
											{fontSize}
										</div>
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												setFontSize((prev: number) =>
													Math.min(prev + 1, 48),
												)
											}
											className="h-10 w-10 px-0 shrink-0"
										>
											<Plus className="h-4 w-4" />
										</Button>
									</ButtonGroup>
								)}
							</div>
						</div>

						<div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t text-[10px] sm:text-xs mt-1 md:mt-2">
							<div className="flex items-center gap-3">
								{paste.language ? (
									<div className="flex items-center gap-1.5 font-medium text-muted-foreground uppercase tracking-wider">
										<LanguageIcon
											language={paste.language}
											className="h-3 w-3"
										/>
										{paste.language === "text"
											? "Plain Text"
											: paste.language}
									</div>
								) : null}
								<div className="w-px h-3 bg-border hidden sm:block" />
								<div className="flex items-center gap-1.5 text-muted-foreground">
									<Clock className="h-3 w-3" />
									{paste.burnAfterRead ||
									paste.expiresTime === "one-time"
										? t(
												"home.expire_options.one_time_snippet",
											)
										: `${t("display.expires_in")} ${getTimeRemaining(paste.expiresAt)}`}
								</div>
							</div>
						</div>
					</div>
					{(paste.burnAfterRead ||
						paste.expiresTime === "one-time") && (
						<div className="mx-4 mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-sm flex items-center gap-2">
							<span className="text-lg">⚠️</span>
							{t("display.burn_after_read_warning")}{" "}
							{paste.views === 0
								? "(2 views remaining)"
								: paste.views === 1
									? "(1 view remaining)"
									: "(Final view)"}
						</div>
					)}
					<div className="mx-3 sm:mx-5 my-4 h-[75vh]">
						{isEdit ? (
							<div className="h-full flex flex-col gap-4">
								<Tabs
									value={contentType}
									onValueChange={(val) =>
										setContentType(
											val as "text" | "code" | "link",
										)
									}
									className="w-full md:w-auto"
								>
									<TabsList className="h-10">
										<TabsTrigger
											value="text"
											className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
										>
											<FileText className="h-4 w-4 shrink-0" />
											<span className="whitespace-nowrap">
												{t("home.tab_text")}
											</span>
										</TabsTrigger>
										<TabsTrigger
											value="code"
											className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
										>
											<Code2 className="h-4 w-4 shrink-0" />
											<span className="whitespace-nowrap">
												{t("home.tab_code")}
											</span>
										</TabsTrigger>
										<TabsTrigger
											value="link"
											className="flex-1 flex items-center justify-center gap-2 px-3 text-sm font-semibold"
										>
											<Link className="h-4 w-4 shrink-0" />
											<span className="whitespace-nowrap">
												{t("home.tab_link")}
											</span>
										</TabsTrigger>
									</TabsList>
								</Tabs>

								<div className="flex items-center gap-2">
									{contentType === "code" && (
										<>
											{isDetecting ? (
												<div className="relative p-[1px] overflow-hidden rounded-md w-[160px] h-10 shrink-0">
													<div className="absolute inset-[-200%] moving-border-gradient animate-moving-border opacity-80" />
													<div className="relative z-10 w-full h-full px-3 flex items-center gap-2 bg-background dark:bg-slate-900 rounded-[5px] text-sm text-foreground/80 select-none">
														<span className="whitespace-nowrap">
															{t(
																"home.auto_detecting",
															)}
														</span>
														<img
															src={aiGif}
															alt="AI Detecting"
															className="w-5 h-5 shrink-0"
														/>
													</div>
												</div>
											) : (
												<Select
													value={language}
													onValueChange={setLanguage}
												>
													<SelectTrigger className="w-[240px] h-10 bg-muted/20 hover:bg-muted/40 border-border/50 transition-all duration-200 shadow-sm">
														<SelectValue placeholder="Language" />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectItem value="text">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="text"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		Plain
																		Text
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="javascript">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="javascript"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		JavaScript
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="typescript">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="typescript"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		TypeScript
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="html">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="html"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		HTML
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="css">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="css"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		CSS
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="json">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="json"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		JSON
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="java">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="java"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		Java
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="python">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="python"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		Python
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="c">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="c"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		C
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="cpp">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="cpp"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		C++
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="csharp">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="csharp"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		C#
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="go">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="go"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		Go
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="rust">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="rust"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		Rust
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="markdown">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="markdown"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		Markdown
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="shell">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="shell"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		Shell/Bash
																	</span>
																</span>
															</SelectItem>
															<SelectItem value="other">
																<span className="inline-flex items-center gap-2">
																	<LanguageIcon
																		language="other"
																		className="h-4 w-4 shrink-0"
																	/>
																	<span>
																		Other
																	</span>
																</span>
															</SelectItem>
														</SelectGroup>
													</SelectContent>
												</Select>
											)}
											<Button
												variant="ghost"
												size="sm"
												className="h-10 px-3 text-muted-foreground hover:text-foreground"
												onClick={() =>
													handleLanguageDetection(
														updatedContent!,
													)
												}
												disabled={
													isDetecting ||
													!updatedContent
												}
												title="Auto detect language"
											>
												<Code2 className="h-4 w-4" />
											</Button>
										</>
									)}
								</div>

								<div
									ref={contentRef}
									className="flex-1 border rounded-md overflow-hidden touch-none"
								>
									{contentType === "code" ? (
										<Editor
											height="100%"
											language={language}
											value={updatedContent}
											onChange={(value) =>
												setUpdatedContent(value || "")
											}
											theme={
												theme === "dark"
													? "snipit-dark"
													: "snipit-light"
											}
											beforeMount={handleEditorWillMount}
											options={{
												minimap: { enabled: false },
												fontSize: fontSize,
												padding: { top: 16 },
												mouseWheelZoom: true,
												wordWrap: "on",
											}}
										/>
									) : contentType === "link" ? (
										<AuroraBackground className="h-full w-full rounded-md border-0">
											<div className="w-full max-w-2xl space-y-6 relative z-10 px-4">
												<div className="flex flex-col items-center gap-2 text-center">
													<div className="p-4 rounded-full bg-primary/10 text-primary backdrop-blur-sm">
														<Link className="h-8 w-8" />
													</div>
												</div>
												<Input
													value={updatedContent}
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>,
													) =>
														setUpdatedContent(
															e.target.value,
														)
													}
													placeholder={t(
														"home.link_placeholder",
													)}
													className="h-14 text-lg px-6 rounded-xl border-primary/20 focus-visible:ring-primary/30 shadow-lg bg-background/50 backdrop-blur-md"
												/>
											</div>
										</AuroraBackground>
									) : (
										<Textarea
											className="h-full w-full resize-none border-0 focus-visible:ring-0 font-mono"
											value={updatedContent}
											onChange={(
												e: React.ChangeEvent<HTMLTextAreaElement>,
											) =>
												setUpdatedContent(
													e.target.value,
												)
											}
											style={{
												fontSize: `${fontSize}px`,
											}}
										/>
									)}
								</div>
							</div>
						) : paste.language && paste.language !== "text" ? (
							<div
								ref={contentRef}
								className="h-full border rounded-md overflow-hidden touch-none"
							>
								<Editor
									height="100%"
									language={paste.language}
									value={paste.content}
									theme={
										theme === "dark"
											? "snipit-dark"
											: "snipit-light"
									}
									beforeMount={handleEditorWillMount}
									options={{
										minimap: { enabled: false },
										fontSize: fontSize,
										padding: { top: 16 },
										readOnly: true,
										domReadOnly: true,
										mouseWheelZoom: true,
										wordWrap: "on",
									}}
								/>
							</div>
						) : (
							<div
								ref={contentRef}
								className="h-full border rounded-md overflow-hidden touch-none"
							>
								<Card className="h-full overflow-y-auto border-0 rounded-none">
									<CardContent
										className="h-fit whitespace-pre-wrap py-4"
										style={{ fontSize: `${fontSize}px` }}
									>
										{paste.content}
									</CardContent>
								</Card>
							</div>
						)}
					</div>
				</>
			) : (
				<Error />
			)}
		</div>
	);
};

export default DisplayPage;
