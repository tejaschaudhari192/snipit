import { Button } from "@/components/ui/button";
import { Editor, type OnMount, type BeforeMount } from "@monaco-editor/react";
import { AxiosError } from "axios";
import { Textarea } from "@/components/ui/textarea";
import { useApiHelpers } from "@/lib/api";
import { saveToLocal } from "@/lib/utils";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
/* removed unused DropdownMenu imports */
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
	Wand2,
	Fingerprint,
	FileText,
	Code2,
	Minus,
	Plus,
	Clock,
	Link,
} from "lucide-react";
import { motion } from "motion/react";

import { useTranslation } from "react-i18next";
import type { IdType } from "@/types";
import aiGif from "@/assets/images/ai.gif";

import { useTheme } from "@/hooks/use-theme";
import { defineMonacoThemes } from "@/lib/monaco";
import { LanguageIcon } from "@/components/language-icon";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";
import { ButtonGroup } from "@/components/ui/button-group";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background";
import { useAuth } from "@/context/AuthContext";
import { MultiEmailInput } from "@/components/ui/multi-email-input";

const HomePage = () => {
	const userInputRef = useRef<HTMLTextAreaElement>(null);
	const valueRef = useRef("");
	const { fontSize, ref: editorContainerRef, setFontSize } = usePinchZoom(14);
	const { user } = useAuth();
	const [visibility, setVisibility] = useState<
		"public" | "private" | "shared"
	>("public");
	const [allowedUsers, setAllowedUsers] = useState<string[]>([]);

	const [expiresTime, setExpiresTime] = useState("1w");
	const [textValue, _setTextValue] = useState("");
	const setTextValue = (val: string) => {
		_setTextValue(val);
		valueRef.current = val;
	};

	const [contentType, setContentType] = useState<"text" | "code" | "link">(
		"text",
	);
	const [language, setLanguage] = useState("javascript");
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
	const navigate = useNavigate();
	const apiHelpers = useApiHelpers();
	const { t } = useTranslation();
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
			saveToLocal(data);
			return true;
		} catch (error) {
			const axiosError = error as AxiosError<{
				error: string;
				details?: { path: string[]; message: string }[];
			}>;
			if (axiosError.response?.status === 409) {
				return t("messages.id_conflict");
			}

			// Handle validation details from Zod
			const details = axiosError.response?.data?.details;
			if (details && details.length > 0) {
				return details[0].message;
			}

			return (
				axiosError.response?.data?.error || t("messages.snippet_failed")
			);
		}
	};

	const handleLanguageDetection = async (content: string) => {
		setIsDetecting(true);
		const startTime = Date.now();
		// Only detect if it's likely a code paste or significant text
		try {
			const result = await apiHelpers.detectLanguage(content);

			// Wait for at least 2 seconds to make the animation feel natural
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
		const text = e.clipboardData.getData("text");
		handleLanguageDetection(text);
	};

	const handleEditorMount: OnMount = (editor) => {
		editor.onDidPaste(() => {
			const value = editor.getValue();
			if (valueRef.current.trim() === "") {
				handleLanguageDetection(value);
			}
		});
	};

	const handleCreationClick = () => {
		setIsDialogOpen(true);
		setDialogError("");
	};

	const handleDialogSubmit = async () => {
		setDialogError("");
		if (idTypeTab === "dynamic") {
			if (customId.trim()) {
				const result = await handleSubmit("dynamic", customId.trim());
				if (result === true) {
					setIsDialogOpen(false);
					setCustomId("");
				} else {
					setDialogError(result);
				}
			}
		} else {
			const result = await handleSubmit("system");
			if (result === true) {
				setIsDialogOpen(false);
			} else {
				setDialogError(result);
			}
		}
	};

	const { theme } = useTheme();

	const handleEditorWillMount: BeforeMount = (monaco) => {
		defineMonacoThemes(monaco);
	};

	return (
		<div className="h-fit max-h-screen">
			<div className="flex flex-col gap-4 my-2 mx-3 md:my-4 md:mx-5">
				<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
					<Tabs
						value={contentType}
						onValueChange={(val) =>
							setContentType(val as "text" | "code" | "link")
						}
						className="w-full sm:w-auto"
					>
						<TabsList className="h-11 w-full flex">
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

					<div className="flex items-center gap-2 justify-between sm:justify-end">
						<Select
							value={
								expiresTime.includes("-") &&
								expiresTime !== "one-time"
									? "custom"
									: expiresTime
							}
							onValueChange={(val) => {
								if (val === "custom") {
									setIsCustomExpiryDialogOpen(true);
								} else {
									setExpiresTime(val);
								}
							}}
						>
							<SelectTrigger className="flex-1 sm:w-fit h-11">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<SelectValue
										placeholder={t(
											"home.select_expire_time",
										)}
									/>
								</div>
							</SelectTrigger>

							<SelectContent>
								<SelectGroup>
									<SelectItem value="one-time">
										{t(
											"home.expire_options.one_time_snippet",
										)}
									</SelectItem>
									<SelectItem value="1h">
										{t(
											"home.expire_options.expire_in_1_hour",
										)}
									</SelectItem>
									<SelectItem value="1d">
										{t(
											"home.expire_options.expire_in_1_day",
										)}
									</SelectItem>
									<SelectItem value="1w">
										{t(
											"home.expire_options.expire_in_1_week",
										)}
									</SelectItem>
									<SelectItem value="1m">
										{t(
											"home.expire_options.expire_in_1_month",
										)}
									</SelectItem>
									<SelectItem value="1y">
										{t(
											"home.expire_options.expire_in_1_year",
										)}
									</SelectItem>
									<SelectItem value="custom">
										{expiresTime.includes("-") &&
										expiresTime !== "one-time"
											? new Date(
													expiresTime,
												).toLocaleString([], {
													dateStyle: "short",
													timeStyle: "short",
												})
											: t("home.expire_options.custom")}
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>

						<Button
							disabled={!textValue.length}
							size="lg"
							className="px-6 h-11 shadow-lg shadow-primary/20"
							onClick={handleCreationClick}
						>
							{t("home.paste_button")}
						</Button>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{(isDetecting || contentType === "code") && (
						<div className="w-full sm:w-auto">
							{isDetecting ? (
								<button
									type="button"
									className="group relative w-full sm:w-[180px] h-10 shrink-0 rounded-md p-[1px] overflow-hidden focus:outline-none"
								>
									<div className="absolute inset-[-200%] opacity-70 moving-border-gradient animate-moving-border" />
									<div className="relative z-10 flex h-full w-full items-center justify-center gap-2 rounded-[5px] bg-background dark:bg-slate-900 text-sm font-medium">
										<span className="whitespace-nowrap">
											{t("home.auto_detecting")}
										</span>
										<img
											src={aiGif}
											alt="AI Detecting"
											className="w-5 h-5 shrink-0"
										/>
									</div>
								</button>
							) : (
								<Select
									value={language}
									onValueChange={setLanguage}
								>
									<SelectTrigger className="w-full sm:w-[200px] h-10 bg-muted/20">
										<SelectValue placeholder="Language" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{[
												{
													name: "JavaScript",
													value: "javascript",
												},
												{
													name: "TypeScript",
													value: "typescript",
												},
												{ name: "HTML", value: "html" },
												{ name: "CSS", value: "css" },
												{ name: "JSON", value: "json" },
												{ name: "Java", value: "java" },
												{
													name: "Python",
													value: "python",
												},
												{ name: "C", value: "c" },
												{ name: "C++", value: "cpp" },
												{ name: "C#", value: "csharp" },
												{ name: "Go", value: "go" },
												{ name: "Rust", value: "rust" },
												{
													name: "Markdown",
													value: "markdown",
												},
												{
													name: "Shell",
													value: "shell",
												},
												{
													name: "Other",
													value: "other",
												},
											].map((lang) => (
												<SelectItem
													key={lang.value}
													value={lang.value}
												>
													<span className="inline-flex items-center gap-2">
														<LanguageIcon
															language={
																lang.value
															}
															className="h-4 w-4"
														/>
														<span>{lang.name}</span>
													</span>
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							)}
						</div>
					)}

					{contentType !== "link" && (
						<div className="flex items-center gap-2 w-full sm:w-auto">
							<ButtonGroup className="w-full sm:w-auto">
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
						</div>
					)}
				</div>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-md gap-0">
					<DialogHeader className="mb-4">
						<DialogTitle>{t("home.paste_button")}</DialogTitle>
					</DialogHeader>

					<Tabs
						value={idTypeTab}
						onValueChange={(v) =>
							setIdTypeTab(v as "system" | "dynamic")
						}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-2 mb-4">
							<TabsTrigger value="system">
								<Wand2 className="h-4 w-4 mr-2" />
								{t("home.paste_system_id")}
							</TabsTrigger>
							<TabsTrigger value="dynamic">
								<Fingerprint className="h-4 w-4 mr-2" />
								{t("home.paste_dynamic_id")}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="system" className="mt-0 mb-4">
							<p className="text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded-md">
								{t("home.paste_system_id_desc")}
							</p>
						</TabsContent>

						<TabsContent
							value="dynamic"
							className="mt-0 space-y-4 mb-4"
						>
							<div className="space-y-2">
								<Input
									placeholder={t(
										"home.dynamic_id_dialog.placeholder",
									)}
									value={customId}
									className="h-11 focus-visible:ring-primary/50"
									onChange={(e) =>
										setCustomId(e.target.value)
									}
									onKeyDown={(e) =>
										e.key === "Enter" &&
										handleDialogSubmit()
									}
								/>
								{customId.trim() && (
									<p className="text-xs text-muted-foreground ml-1 flex items-center gap-1">
										{t("home.dynamic_id_dialog.preview")}{" "}
										<span className="text-primary font-medium">
											{window.location.origin}/{customId}
										</span>
									</p>
								)}
							</div>
						</TabsContent>
					</Tabs>

					<div className="space-y-4 mb-6">
						<div className="space-y-2">
							<Label>Visibility</Label>
							<Select
								value={visibility}
								onValueChange={(
									val: "public" | "private" | "shared",
								) => setVisibility(val)}
								disabled={!user}
							>
								<SelectTrigger className="w-full h-11">
									<SelectValue placeholder="Visibility" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="public">
										Public
									</SelectItem>
									<SelectItem
										value="private"
										disabled={!user}
									>
										Private {!user && "(Login req)"}
									</SelectItem>
									<SelectItem value="shared" disabled={!user}>
										Shared {!user && "(Login req)"}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{visibility === "shared" && (
							<div className="space-y-2 animate-in fade-in slide-in-from-top-2">
								<Label>Allowed Users</Label>
								<MultiEmailInput
									value={allowedUsers}
									onChange={setAllowedUsers}
									placeholder="Enter emails..."
									className="w-full min-h-[44px]"
								/>
							</div>
						)}
					</div>

					{dialogError && (
						<motion.div
							initial={{ opacity: 0, y: -5 }}
							animate={{ opacity: 1, y: 0 }}
							className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-start gap-2 theme-error-box"
						>
							<div className="mt-0.5">⚠️</div>
							<p>{dialogError}</p>
						</motion.div>
					)}

					<DialogFooter className="sm:justify-between gap-2">
						<Button
							variant="ghost"
							onClick={() => setIsDialogOpen(false)}
						>
							{t("home.dynamic_id_dialog.cancel")}
						</Button>
						<Button
							onClick={handleDialogSubmit}
							disabled={
								idTypeTab === "dynamic" && !customId.trim()
							}
							className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
						>
							{t("home.dynamic_id_dialog.submit")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={isCustomExpiryDialogOpen}
				onOpenChange={setIsCustomExpiryDialogOpen}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="flex items-center gap-2 mb-1">
							<div className="p-2 rounded-lg bg-primary/10 text-primary">
								<Clock className="h-5 w-5" />
							</div>
							<DialogTitle>
								{t("home.expire_options.custom")}
							</DialogTitle>
						</div>
						<p className="text-sm text-muted-foreground">
							Choose a specific date and time for this snippet to
							expire.
						</p>
					</DialogHeader>

					<div className="py-4">
						<DateTimePicker
							date={customExpiryDate}
							setDate={setCustomExpiryDate}
						/>
					</div>

					<DialogFooter className="sm:justify-between gap-2">
						<Button
							variant="ghost"
							onClick={() => setIsCustomExpiryDialogOpen(false)}
						>
							{t("home.dynamic_id_dialog.cancel")}
						</Button>
						<Button
							onClick={() => {
								if (customExpiryDate) {
									setExpiresTime(
										customExpiryDate.toISOString(),
									);
									setIsCustomExpiryDialogOpen(false);
								}
							}}
							disabled={!customExpiryDate}
							className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
						>
							Set Expiry
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div
				ref={editorContainerRef}
				className="m-3 sm:m-5 h-[70vh] border rounded-md overflow-hidden touch-none"
			>
				{contentType === "code" ? (
					<Editor
						height="100%"
						language={language}
						value={textValue}
						onChange={(value) => setTextValue(value || "")}
						theme={
							theme === "dark" ? "snipit-dark" : "snipit-light"
						}
						beforeMount={handleEditorWillMount}
						onMount={handleEditorMount}
						options={{
							minimap: { enabled: false },
							fontSize: fontSize,
							padding: { top: 16 },
							mouseWheelZoom: true,
							wordWrap: "on",
						}}
					/>
				) : contentType === "link" ? (
					<AuroraBackground className="h-full w-full">
						<div className="w-full max-w-2xl space-y-6 relative z-10 px-4">
							<div className="flex flex-col items-center gap-2 text-center">
								<div className="p-4 rounded-full bg-primary/10 text-primary backdrop-blur-sm">
									<Link className="h-8 w-8" />
								</div>
								<h2 className="text-2xl font-bold tracking-tight">
									{t("home.tab_link")}
								</h2>
								<p className="text-muted-foreground">
									{t("home.link_desc")}
								</p>
							</div>
							<Input
								value={textValue}
								onChange={(e) => setTextValue(e.target.value)}
								placeholder={t("home.link_placeholder")}
								className="h-14 text-lg px-6 rounded-xl border-primary/20 focus-visible:ring-primary/30 shadow-lg bg-background/50 backdrop-blur-md"
							/>
							<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
								<span className="flex items-center gap-1">
									✅ {t("home.link_features.fast")}
								</span>
								<span className="flex items-center gap-1">
									✅ {t("home.link_features.custom")}
								</span>
							</div>
						</div>
					</AuroraBackground>
				) : (
					<Textarea
						ref={userInputRef}
						value={textValue}
						onChange={(e) => setTextValue(e.target.value)}
						placeholder={t("home.enter_snippet_placeholder")}
						className="h-full w-full mx-auto resize-none border-0 focus-visible:ring-0"
						onPaste={handlePaste}
						style={{ fontSize: `${fontSize}px` }}
					/>
				)}
			</div>
		</div>
	);
};

export default HomePage;
