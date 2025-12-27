import type { Monaco } from "@monaco-editor/react";

export const defineMonacoThemes = (monaco: Monaco) => {
  monaco.editor.defineTheme("snipit-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#1a1a1a",
      "editor.foreground": "#fafafa",
      "editor.lineHighlightBackground": "#2a2a2a",
      "editorCursor.foreground": "#fafafa",
      "editorIndentGuide.background": "#404040",
      "editorIndentGuide.activeBackground": "#707070",
    },
  });

  monaco.editor.defineTheme("snipit-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#000000",
      "editor.lineHighlightBackground": "#f0f0f0",
      "editorCursor.foreground": "#000000",
      "editorIndentGuide.background": "#d3d3d3",
      "editorIndentGuide.activeBackground": "#939393",
    },
  });
};
