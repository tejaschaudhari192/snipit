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
import { Menu } from "lucide-react";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
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

  const [url, setUrl] = useState(window.location.href);

  useEffect(() => {
    setUrl(window.location.href);
  }, [path]);

  return (
    <header
      className={cn(
        "flex justify-between h-fit p-4 px-6 border shadow bg-background",
        className,
      )}
    >
      <div className="flex items-center h-fit gap-6 w-fit">
        <Link to={"/"} className="flex items-center gap-2 group">
          <img
            src={icon}
            alt="Snipit Logo"
            className="h-8 w-auto transform transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          <p className="text-3xl font-bold bg-clip-text transform transition-transform duration-300 ease-in-out group-hover:scale-105">
            Snipit
          </p>
        </Link>
        {id && id.length > 1 && (
          <span className="flex items-center h-fit gap-2">
            <p className="text-sm text-muted-foreground">{url}</p>
            <CopyButton
              content={url}
              size="default"
              variant="outline"
              className="h-8 w-8"
            />
          </span>
        )}
      </div>
      <div className="hidden md:flex gap-2">
        <Link to={"/about"}>
          <Button variant={path === "/about" ? "secondary" : "ghost"}>
            {t("header.about")}
          </Button>
        </Link>
        <Link to={"/history"}>
          <Button variant={path === "/history" ? "secondary" : "ghost"}>
            {t("header.history")}
          </Button>
        </Link>
        <LanguageSwitcher className="w-[180px]" />
        {path.length > 1 && (
          <Link to={"/"}>
            <Button variant={"outline"}>{t("header.new_snippet")}</Button>
          </Link>
        )}
        <ThemeTogglePositionsDemo />
      </div>

      <div className="md:hidden flex items-center gap-2">
        <LanguageSwitcher className="w-[100px]" />
        <ThemeTogglePositionsDemo />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/about">{t("header.about")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/history">{t("header.history")}</Link>
            </DropdownMenuItem>
            {path.length > 1 && (
              <DropdownMenuItem asChild>
                <Link to="/">{t("header.new_snippet")}</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
