import { Button } from "@/components/ui/button";
import { Editor, type BeforeMount } from "@monaco-editor/react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useApiHelpers } from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Error from "@/components/error";
import { toast } from "sonner";
import Loader from "@/components/loader";
import type { PasteData } from "@/types";
import { getTimeRemaining, saveToLocal } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Code2, Edit, Trash2, Save, X, Clock, Minus, Plus } from "lucide-react";
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

import { useTheme } from "@/hooks/use-theme";
import { defineMonacoThemes } from "@/lib/monaco";
import { LanguageIcon } from "@/components/language-icon";
import { usePinchZoom } from "@/hooks/use-pinch-zoom";

const DisplayPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiHelpers = useApiHelpers();
  const { t } = useTranslation();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [paste, setPaste] = useState<PasteData>();
  const [updatedContent, setUpdatedContent] = useState<string>();
  const [redirectUrl, setRedirectUrl] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("text");
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const { theme } = useTheme();
  const { fontSize, ref: contentRef, setFontSize } = usePinchZoom(14);

  const handleEditorWillMount: BeforeMount = (monaco) => {
    defineMonacoThemes(monaco);
  };

  useEffect(() => {
    async function loadData() {
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
        setRedirectUrl(data.redirectUrl || false);
        setLanguage(data.language || "text");
        saveToLocal(data);
      } else {
        setPaste(undefined);
      }
      setLoading(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageDetection = async (content: string) => {
    setIsDetecting(true);
    const startTime = Date.now();
    try {
      const result = await apiHelpers.detectLanguage(content);

      // Wait for at least 2 seconds to make the animation feel natural
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 2000) {
        await new Promise((resolve) => setTimeout(resolve, 2000 - elapsedTime));
      }

      if (result.language) {
        setLanguage(result.language);
        toast.success(`Detected language: ${result.language}`);
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
      redirectUrl === paste?.redirectUrl
    ) {
      setIsEdit(false);
      return;
    }

    const data = await apiHelpers.updatePaste(
      id!,
      updatedContent!,
      redirectUrl,
      language,
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
    <div className="h-[90%]">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      ) : paste?.content ? (
        <>
          <div className="flex justify-between items-center px-6 py-3 border-b">
            <div className="flex gap-2">
              {!isEdit ? (
                <>
                  <CopyButton
                    variant="outline"
                    content={paste.content}
                    className="gap-2 w-auto px-3 h-8 rounded-md text-sm font-medium"
                  >
                    {t("display.copy_button")}
                  </CopyButton>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEdit(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {t("display.edit_button")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("display.delete_button")}
                  </Button>
                  <ButtonGroup className="ml-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setFontSize((prev: number) => Math.max(prev - 1, 8))
                      }
                      className="h-8 w-8"
                      title="Zoom Out"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center px-3 border-y bg-muted/30 text-xs font-medium min-w-[40px] select-none">
                      {fontSize}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setFontSize((prev: number) => Math.min(prev + 1, 48))
                      }
                      className="h-8 w-8"
                      title="Zoom In"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </ButtonGroup>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleEditSave}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {t("display.save_button")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEdit(false);

                      setUpdatedContent(paste?.content);
                      setRedirectUrl(paste?.redirectUrl || false);
                      setLanguage(paste?.language || "text");
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <ButtonGroup className="ml-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setFontSize((prev: number) => Math.max(prev - 1, 8))
                      }
                      className="h-8 w-8"
                      title="Zoom Out"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center px-3 border-y bg-muted/30 text-xs font-medium min-w-[40px] select-none">
                      {fontSize}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setFontSize((prev: number) => Math.min(prev + 1, 48))
                      }
                      className="h-8 w-8"
                      title="Zoom In"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </ButtonGroup>
                </>
              )}
              {paste.language && (
                <div className="flex items-center gap-2 px-3 h-8 rounded-md bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground whitespace-nowrap">
                  <LanguageIcon
                    language={paste.language}
                    className="h-3.5 w-3.5"
                  />
                  <span className="capitalize">
                    {paste.language === "text" ? "Plain Text" : paste.language}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {t("display.expires_in")} {getTimeRemaining(paste.expiresAt)}
            </div>
          </div>
          <div className="mx-5 my-4 h-[75vh]">
            {isEdit ? (
              <div className="h-full flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="editRedirectUrl"
                    checked={redirectUrl}
                    onCheckedChange={(checked) =>
                      setRedirectUrl(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="editRedirectUrl"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Redirect URL
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  {isDetecting ? (
                    <div className="relative p-[1px] overflow-hidden rounded-md w-[160px] h-10 shrink-0">
                      <div className="absolute inset-[-200%] moving-border-gradient animate-moving-border opacity-80" />
                      <div className="relative z-10 w-full h-full px-3 flex items-center gap-2 bg-background dark:bg-slate-900 rounded-[5px] text-sm text-foreground/80 select-none">
                        <span className="whitespace-nowrap">
                          {t("home.auto_detecting")}
                        </span>
                        <img
                          src={aiGif}
                          alt="AI Detecting"
                          className="w-5 h-5 shrink-0"
                        />
                      </div>
                    </div>
                  ) : (
                    <Select value={language} onValueChange={setLanguage}>
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
                              <span>Plain Text</span>
                            </span>
                          </SelectItem>
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
                              <LanguageIcon
                                language="c"
                                className="h-4 w-4 shrink-0"
                              />
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
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => handleLanguageDetection(updatedContent!)}
                    disabled={isDetecting || !updatedContent}
                    title="Auto detect language"
                  >
                    <Code2 className="h-4 w-4" />
                  </Button>
                </div>

                <div
                  ref={contentRef}
                  className="flex-1 border rounded-md overflow-hidden touch-none"
                >
                  {language && language !== "text" ? (
                    <Editor
                      height="100%"
                      language={language}
                      value={updatedContent}
                      onChange={(value) => setUpdatedContent(value || "")}
                      theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
                      beforeMount={handleEditorWillMount}
                      options={{
                        minimap: { enabled: false },
                        fontSize: fontSize,
                        padding: { top: 16 },
                        mouseWheelZoom: true,
                        wordWrap: "on",
                      }}
                    />
                  ) : (
                    <Textarea
                      className="h-full w-full resize-none border-0 focus-visible:ring-0 font-mono"
                      value={updatedContent}
                      onChange={(e) => setUpdatedContent(e.target.value)}
                      style={{ fontSize: `${fontSize}px` }}
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
                  theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
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
