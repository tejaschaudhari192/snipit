import { Button } from "@/components/ui/button";
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
import { Edit, Trash2, Save, X, Clock } from "lucide-react";

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
      } else {
        setPaste(undefined);
      }
      setLoading(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <Textarea
                  className="flex-1 font-mono"
                  value={updatedContent}
                  onChange={(e) => setUpdatedContent(e.target.value)}
                />
              </div>
            ) : (
              <Card className="h-full overflow-y-auto">
                <CardContent className="h-fit">{paste.content}</CardContent>
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
