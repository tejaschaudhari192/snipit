import { timeAgo } from "@/lib/utils";
import type { PasteData } from "@/types";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FileText, Trash2, Clock, Inbox, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const HistoryPage = () => {
  const { t } = useTranslation();
  const stored = localStorage.getItem("items");
  const [items, setItems] = useState<Array<PasteData>>(
    stored ? JSON.parse(stored) : [],
  );

  const handleClearHistory = () => {
    toast("Clear all history?", {
      position: "top-center",
      action: {
        label: "Clear",
        onClick: () => {
          localStorage.removeItem("items");
          setItems([]);
          toast.success("History cleared");
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  return (
    <div className="h-[90%] bg-muted/30 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t("history.title")}</h1>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t("history.clear_history")}
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <Inbox className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              {t("history.no_history_title")}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t("history.no_history_desc")}
            </p>
            <Link to="/">
              <Button>{t("history.create_first")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Link
                key={item.id}
                to={"/" + item.id}
                className="block bg-card rounded-lg border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {item.language && item.language !== "text" ? (
                      <>
                        <Code2 className="h-4 w-4" />
                        <span>
                          {t("history.code_snippet")} ({item.language})
                        </span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        <span>{t("history.plain_text_snippet")}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {t("history.created_ago")} {timeAgo(item.createdAt)}
                  </div>
                </div>
                <div className="text-foreground/80 text-sm">
                  <p className="whitespace-pre-wrap break-words line-clamp-3 font-mono">
                    {item.content}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
