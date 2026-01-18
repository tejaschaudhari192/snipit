import { Editor, type BeforeMount } from "@monaco-editor/react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { PasteData } from "@/types";

interface DisplayContentProps {
	isEdit: boolean;
	contentType: "text" | "code" | "link";
	language: string;
	content: string;
	onContentChange: (val: string) => void;
	theme: string;
	fontSize: number;
	contentRef: (node: HTMLElement | null) => void;
	handleEditorWillMount: BeforeMount;
	paste: PasteData;
}

export const DisplayContent = ({
	isEdit,
	contentType,
	language,
	content,
	onContentChange,
	theme,
	fontSize,
	contentRef,
	handleEditorWillMount,
	paste,
}: DisplayContentProps) => {
	const { t } = useTranslation();

	if (isEdit) {
		return (
			<div
				ref={contentRef}
				className="h-[70vh] border rounded-md overflow-hidden touch-none"
			>
				{contentType === "code" ? (
					<Editor
						height="100%"
						language={language}
						value={content}
						onChange={(value) => onContentChange(value || "")}
						theme={
							theme === "dark" ? "snipit-dark" : "snipit-light"
						}
						beforeMount={handleEditorWillMount}
						options={{
							minimap: { enabled: false },
							fontSize: fontSize,
							padding: { top: 16 },
							mouseWheelZoom: true,
							wordWrap: "on",
						}}
					/>
				) : contentType === "link" ? (
					<div className="h-full w-full bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center rounded-md">
						<div className="w-full max-w-2xl space-y-6 relative z-10 px-4">
							<div className="flex flex-col items-center gap-2 text-center">
								<div className="p-4 rounded-full bg-primary/10 text-primary backdrop-blur-sm border border-primary/20">
									<Link className="h-8 w-8" />
								</div>
							</div>
							<Input
								value={content}
								onChange={(e) =>
									onContentChange(e.target.value)
								}
								placeholder={t("home.link_placeholder")}
								className="h-14 text-lg px-6 rounded-xl border-border/50 focus-visible:ring-primary/30 shadow-lg bg-background/50 backdrop-blur-md"
							/>
						</div>
					</div>
				) : (
					<Textarea
						className="h-full w-full resize-none border-0 focus-visible:ring-0 font-mono"
						value={content}
						onChange={(e) => onContentChange(e.target.value)}
						style={{ fontSize: `${fontSize}px` }}
					/>
				)}
			</div>
		);
	}

	return (
		<div
			ref={contentRef}
			className="h-[70vh] border rounded-md overflow-hidden touch-none"
		>
			{paste.language && paste.language !== "text" ? (
				<Editor
					height="100%"
					language={paste.language}
					value={paste.content}
					theme={theme === "dark" ? "snipit-dark" : "snipit-light"}
					beforeMount={handleEditorWillMount}
					options={{
						minimap: { enabled: false },
						fontSize: fontSize,
						padding: { top: 16 },
						readOnly: true,
						domReadOnly: true,
						mouseWheelZoom: true,
						wordWrap: "on",
					}}
				/>
			) : (
				<Card className="h-full overflow-y-auto border-0 rounded-none">
					<CardContent
						className="h-fit whitespace-pre-wrap py-4"
						style={{ fontSize: `${fontSize}px` }}
					>
						{paste.content}
					</CardContent>
				</Card>
			)}
		</div>
	);
};
