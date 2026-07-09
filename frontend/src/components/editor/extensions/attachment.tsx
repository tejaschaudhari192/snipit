import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { FileText, Download, Trash2 } from "lucide-react";
import { cn } from "@/utils";

const AttachmentNodeView = (props: NodeViewProps) => {
	const { node, deleteNode, selected } = props;
	const { href, filename, filesize } = node.attrs;

	return (
		<NodeViewWrapper className="my-3 select-none no-drag">
			<div
				className={cn(
					"flex items-center justify-between p-3 rounded-lg border bg-background/50 backdrop-blur-sm shadow-sm transition-all hover:bg-accent/10 max-w-md",
					selected
						? "border-primary ring-2 ring-primary/20"
						: "border-border/60",
				)}
			>
				<div className="flex items-center gap-3 min-w-0">
					<div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
						<FileText className="w-5 h-5" />
					</div>
					<div className="min-w-0 flex flex-col">
						<span
							className="text-xs font-semibold text-foreground truncate max-w-50"
							title={filename}
						>
							{filename || "Attachment"}
						</span>
						{filesize && (
							<span className="text-[10px] text-muted-foreground">
								{filesize}
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center gap-1.5 shrink-0">
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						download
						className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
						title="Download Attachment"
					>
						<Download className="w-4 h-4" />
					</a>
					<button
						onClick={() => deleteNode()}
						className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
						title="Delete Attachment"
					>
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			</div>
		</NodeViewWrapper>
	);
};

export const Attachment = Node.create({
	name: "attachment",
	group: "block",
	draggable: true,

	addAttributes() {
		return {
			href: {
				default: null,
			},
			filename: {
				default: null,
			},
			filesize: {
				default: null,
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-type="attachment"]',
				getAttrs: (element) => {
					if (typeof element === "string") return {};
					return {
						href: element.getAttribute("data-href"),
						filename: element.getAttribute("data-filename"),
						filesize: element.getAttribute("data-filesize"),
					};
				},
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(HTMLAttributes, {
				"data-type": "attachment",
				"data-href": HTMLAttributes.href,
				"data-filename": HTMLAttributes.filename,
				"data-filesize": HTMLAttributes.filesize,
			}),
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(AttachmentNodeView);
	},
});
