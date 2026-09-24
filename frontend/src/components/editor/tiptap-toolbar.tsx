import { useEditor } from "novel";
import { Maximize2, Minimize2, Search } from "lucide-react";
import { cn } from "cn";
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
	FontSizeDropdown,
	AlignmentDropdown,
	LineHeightDropdown,
} from "./toolbar/dropdowns";
import { LinkDialog } from "./dialogs/link-dialog";
import { LatexDialog } from "./dialogs/latex-dialog";

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
	const [latexDialogOpen, setLatexDialogOpen] = useState(false);

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
			const chain = editor.chain().focus();
			if (
				typeof (
					chain as unknown as {
						setImage?: (opt: { src: string }) => {
							run: () => boolean;
						};
					}
				).setImage === "function"
			) {
				(
					chain as unknown as {
						setImage: (opt: { src: string }) => {
							run: () => boolean;
						};
					}
				)
					.setImage({ src: url })
					.run();
			} else {
				editor
					.chain()
					.focus()
					.insertContent({
						type: "image",
						attrs: { src: url },
					})
					.run();
			}
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

	const handleSaveLink = (url: string) => {
		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
		} else {
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.setLink({ href: url })
				.run();
		}
	};

	const handleSaveLatex = (formula: string) => {
		if (formula.trim()) {
			editor.chain().focus().setLatex({ latex: formula.trim() }).run();
		}
	};

	return (
		<TooltipProvider delay={400}>
			<div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-border/40 bg-muted/20 select-none w-full">
				<HistoryControls editor={editor} />
				<div className="divider-v" />

				<HeadingDropdown editor={editor} />
				<FontDropdown editor={editor} />
				<FontSizeDropdown editor={editor} />
				<div className="divider-v" />

				<FormattingControls editor={editor} />
				<div className="divider-v" />

				<ListControls editor={editor} />
				<BlockControls editor={editor} />
				<div className="divider-v" />

				<AlignmentDropdown editor={editor} />
				<LineHeightDropdown editor={editor} />
				<IndentControls editor={editor} />

				<TableSelector
					editor={editor}
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
				<div className="divider-v" />

				<MediaControls
					editor={editor}
					onOpenLinkDialog={() => setLinkDialogOpen(true)}
					onOpenLatexDialog={() => setLatexDialogOpen(true)}
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
				<div className="divider-v" />

				<ColorControls editor={editor} />

				{/* Emoji Picker Popover */}
				<EmojiPicker editor={editor} />

				<div className="divider-v" />

				{/* Find & Replace */}
				<TooltipButton
					onClick={onToggleFindReplace}
					className="icon-btn"
					title="Find & Replace"
					shortcut="Ctrl H"
				>
					<Search className="h-4 w-4" />
				</TooltipButton>

				{/* Zen / Focus Mode */}
				<TooltipButton
					onClick={onToggleZenMode}
					className={cn(
						"icon-btn",
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

				<LinkDialog
					isOpen={linkDialogOpen}
					onClose={() => setLinkDialogOpen(false)}
					initialUrl={editor.getAttributes("link").href || ""}
					onSave={handleSaveLink}
				/>

				<LatexDialog
					isOpen={latexDialogOpen}
					onClose={() => setLatexDialogOpen(false)}
					onSave={handleSaveLatex}
				/>
			</div>
		</TooltipProvider>
	);
}
