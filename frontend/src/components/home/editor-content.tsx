import { Editor, type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RefObject } from "react";

interface EditorContentProps {
	contentType: "text" | "code" | "link";
	language: string;
	textValue: string;
	setTextValue: (val: string) => void;
	theme: string;
	fontSize: number;
	editorContainerRef: (node: HTMLElement | null) => void;
	userInputRef: RefObject<HTMLTextAreaElement | null>;
	handleEditorWillMount: BeforeMount;
	handleEditorMount: OnMount;
	handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
}

export const EditorContent = ({
	contentType,
	language,
	textValue,
	setTextValue,
	theme,
	fontSize,
	editorContainerRef,
	userInputRef,
	handleEditorWillMount,
	handleEditorMount,
	handlePaste,
}: EditorContentProps) => {
	const { t } = useTranslation();

	return (
		<div
			ref={editorContainerRef}
			className="m-3 sm:m-5 h-[70vh] border rounded-md overflow-hidden touch-none"
		>
			{contentType === "code" ? (
				<Editor
					height="100%"
					language={language}
					value={textValue}
					onChange={(value) => setTextValue(value || "")}
					theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
					beforeMount={handleEditorWillMount}
					onMount={handleEditorMount}
					options={{
						minimap: { enabled: false },
						fontSize: fontSize,
						padding: { top: 16 },
						mouseWheelZoom: true,
						wordWrap: "on",
					}}
				/>
			) : contentType === "link" ? (
				<div className="h-full w-full bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center">
					<div className="w-full max-w-2xl space-y-6 relative z-10 px-4">
						<div className="flex flex-col items-center gap-2 text-center">
							<div className="p-4 rounded-full bg-primary/10 text-primary backdrop-blur-sm border border-primary/20">
								<Link className="h-8 w-8" />
							</div>
							<h2 className="text-2xl font-bold tracking-tight">
								{t("home.tab_link")}
							</h2>
							<p className="text-muted-foreground">
								{t("home.link_desc")}
							</p>
						</div>
						<Input
							value={textValue}
							onChange={(e) => setTextValue(e.target.value)}
							placeholder={t("home.link_placeholder")}
							className="h-14 text-lg px-6 rounded-xl border-border/50 focus-visible:ring-primary/30 shadow-lg bg-background/50 backdrop-blur-md"
						/>
						<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground font-medium">
							<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
								✅ {t("home.link_features.fast")}
							</span>
							<span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
								✅ {t("home.link_features.custom")}
							</span>
						</div>
					</div>
				</div>
			) : (
				<Textarea
					ref={userInputRef}
					value={textValue}
					onChange={(e) => setTextValue(e.target.value)}
					placeholder={t("home.enter_snippet_placeholder")}
					className="h-full w-full mx-auto resize-none border-0 focus-visible:ring-0"
					onPaste={handlePaste}
					style={{ fontSize: `${fontSize}px` }}
				/>
			)}
		</div>
	);
};
