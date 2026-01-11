import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, QrCode } from "lucide-react";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import ThemeTogglePositionsDemo from "@/components/theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import icon from "@/assets/brand/icon.png";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  const location = useLocation();
  const path = location.pathname;
  const id = path.includes("history") || path.includes("about") ? null : path;
  const { t } = useTranslation();
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);

  const [url, setUrl] = useState(window.location.href);

  useEffect(() => {
    setUrl(window.location.href);
  }, [path]);

  return (
    <header
      className={cn(
        "flex justify-between items-center h-[64px] p-3 px-4 md:px-8 border shadow-sm bg-background/80 backdrop-blur-md sticky top-0 z-50",
        className,
      )}
    >
      <div className="flex items-center h-full gap-4 md:gap-8 min-w-0">
        <Link to={"/"} className="flex items-center gap-2.5 group shrink-0">
          <img
            src={icon}
            alt="Snipit Logo"
            className="h-8 w-auto transform transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          <p className="text-xl md:text-2xl font-black tracking-tight bg-clip-text transform transition-transform duration-300 ease-in-out group-hover:scale-105">
            Snipit
          </p>
        </Link>
        {id && id.length > 1 && (
          <div className="hidden md:flex items-center h-8 gap-2 min-w-0 px-3 rounded-full bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground truncate max-w-[200px] lg:max-w-[400px]">
              {url}
            </p>
            <div className="w-px h-3 bg-border mx-1" />
            <CopyButton
              content={url}
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-transparent"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 hover:bg-transparent"
              onClick={() => setIsQRDialogOpen(true)}
            >
              <QrCode className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center gap-3">
        <nav className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg mr-2">
          <Link to={"/about"}>
            <Button
              variant={path === "/about" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs font-semibold"
            >
              {t("header.about")}
            </Button>
          </Link>
          <Link to={"/history"}>
            <Button
              variant={path === "/history" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 text-xs font-semibold"
            >
              {t("header.history")}
            </Button>
          </Link>
        </nav>

        <LanguageSwitcher className="w-[140px] h-9" />

        {path.length > 1 && (
          <Link to={"/"}>
            <Button
              variant={"outline"}
              size="sm"
              className="h-9 font-bold px-4"
            >
              {t("header.new_snippet")}
            </Button>
          </Link>
        )}

        <div className="w-px h-4 bg-border mx-1" />
        <ThemeTogglePositionsDemo />
      </div>

      <div className="md:hidden flex items-center gap-2">
        {id && id.length > 1 && (
          <CopyButton
            content={url}
            size="default"
            variant="outline"
            className="h-9 w-9 shrink-0 px-0"
          />
        )}
        {id && id.length > 1 && (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => setIsQRDialogOpen(true)}
          >
            <QrCode className="h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px] p-2">
            <DropdownMenuItem asChild className="rounded-md">
              <Link to="/about" className="flex items-center gap-2 py-2">
                <span>{t("header.about")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-md">
              <Link to="/history" className="flex items-center gap-2 py-2">
                <span>{t("header.history")}</span>
              </Link>
            </DropdownMenuItem>
            {path.length > 1 && (
              <DropdownMenuItem asChild className="rounded-md">
                <Link to="/" className="flex items-center gap-2 py-2">
                  <span>{t("header.new_snippet")}</span>
                </Link>
              </DropdownMenuItem>
            )}
            <div className="h-px bg-muted my-2" />
            <div className="px-2 py-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Theme
                </span>
                <ThemeTogglePositionsDemo />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Language
                </span>
                <LanguageSwitcher className="w-full h-9" />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <QrCode className="h-5 w-5" />
              </div>
              <DialogTitle>{t("header.qr_button")}</DialogTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Scan this code to open the snippet on another device.
            </p>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-inner my-4">
            <QRCodeSVG value={url} size={200} level="H" includeMargin={true} />
          </div>
          <div className="text-center text-xs text-muted-foreground break-all px-4">
            {url}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
