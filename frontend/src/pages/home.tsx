import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDownIcon, Sparkles, Hash } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { IdType } from "@/types";

const HomePage = () => {
  const userInputRef = useRef<HTMLTextAreaElement>(null);
  const [expiresTime, setExpiresTime] = useState("");
  const [textValue, setTextValue] = useState("");
  const [redirectUrl, setRedirectUrl] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customId, setCustomId] = useState("");
  const [dialogError, setDialogError] = useState("");
  const navigate = useNavigate();
  const apiHelpers = useApiHelpers();
  const { t } = useTranslation();

  const handleSubmit = async (selectedIdType: IdType, providedId?: string) => {
    try {
      const data = await apiHelpers.submitPaste(
        userInputRef,
        expiresTime,
        selectedIdType,
        providedId,
        redirectUrl,
      );
      toast.success(`Snippet pasted with ${selectedIdType} ID!`, {
        position: "bottom-right",
      });
      navigate("/" + data.id);
      saveToLocal(data);
      return true;
    } catch (error) {
      return (
        (error as AxiosError<{ error: string }>).response?.data?.error ||
        "Failed to create snippet"
      );
    }
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

  return (
    <div className="h-fit max-h-screen">
      <div className="h-fit flex flex-col md:flex-row gap-4 border-slate-200 justify-end items-center my-4 mx-5">
        <div className="w-full md:w-auto">
          <Select onValueChange={setExpiresTime}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue
                className=""
                placeholder={t("home.select_expire_time")}
              />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
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
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="redirectUrl"
            checked={redirectUrl}
            onCheckedChange={(checked) => setRedirectUrl(checked as boolean)}
          />
          <label
            htmlFor="redirectUrl"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Redirect URL
          </label>
        </div>

        <div className="w-full h-fit flex justify-end px-0 md:px-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={!textValue.length}
                className="flex items-center gap-2"
              >
                {t("home.paste_button")}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
                      Choose your own ID
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSubmit("system")}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="h-4 w-4 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {t("home.paste_system_id")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Auto-generate ID
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Custom ID</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter your custom ID..."
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDialogSubmit()}
            />
            {dialogError && (
              <p className="text-sm text-red-500 mt-2">{dialogError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDialogSubmit} disabled={!customId.trim()}>
              Create Snippet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="m-5 h-[70vh]">
        <Textarea
          ref={userInputRef}
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder={t("home.enter_snippet_placeholder")}
          className="h-full w-full mx-auto"
        />
      </div>
    </div>
  );
};

export default HomePage;
