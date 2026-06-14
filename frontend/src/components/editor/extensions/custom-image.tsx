import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import {
	AlignLeft,
	AlignCenter,
	AlignRight,
	Trash2,
	WrapText,
	FileText,
} from "lucide-react";
import { cn } from "@/utils";

const ImageNodeView = (props: NodeViewProps) => {
	const { node, updateAttributes, deleteNode, selected } = props;
	const { src, alt, title, width, align, layout } = node.attrs;

	const [resizing, setResizing] = useState(false);
	const [initialWidth, setInitialWidth] = useState(0);
	const [initialMouseX, setInitialMouseX] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const imgRef = useRef<HTMLImageElement>(null);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setResizing(true);
		if (imgRef.current) {
			setInitialWidth(imgRef.current.clientWidth);
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
				if (newWidth < 100) newWidth = 100;
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

	let alignClass = "mx-auto";
	if (align === "left") alignClass = "mr-auto ml-0";
	if (align === "right") alignClass = "ml-auto mr-0";

	let layoutStyle: React.CSSProperties = {};
	if (layout === "wrap") {
		layoutStyle = {
			float: align === "right" ? "right" : "left",
			margin: "0.5rem",
		};
	}

	return (
		<NodeViewWrapper
			ref={containerRef}
			className={cn(
				"relative my-4 transition-all group flex flex-col select-none",
				alignClass,
			)}
			style={{
				width: width || "100%",
				maxWidth: "100%",
				...layoutStyle,
			}}
		>
			<div className="relative w-full">
				<img
					ref={imgRef}
					src={src}
					alt={alt}
					title={title}
					className={cn(
						"w-full h-auto object-contain transition-all rounded-md border-2",
						selected
							? "border-primary/80 ring-2 ring-primary/30"
							: "border-transparent",
					)}
				/>

				{selected && (
					<>
						{/* Corner Drag Handles */}
						<div
							onMouseDown={handleMouseDown}
							className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-foreground border border-background shadow cursor-nwse-resize rounded-none z-10"
						/>
						<div
							onMouseDown={handleMouseDown}
							className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-foreground border border-background shadow cursor-nesw-resize rounded-none z-10"
						/>
						<div
							onMouseDown={handleMouseDown}
							className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-foreground border border-background shadow cursor-nesw-resize rounded-none z-10"
						/>
						<div
							onMouseDown={handleMouseDown}
							className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-foreground border border-background shadow cursor-nwse-resize rounded-none z-10"
						/>

						{/* Bubble Menu/Toolbar */}
						<div className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-background border border-border/80 shadow-xl rounded-xl p-1.5 flex items-center gap-1 z-30 select-none">
							<button
								onClick={() =>
									updateAttributes({ layout: "wrap" })
								}
								className={cn(
									"p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
									layout === "wrap" &&
										"bg-accent text-primary",
								)}
								title="Wrap Text"
							>
								<WrapText className="w-4 h-4" />
							</button>
							<button
								onClick={() =>
									updateAttributes({ layout: "break-text" })
								}
								className={cn(
									"p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
									layout === "break-text" &&
										"bg-accent text-primary",
								)}
								title="Break Text"
							>
								<FileText className="w-4 h-4" />
							</button>

							<div className="w-[1px] h-4 bg-border mx-1" />

							<button
								onClick={() =>
									updateAttributes({ width: "30%" })
								}
								className={cn(
									"px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
									width === "30%" && "bg-accent text-primary",
								)}
							>
								S
							</button>
							<button
								onClick={() =>
									updateAttributes({ width: "50%" })
								}
								className={cn(
									"px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
									width === "50%" && "bg-accent text-primary",
								)}
							>
								M
							</button>
							<button
								onClick={() =>
									updateAttributes({ width: "100%" })
								}
								className={cn(
									"px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
									width === "100%" &&
										"bg-accent text-primary",
								)}
							>
								L
							</button>

							<div className="w-[1px] h-4 bg-border mx-1" />

							<button
								onClick={() =>
									updateAttributes({ align: "left" })
								}
								className={cn(
									"p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
									align === "left" &&
										"bg-accent text-primary",
								)}
								title="Align Left"
							>
								<AlignLeft className="w-4 h-4" />
							</button>
							<button
								onClick={() =>
									updateAttributes({ align: "center" })
								}
								className={cn(
									"p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
									align === "center" &&
										"bg-accent text-primary",
								)}
								title="Align Center"
							>
								<AlignCenter className="w-4 h-4" />
							</button>
							<button
								onClick={() =>
									updateAttributes({ align: "right" })
								}
								className={cn(
									"p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
									align === "right" &&
										"bg-accent text-primary",
								)}
								title="Align Right"
							>
								<AlignRight className="w-4 h-4" />
							</button>

							<div className="w-[1px] h-4 bg-border mx-1" />

							<button
								onClick={() => deleteNode()}
								className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
								title="Delete Image"
							>
								<Trash2 className="w-4 h-4" />
							</button>
						</div>
					</>
				)}
			</div>
		</NodeViewWrapper>
	);
};

export const CustomImage = Node.create({
	name: "image",
	group: "block",
	draggable: true,

	addAttributes() {
		return {
			src: {
				default: null,
			},
			alt: {
				default: null,
			},
			title: {
				default: null,
			},
			width: {
				default: "100%",
			},
			align: {
				default: "center",
			},
			layout: {
				default: "break-text",
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "img[src]",
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["img", mergeAttributes(HTMLAttributes)];
	},

	addNodeView() {
		return ReactNodeViewRenderer(ImageNodeView);
	},
});
