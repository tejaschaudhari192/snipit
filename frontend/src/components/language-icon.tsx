import React from "react";
import { FileJson, FileType, FileCode, FileText, Terminal } from "lucide-react";

import jsIcon from "@/assets/icons/code/javascript-original.svg";
import tsIcon from "@/assets/icons/code/typescript-plain.svg";
import pythonIcon from "@/assets/icons/code/python-original.svg";
import htmlIcon from "@/assets/icons/code/html5-plain.svg";
import cssIcon from "@/assets/icons/code/css3-plain.svg";
import rustIcon from "@/assets/icons/code/rust-original.svg";
import goIcon from "@/assets/icons/code/go-original.svg";
import javaIcon from "@/assets/icons/code/java-plain.svg";
import jsonIcon from "@/assets/icons/code/json-original.svg";
import cIcon from "@/assets/icons/code/c-original.svg";
import cppIcon from "@/assets/icons/code/cplusplus-original.svg";
import csharpIcon from "@/assets/icons/code/csharp-plain.svg";
import bashIcon from "@/assets/icons/code/bash-original.svg";
import markdownIcon from "@/assets/icons/code/markdown-original.svg";

interface LanguageIconProps {
  language: string;
  className?: string;
}

export const LanguageIcon: React.FC<LanguageIconProps> = ({
  language,
  className,
}) => {
  const lang = language.toLowerCase();

  const iconMap: Record<string, string> = {
    javascript: jsIcon,
    js: jsIcon,
    typescript: tsIcon,
    ts: tsIcon,
    python: pythonIcon,
    py: pythonIcon,
    html: htmlIcon,
    css: cssIcon,
    rust: rustIcon,
    go: goIcon,
    java: javaIcon,
    json: jsonIcon,
    c: cIcon,
    cpp: cppIcon,
    csharp: csharpIcon,
    markdown: markdownIcon,
    md: markdownIcon,
    bash: bashIcon,
    shell: bashIcon,
    sh: bashIcon,
  };

  const assetIcon = iconMap[lang];

  if (assetIcon) {
    return <img src={assetIcon} alt={language} className={className} />;
  }

  switch (lang) {
    case "json":
      return <FileJson className={className} />;
    case "markdown":
    case "md":
      return <FileType className={className} />;
    case "shell":
    case "bash":
    case "sh":
      return <Terminal className={className} />;
    case "text":
      return <FileText className={className} />;
    default:
      return <FileCode className={className} />;
  }
};
