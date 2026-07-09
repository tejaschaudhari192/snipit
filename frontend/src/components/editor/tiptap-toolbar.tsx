import { useEditor } from "novel";
import { Maximize2, Minimize2, Search } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils";
import { Editor } from "@tiptap/core";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { MediaDialog } from "./media-dialog";
import { GifPopover } from "./gif-popover";
import { TableSelector } from "./table-selector";
import { EmojiPicker } from "./emoji-picker";

import { TooltipButton } from "./toolbar/tooltip-button";
import { HistoryControls } from "./toolbar/history-controls";
import { FormattingControls } from "./toolbar/formatting-controls";
import { ListControls } from "./toolbar/list-controls";
import { BlockControls } from "./toolbar/block-controls";
import { IndentControls } from "./toolbar/indent-controls";
import { MediaControls } from "./toolbar/media-controls";
import { ColorControls } from "./toolbar/color-controls";
import {
	HeadingDropdown,
	FontDropdown,
	AlignmentDropdown,
	LineHeightDropdown,
} from "./toolbar/dropdowns";

export function TiptapToolbar({
	editor: propEditor,
	isZenMode = false,
	onToggleZenMode,
	onToggleFindReplace,
}: {
	editor?: Editor | null;
	isZenMode?: boolean;
	onToggleZenMode?: () => void;
	onToggleFindReplace?: () => void;
}) {
	const { editor: contextEditor } = useEditor();
	const editor = propEditor || contextEditor;

	const [mediaModal, setMediaModal] = useState<{
		isOpen: boolean;
		type: "image" | "video" | "attachment";
	}>({
		isOpen: false,
		type: "image",
	});

	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [linkInputUrl, setLinkInputUrl] = useState("");

	const [latexDialogOpen, setLatexDialogOpen] = useState(false);
	const [latexInputFormula, setLatexInputFormula] = useState("");

	useEffect(() => {
		const handleOpenMedia = (e: Event) => {
			const customEvent = e as CustomEvent<{
				type: "image" | "video" | "attachment";
			}>;
			setMediaModal({
				isOpen: true,
				type: customEvent.detail.type,
			});
		};
		window.addEventListener("open-media-modal", handleOpenMedia);
		return () => {
			window.removeEventListener("open-media-modal", handleOpenMedia);
		};
	}, []);

	if (!editor) return null;

	const addImage = () => {
		setMediaModal({ isOpen: true, type: "image" });
	};

	const addVideo = () => {
		setMediaModal({ isOpen: true, type: "video" });
	};

	const handleMediaInsert = (
		url: string,
		filename?: string,
		filesize?: string,
	) => {
		if (mediaModal.type === "image") {
			editor.chain().focus().setImage({ src: url }).run();
		} else if (mediaModal.type === "video") {
			if (url.includes("youtube.com") || url.includes("youtu.be")) {
				editor.chain().focus().setYoutubeVideo({ src: url }).run();
			} else {
				editor
					.chain()
					.focus()
					.insertContent(
						`<video src="${url}" controls class="rounded-lg border border-border shadow-sm max-w-full my-4"></video>`,
					)
					.run();
			}
		} else if (mediaModal.type === "attachment") {
			editor
				.chain()
				.focus()
				.insertContent({
					type: "attachment",
					attrs: {
						href: url,
						filename: filename || "attachment",
						filesize: filesize || "",
					},
				})
				.run();
		}
	};

	const handleOpenLinkDialog = () => {
		const previousUrl = editor.getAttributes("link").href || "";
		setLinkInputUrl(previousUrl);
		setLinkDialogOpen(true);
	};

	const handleSaveLink = () => {
		if (linkInputUrl === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.setLink({ href: linkInputUrl })
				.run();
		}
		setLinkDialogOpen(false);
	};

	const handleOpenLatexDialog = () => {
		setLatexInputFormula("");
		setLatexDialogOpen(true);
	};

	const handleSaveLatex = () => {
		if (latexInputFormula.trim()) {
			editor
				.chain()
				.focus()
				.setLatex({ latex: latexInputFormula.trim() })
				.run();
		}
		setLatexDialogOpen(false);
	};

	return (
		<TooltipProvider delayDuration={400}>
			<div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-border/40 bg-muted/20 select-none w-full">
				<HistoryControls editor={editor} />
				<div className="w-px h-5 bg-border/40 mx-1 self-center" />

				<HeadingDropdown editor={editor} />
				<FontDropdown editor={editor} />
				<div className="w-px h-5 bg-border/40 mx-1 self-center" />

				<FormattingControls editor={editor} />
				<div className="w-px h-5 bg-border/40 mx-1 self-center" />

				<ListControls editor={editor} />
				<BlockControls editor={editor} />
				<div className="w-px h-5 bg-border/40 mx-1 self-center" />

				<AlignmentDropdown editor={editor} />
				<LineHeightDropdown editor={editor} />
				<IndentControls editor={editor} />

				<TableSelector
					onSelect={(r, c) =>
						editor
							.chain()
							.focus()
							.insertTable({
								rows: r,
								cols: c,
								withHeaderRow: true,
							})
							.run()
					}
				/>
				<div className="w-px h-5 bg-border/40 mx-1 self-center" />

				<MediaControls
					editor={editor}
					onOpenLinkDialog={handleOpenLinkDialog}
					onOpenLatexDialog={handleOpenLatexDialog}
					onAddImage={addImage}
					onAddVideo={addVideo}
					onAddAttachment={() =>
						setMediaModal({ isOpen: true, type: "attachment" })
					}
				/>

				<GifPopover
					onSelect={(url) =>
						editor.chain().focus().setImage({ src: url }).run()
					}
				/>
				<div className="w-px h-5 bg-border/40 mx-1 self-center" />

				<ColorControls editor={editor} />

				{/* Emoji Picker Popover */}
				<EmojiPicker editor={editor} />

				<div className="w-px h-5 bg-border/40 mx-1 self-center" />

				{/* Find & Replace */}
				<TooltipButton
					onClick={onToggleFindReplace}
					className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer"
					title="Find & Replace"
					shortcut="Ctrl H"
				>
					<Search className="h-4 w-4" />
				</TooltipButton>

				{/* Zen / Focus Mode */}
				<TooltipButton
					onClick={onToggleZenMode}
					className={cn(
						"h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors border border-transparent text-foreground cursor-pointer",
						isZenMode &&
							"bg-accent border-border/40 text-accent-foreground shadow-sm",
					)}
					title={isZenMode ? "Exit Zen Mode" : "Zen Mode"}
					shortcut="Esc"
				>
					{isZenMode ? (
						<Minimize2 className="h-4 w-4" />
					) : (
						<Maximize2 className="h-4 w-4" />
					)}
				</TooltipButton>

				<MediaDialog
					isOpen={mediaModal.isOpen}
					onClose={() =>
						setMediaModal((prev) => ({ ...prev, isOpen: false }))
					}
					type={mediaModal.type}
					onInsert={handleMediaInsert}
				/>

				{/* Link Modal */}
				<Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
					<DialogContent className="sm:max-w-md border border-border/50 bg-background shadow-2xl rounded-2xl p-6 flex flex-col gap-4">
						<DialogHeader>
							<DialogTitle className="text-base font-semibold text-foreground">
								Insert Link
							</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-2">
							<label className="text-xs text-muted-foreground font-medium">
								Link URL
							</label>
							<input
								type="text"
								placeholder="https://example.com"
								value={linkInputUrl}
								onChange={(e) =>
									setLinkInputUrl(e.target.value)
								}
								className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSaveLink();
								}}
								autoFocus
							/>
						</div>
						<div className="flex justify-end gap-2 mt-2">
							<button
								onClick={() => setLinkDialogOpen(false)}
								className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveLink}
								className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
							>
								Save Link
							</button>
						</div>
					</DialogContent>
				</Dialog>

				{/* LaTeX Modal */}
				<Dialog
					open={latexDialogOpen}
					onOpenChange={setLatexDialogOpen}
				>
					<DialogContent className="sm:max-w-md border border-border/50 bg-background shadow-2xl rounded-2xl p-6 flex flex-col gap-4">
						<DialogHeader>
							<DialogTitle className="text-base font-semibold text-foreground">
								Insert LaTeX Formula
							</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-2">
							<label className="text-xs text-muted-foreground font-medium">
								LaTeX Code
							</label>
							<input
								type="text"
								placeholder="e.g. E=mc^2"
								value={latexInputFormula}
								onChange={(e) =>
									setLatexInputFormula(e.target.value)
								}
								className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSaveLatex();
								}}
								autoFocus
							/>
						</div>
						<div className="flex justify-end gap-2 mt-2">
							<button
								onClick={() => setLatexDialogOpen(false)}
								className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveLatex}
								className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
							>
								Insert Formula
							</button>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</TooltipProvider>
	);
}
