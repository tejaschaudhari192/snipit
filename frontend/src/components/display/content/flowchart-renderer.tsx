import { useMemo, useState } from "react";
import { ArrowDown, Check, Copy, Code2, Eye } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FlowNode {
	id: string;
	label: string;
	level: number;
	children: FlowNode[];
	type?: "start" | "decision" | "step" | "end";
	choice?: string;
}

interface FlowchartRendererProps {
	content: string;
}

export const FlowchartRenderer = ({ content }: FlowchartRendererProps) => {
	const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
	const [isCopied, setIsCopied] = useState(false);

	const nodes = useMemo(() => {
		const lines = content.split("\n").filter((l) => l.trim() !== "");
		const result: FlowNode[] = [];
		const stack: FlowNode[] = [];

		lines.forEach((line) => {
			const indent = line.search(/\S/);
			const cleanLine = line.trim();

			let id = "";
			let label = "";
			let choice = "";

			if (cleanLine.startsWith("->")) {
				const parts = cleanLine.replace("->", "").trim().split(":");
				if (parts.length > 1) {
					choice = parts[0].trim();
					label = parts[1].trim();
					id = label.toLowerCase().replace(/\s+/g, "_");
				} else {
					label = parts[0].trim();
					id = label.toLowerCase().replace(/\s+/g, "_");
				}
			} else {
				label = cleanLine;
				id = label.toLowerCase().replace(/\s+/g, "_");
			}

			const node: FlowNode = {
				id,
				label,
				level: indent,
				children: [],
				choice,
			};

			if (node.id === "start") node.type = "start";
			else if (node.id === "end") node.type = "end";
			else if (node.label.endsWith("?")) node.type = "decision";
			else node.type = "step";

			if (indent === 0) {
				result.push(node);
				stack[0] = node;
			} else {
				let parentIdx = stack.length - 1;
				while (parentIdx >= 0 && stack[parentIdx].level >= indent) {
					parentIdx--;
				}
				if (parentIdx >= 0) {
					stack[parentIdx].children.push(node);
					stack[parentIdx + 1] = node;
				}
			}
		});

		return result;
	}, [content]);

	const handleCopy = () => {
		navigator.clipboard.writeText(content);
		setIsCopied(true);
		toast.success("Copied");
		setTimeout(() => setIsCopied(false), 2000);
	};

	const renderNode = (node: FlowNode, index: number) => {
		const isDecision = node.type === "decision";
		const isStart = node.type === "start";
		const isEnd = node.type === "end";

		return (
			<div
				key={`${node.id}-${index}`}
				className="flex flex-col items-center"
			>
				<div
					className={cn(
						"relative flex flex-col items-center p-3 min-w-35 rounded-lg border border-border bg-card shadow-sm transition-all",
						isStart &&
							"border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
						isEnd &&
							"border-rose-500/50 text-rose-600 dark:text-rose-400",
						isDecision &&
							"border-amber-500/50 text-amber-600 dark:text-amber-400 rounded-2xl",
					)}
				>
					{node.choice && (
						<div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-background border border-border rounded text-[9px] font-bold text-muted-foreground uppercase">
							{node.choice}
						</div>
					)}

					<div className="flex items-center gap-2">
						<span className="font-semibold text-sm">
							{node.label}
						</span>
					</div>
				</div>

				{node.children.length > 0 && (
					<div className="flex flex-col items-center w-full">
						<div className="h-8 w-px bg-border flex items-center justify-center">
							<ArrowDown className="w-3 h-3 text-border translate-y-2" />
						</div>
						<div
							className={cn(
								"flex gap-8 pt-4 relative",
								node.children.length > 1 &&
									"before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-[calc(100%-2rem)] before:h-px before:bg-border",
							)}
						>
							{node.children.map((child, i) =>
								renderNode(child, i),
							)}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="flowchart-container w-full border border-border rounded-xl my-6 overflow-hidden bg-background">
			<div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
				<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
					Flowchart
				</span>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"h-7 px-2 text-[10px] font-bold",
							viewMode === "visual" && "bg-muted",
						)}
						onClick={() => setViewMode("visual")}
					>
						<Eye className="w-3 h-3 mr-2" />
						Visual
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							"h-7 px-2 text-[10px] font-bold",
							viewMode === "code" && "bg-muted",
						)}
						onClick={() => setViewMode("code")}
					>
						<Code2 className="w-3 h-3 mr-2" />
						Code
					</Button>
					<div className="w-px h-3 bg-border mx-1" />
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={handleCopy}
					>
						{isCopied ? (
							<Check className="w-3 h-3 text-emerald-500" />
						) : (
							<Copy className="w-3 h-3" />
						)}
					</Button>
				</div>
			</div>

			<div className="p-8 overflow-x-auto">
				{viewMode === "visual" ? (
					<div className="flex justify-center min-w-max">
						{nodes.map((node, i) => renderNode(node, i))}
					</div>
				) : (
					<pre className="p-4 text-xs font-mono text-muted-foreground bg-muted/10 overflow-auto">
						{content}
					</pre>
				)}
			</div>
		</div>
	);
};
