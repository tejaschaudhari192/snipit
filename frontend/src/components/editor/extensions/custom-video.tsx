import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

const VideoNodeView = (props: NodeViewProps) => {
	const { node, updateAttributes, deleteNode, selected } = props;
	const { src, width, align } = node.attrs;

	const [resizing, setResizing] = useState(false);
	const [initialWidth, setInitialWidth] = useState(0);
	const [initialMouseX, setInitialMouseX] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setResizing(true);
		if (videoRef.current) {
			setInitialWidth(videoRef.current.clientWidth);
		}
		setInitialMouseX(e.clientX);
	};

	useEffect(() => {
		if (!resizing) return;

		const handleMouseMove = (e: MouseEvent) => {
			const dx = e.clientX - initialMouseX;
			let newWidth = initialWidth + dx * 2;

			if (containerRef.current) {
				const parentWidth =
					containerRef.current.parentElement?.clientWidth || 800;
				if (newWidth < 200) newWidth = 200;
				if (newWidth > parentWidth) newWidth = parentWidth;
				updateAttributes({ width: `${newWidth}px` });
			}
		};

		const handleMouseUp = () => {
			setResizing(false);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [resizing, initialWidth, initialMouseX, updateAttributes]);

	const alignmentClasses = {
		left: "mr-auto",
		center: "mx-auto",
		right: "ml-auto",
	};

	return (
		<NodeViewWrapper
			className={cn(
				"relative my-4 group flex flex-col clear-both select-none",
				alignmentClasses[align as keyof typeof alignmentClasses] ||
					"mx-auto",
			)}
			style={{
				width: width || "100%",
				maxWidth: "100%",
			}}
		>
			<div
				ref={containerRef}
				className={cn(
					"relative inline-block overflow-hidden rounded-lg border bg-muted/20 transition-all",
					selected
						? "border-primary ring-2 ring-primary/20 shadow-md"
						: "border-border/60 hover:border-border",
				)}
			>
				<video
					ref={videoRef}
					src={src}
					controls
					playsInline
					preload="metadata"
					className="w-full h-auto block rounded-lg"
				/>

				{/* Floating Toolbar on Selection */}
				<div
					className={cn(
						"absolute top-2 right-2 bg-background/90 backdrop-blur-md border border-border/80 shadow-md rounded-lg p-1 flex items-center gap-1 transition-opacity z-20",
						selected
							? "opacity-100 pointer-events-auto"
							: "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
					)}
				>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => updateAttributes({ align: "left" })}
						className={cn(
							"h-7 w-7 rounded-md",
							align === "left" &&
								"bg-accent text-accent-foreground",
						)}
						title="Align Left"
					>
						<AlignLeft className="w-3.5 h-3.5" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => updateAttributes({ align: "center" })}
						className={cn(
							"h-7 w-7 rounded-md",
							align === "center" &&
								"bg-accent text-accent-foreground",
						)}
						title="Align Center"
					>
						<AlignCenter className="w-3.5 h-3.5" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => updateAttributes({ align: "right" })}
						className={cn(
							"h-7 w-7 rounded-md",
							align === "right" &&
								"bg-accent text-accent-foreground",
						)}
						title="Align Right"
					>
						<AlignRight className="w-3.5 h-3.5" />
					</Button>

					<div className="w-px h-4 bg-border/60 mx-0.5" />

					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => deleteNode()}
						className="h-7 w-7 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
						title="Delete Video"
					>
						<Trash2 className="w-3.5 h-3.5" />
					</Button>
				</div>

				{/* Resize Handle */}
				<div
					onMouseDown={handleMouseDown}
					className="absolute bottom-2 right-2 w-4 h-4 rounded-br cursor-se-resize bg-foreground/20 hover:bg-foreground/50 transition-colors z-20"
					title="Drag to resize"
				/>
			</div>
		</NodeViewWrapper>
	);
};

export const CustomVideo = Node.create({
	name: "video",
	group: "block",
	selectable: true,
	draggable: true,
	atom: true,

	addAttributes() {
		return {
			src: {
				default: null,
				parseHTML: (element) => element.getAttribute("src"),
				renderHTML: (attributes) => ({
					src: attributes.src,
				}),
			},
			controls: {
				default: true,
				parseHTML: (element) => element.hasAttribute("controls"),
				renderHTML: () => ({
					controls: "true",
				}),
			},
			width: {
				default: "100%",
				parseHTML: (element) =>
					element.style.width || element.getAttribute("width"),
				renderHTML: (attributes) => {
					if (!attributes.width) return {};
					return {
						style: `width: ${attributes.width}`,
					};
				},
			},
			align: {
				default: "center",
				parseHTML: (element) =>
					element.getAttribute("data-align") || "center",
				renderHTML: (attributes) => ({
					"data-align": attributes.align,
				}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "video[src]",
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"video",
			mergeAttributes(HTMLAttributes, {
				controls: "true",
				class: "rounded-lg border border-border shadow-sm max-w-full my-4",
			}),
		];
	},

	addCommands() {
		return {
			setVideo:
				(options: { src: string; width?: string; align?: string }) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: options,
					});
				},
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(VideoNodeView);
	},
});

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		customVideo: {
			setVideo: (options: {
				src: string;
				width?: string;
				align?: string;
			}) => ReturnType;
		};
	}
}
