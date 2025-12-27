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
import { getTimeRemaining } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Code2, Edit, Trash2, Save, X, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import AiGeneratingIcon from "@/assets/ai-gen-icon";

import { useTheme } from "@/hooks/use-theme";
import { defineMonacoThemes } from "@/lib/monaco";

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
    try {
      const result = await apiHelpers.detectLanguage(content);

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
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {t("display.expires_in")} {getTimeRemaining(paste.expiresAt)}
            </div>
          </div>
          <div className="w-screen h-[75vh] px-6 py-4 overflow-x-hidden">
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
                    <div className="w-[160px] h-10 px-3 flex items-center gap-2 bg-muted/20 border border-border/50 rounded-md text-sm text-muted-foreground">
                      <span>Auto Detecting...</span>
                      <AiGeneratingIcon />
                    </div>
                  ) : (
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[160px] h-10 bg-muted/20 hover:bg-muted/40 border-border/50 transition-all duration-200 shadow-sm">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="text">Plain Text</SelectItem>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="c">C</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="csharp">C#</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                          <SelectItem value="rust">Rust</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
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

                {language && language !== "text" ? (
                  <div className="flex-1 border rounded-md overflow-hidden">
                    <Editor
                      height="100%"
                      language={language}
                      value={updatedContent}
                      onChange={(value) => setUpdatedContent(value || "")}
                      theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
                      beforeMount={handleEditorWillMount}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                        mouseWheelZoom: false,
                      }}
                    />
                  </div>
                ) : (
                  <Textarea
                    className="flex-1 font-mono"
                    value={updatedContent}
                    onChange={(e) => setUpdatedContent(e.target.value)}
                  />
                )}
              </div>
            ) : paste.language && paste.language !== "text" ? (
              <div className="h-full border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  language={paste.language}
                  value={paste.content}
                  theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
                  beforeMount={handleEditorWillMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                    readOnly: true,
                    domReadOnly: true,
                    mouseWheelZoom: false,
                  }}
                />
              </div>
            ) : (
              <Card className="h-full overflow-y-auto">
                <CardContent className="h-fit whitespace-pre-wrap">
                  {paste.content}
                </CardContent>
              </Card>
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
