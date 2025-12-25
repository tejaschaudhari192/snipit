import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Menu } from "lucide-react";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import ThemeTogglePositionsDemo from "@/components/theme-toggle";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  const path = useLocation().pathname;
  const id = path.includes("history") || path.includes("about") ? null : path;
  const [url, setUrl] = useState(window.location.href);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(
    localStorage.getItem("lang") || "en",
  );

  useEffect(() => {
    setUrl(window.location.href);
  }, [location]);

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("lang", language);
  }, [language, i18n]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <header
      className={cn(
        "flex justify-between h-fit p-4 px-6 border shadow bg-background",
        className,
      )}
    >
      <div className="flex items-center h-fit gap-6 w-fit">
        <Link
          to={"/"}
          className="text-3xl font-bold tracking-tight bg-clip-text transform transition-transform duration-300 ease-in-out group-hover:scale-105"
        >
          Snipit
        </Link>
        {id && id.length > 1 && (
          <span className="flex items-center h-fit gap-2">
            <p>{url}</p>
            <CopyButton
              onCopy={handleCopy}
              content="Medium size"
              size="default"
              variant="outline"
            />
          </span>
        )}
      </div>
      <div className="hidden md:flex gap-2">
        <Link to={"/about"}>
          <Button variant={"ghost"}>{t("header.about")}</Button>
        </Link>
        <Link to={"/history"}>
          <Button variant={"ghost"}>{t("header.history")}</Button>
        </Link>
        <Select onValueChange={setLanguage} value={language}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="mr">मराठी</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {path.length > 1 && (
          <Link to={"/"}>
            <Button variant={"outline"}>{t("header.newnippet")}</Button>
          </Link>
        )}
        <ThemeTogglePositionsDemo />
      </div>

      <div className="md:hidden flex items-center gap-2">
        <Select onValueChange={setLanguage} value={language}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Lang" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="mr">मराठी</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
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
                <Link to="/">{t("header.newnippet")}</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
