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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDownIcon,
  Sparkles,
  Hash,
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

const HomePage = () => {
  const userInputRef = useRef<HTMLTextAreaElement>(null);
  const valueRef = useRef("");
  const { fontSize, ref: editorContainerRef, setFontSize } = usePinchZoom(14);

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
  const [dialogError, setDialogError] = useState("");
  const navigate = useNavigate();
  const apiHelpers = useApiHelpers();
  const { t } = useTranslation();

  const handleSubmit = async (selectedIdType: IdType, providedId?: string) => {
    try {
      const data = await apiHelpers.submitPaste(
        textValue,
        expiresTime,
        selectedIdType,
        providedId,
        contentType === "link",
        contentType === "code" ? language : "text",
      );
      toast.success(t("messages.snippet_created", { idType: selectedIdType }), {
        position: "bottom-right",
      });
      navigate("/" + data.id);
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

      return axiosError.response?.data?.error || t("messages.snippet_failed");
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
        await new Promise((resolve) => setTimeout(resolve, 2000 - elapsedTime));
      }

      if (result.language && result.language !== "text") {
        setContentType("code");
        setLanguage(result.language);
        toast.success(
          t("home.detected_language", { language: result.language }),
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

  const handleDynamicIdClick = () => {
    setIsDialogOpen(true);
    setDialogError("");
  };

  const handleDialogSubmit = async () => {
    if (customId.trim()) {
      setDialogError("");
      const result = await handleSubmit("dynamic", customId.trim());
      if (result === true) {
        setIsDialogOpen(false);
        setCustomId("");
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
      <div className="h-fit flex flex-col md:flex-row gap-4 border-slate-200 justify-end items-center my-4 mx-5">
        <div className="w-full md:w-auto">
          <Select
            value={expiresTime.includes("-") ? "custom" : expiresTime}
            onValueChange={(val) => {
              if (val === "custom") {
                setIsCustomExpiryDialogOpen(true);
              } else {
                setExpiresTime(val);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue
                className=""
                placeholder={t("home.select_expire_time")}
              />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value="one-time">
                  {t("home.expire_options.one_time_snippet")}
                </SelectItem>
                <SelectItem value="1h">
                  {t("home.expire_options.expire_in_1_hour")}
                </SelectItem>
                <SelectItem value="1d">
                  {t("home.expire_options.expire_in_1_day")}
                </SelectItem>
                <SelectItem value="1w">
                  {t("home.expire_options.expire_in_1_week")}
                </SelectItem>
                <SelectItem value="1m">
                  {t("home.expire_options.expire_in_1_month")}
                </SelectItem>
                <SelectItem value="1y">
                  {t("home.expire_options.expire_in_1_year")}
                </SelectItem>
                <SelectItem value="custom">
                  {expiresTime.includes("-")
                    ? new Date(expiresTime).toLocaleString([], {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : t("home.expire_options.custom")}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Tabs
          value={contentType}
          onValueChange={(val) =>
            setContentType(val as "text" | "code" | "link")
          }
          className="w-full md:w-auto"
        >
          <TabsList className="h-10">
            <TabsTrigger
              value="text"
              className="flex items-center gap-2 px-6 text-sm font-semibold min-w-36"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t("home.tab_text")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="code"
              className="flex items-center gap-2 px-6 text-sm font-semibold min-w-36"
            >
              <Code2 className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t("home.tab_code")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="link"
              className="flex items-center gap-2 px-6 text-sm font-semibold min-w-36"
            >
              <Link className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t("home.tab_link")}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {(isDetecting || contentType === "code") &&
          (isDetecting ? (
            <button
              type="button"
              className="group relative w-[160px] h-10 shrink-0 rounded-md p-[1px] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {/* animated border */}
              <div className="absolute inset-[-200%] opacity-70 transition-opacity duration-300 group-hover:opacity-100 moving-border-gradient animate-moving-border" />

              {/* button body */}
              <div
                className="relative z-10 flex h-full w-full items-center justify-center gap-2 rounded-[5px] 
                                          bg-background dark:bg-slate-900 
                                                            text-sm font-medium text-foreground/80
                                                                              shadow-sm transition-all duration-200
                                                                                                group-hover:text-foreground
                                                                                                                  group-hover:shadow-md
                                                                                                                                    group-active:scale-[0.98]
                                                                                                                                                      select-none"
              >
                <span className="whitespace-nowrap">
                  {t("home.auto_detecting")}
                </span>

                <img
                  src={aiGif}
                  alt="AI Detecting"
                  className="w-5 h-5 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </button>
          ) : (
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[240px] h-10 bg-muted/20 hover:bg-muted/40 border-border/50 transition-all duration-200 shadow-sm">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="javascript">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="javascript"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>JavaScript</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="typescript">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="typescript"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>TypeScript</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="html">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="html"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>HTML</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="css">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="css"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>CSS</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="json">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="json"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>JSON</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="java">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="java"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>Java</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="python">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="python"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>Python</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="c">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon language="c" className="h-4 w-4 shrink-0" />
                      <span>C</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="cpp">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="cpp"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>C++</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="csharp">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="csharp"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>C#</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="go">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="go"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>Go</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="rust">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="rust"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>Rust</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="markdown">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="markdown"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>Markdown</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="shell">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="shell"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>Shell/Bash</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="other">
                    <span className="inline-flex items-center gap-2">
                      <LanguageIcon
                        language="other"
                        className="h-4 w-4 shrink-0"
                      />
                      <span>Other</span>
                    </span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          ))}

        <ButtonGroup>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFontSize((prev: number) => Math.max(prev - 1, 8))}
            className="h-10 w-10 md:h-9 md:w-9"
            title="Zoom Out"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center px-4 md:px-3 border-y bg-muted/30 text-xs font-medium min-w-[44px] select-none">
            {fontSize}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setFontSize((prev: number) => Math.min(prev + 1, 48))
            }
            className="h-10 w-10 md:h-9 md:w-9"
            title="Zoom In"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </ButtonGroup>

        <div className="w-full h-fit flex justify-end px-0 md:px-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={!textValue.length}
                className="flex items-center gap-2 px-5"
              >
                {t("home.paste_button")}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={async () => {
                  const result = await handleSubmit("system");
                  if (result !== true) {
                    toast.error(result);
                  }
                }}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="h-4 w-4 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {t("home.paste_system_id")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("home.paste_system_id_desc")}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDynamicIdClick}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {t("home.paste_dynamic_id")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("home.paste_dynamic_id_desc")}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Hash className="h-5 w-5" />
              </div>
              <DialogTitle>{t("home.dynamic_id_dialog.title")}</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("home.dynamic_id_dialog.description")}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder={t("home.dynamic_id_dialog.placeholder")}
                value={customId}
                className="h-11 focus-visible:ring-primary/50"
                onChange={(e) => setCustomId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDialogSubmit()}
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

            {dialogError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-start gap-2"
              >
                <div className="mt-0.5">⚠️</div>
                <p>{dialogError}</p>
              </motion.div>
            )}
          </div>

          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              {t("home.dynamic_id_dialog.cancel")}
            </Button>
            <Button
              onClick={handleDialogSubmit}
              disabled={!customId.trim()}
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
              <DialogTitle>{t("home.expire_options.custom")}</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose a specific date and time for this snippet to expire.
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
                  setExpiresTime(customExpiryDate.toISOString());
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
        className="m-5 h-[70vh] border rounded-md overflow-hidden touch-none"
      >
        {contentType === "code" ? (
          <Editor
            height="100%"
            language={language}
            value={textValue}
            onChange={(value) => setTextValue(value || "")}
            theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
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
          <div className="h-full w-full flex flex-col items-center justify-center p-10 bg-muted/5">
            <div className="w-full max-w-2xl space-y-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Link className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {t("home.tab_link")}
                </h2>
                <p className="text-muted-foreground">{t("home.link_desc")}</p>
              </div>
              <Input
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={t("home.link_placeholder")}
                className="h-14 text-lg px-6 rounded-xl border-primary/20 focus-visible:ring-primary/30 shadow-sm"
              />
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  ✅ {t("home.link_features.fast")}
                </span>
                <span className="flex items-center gap-1">
                  ✅ {t("home.link_features.custom")}
                </span>
                <span className="flex items-center gap-1">
                  ✅ {t("home.link_features.analytics")}
                </span>
              </div>
            </div>
          </div>
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
