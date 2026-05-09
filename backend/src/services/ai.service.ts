import Groq from "groq-sdk";
import configurations from "@/config/configurations.js";
import { VALID_LANGUAGES } from "@/config/constants.js";
import { PROMPTS } from "@/config/prompts.js";
import logger from "@/config/logger.js";
import * as dagreModule from "dagre";
import { z } from "zod";

// Type definitions for the Compact DSL
interface CompactElement {
	id?: string | undefined;
	type:
		| "start"
		| "end"
		| "process"
		| "decision"
		| "io"
		| "data"
		| "edge"
		| "annotation";
	text?: string | undefined;
	category?: string | undefined;
	from?: string | undefined;
	to?: string | undefined;
	label?: string | undefined;
}

interface CompactDrawing {
	title?: string | undefined;
	direction?: "TB" | "LR" | undefined;
	elements: CompactElement[];
}

// Robust dagre access
const dagre: any = (dagreModule as any).default || dagreModule;

const CompactElementSchema = z.object({
	id: z.string().optional(),
	type: z.enum([
		"start",
		"end",
		"process",
		"decision",
		"io",
		"data",
		"edge",
		"annotation",
	]),
	text: z.string().optional(),
	category: z.string().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
	label: z.string().optional(),
});

const CompactDrawingSchema = z.object({
	title: z.string().optional(),
	direction: z.enum(["TB", "LR"]).optional(),
	elements: z.array(CompactElementSchema),
});

const GROQ_MODELS = [
	configurations.groq_model!, // User's preference
	"llama-3.3-70b-versatile",
	"llama-3.1-8b-instant",
	"qwen/qwen3-32b",
];

class AiService {
	private groq: Groq;

	constructor() {
		this.groq = new Groq({ apiKey: configurations.groq_api_key });
	}

	async verify(): Promise<boolean> {
		try {
			const models = await this.groq.models.list();
			return models.data.some((m) => m.id === configurations.groq_model);
		} catch (error) {
			return false;
		}
	}

	async detectLanguage(content: string): Promise<string> {
		const prompt = PROMPTS.DETECT_LANGUAGE([...VALID_LANGUAGES], content);

		try {
			const chatCompletion = await this.groq.chat.completions.create({
				messages: [{ role: "user", content: prompt }],
				model: configurations.groq_model!,
				temperature: 0.1,
				max_tokens: 10,
			});

			let language =
				chatCompletion.choices[0]?.message?.content
					?.trim()
					.toLowerCase() || "text";
			language = language.replace(/```/g, "").trim();
			return VALID_LANGUAGES.includes(language as any)
				? language
				: "text";
		} catch (error) {
			logger.error("Error detecting language:", error);
			return "text";
		}
	}

	async enhanceContent(
		content: string,
		instruction: string,
	): Promise<string> {
		const systemPrompt = PROMPTS.ENHANCE_CONTENT.SYSTEM;
		const userPrompt = PROMPTS.ENHANCE_CONTENT.USER(instruction, content);

		const chatCompletion = await this.groq.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: userPrompt },
			],
			model: configurations.groq_model!,
			temperature: 0,
		});

		return chatCompletion.choices[0]?.message?.content?.trim() || "";
	}

	async autocomplete(
		language: string,
		prefix: string,
		suffix: string,
	): Promise<string> {
		const isText = language === "text";
		const systemPrompt = isText
			? PROMPTS.AUTOCOMPLETE.TEXT.SYSTEM
			: PROMPTS.AUTOCOMPLETE.CODE.SYSTEM;

		const chatCompletion = await this.groq.chat.completions.create({
			messages: [
				{ role: "system", content: systemPrompt },
				{
					role: "user",
					content: PROMPTS.AUTOCOMPLETE.USER(
						language,
						prefix,
						suffix,
					),
				},
			],
			model: "llama-3.1-8b-instant",
			temperature: 0,
			max_tokens: isText ? 64 : 128,
			stop: isText ? ["\n", "\n\n"] : ["\n\n", "```"],
		});

		return chatCompletion.choices[0]?.message?.content?.trim() || "";
	}

	async generateDrawContent(description: string): Promise<string> {
		let lastError;

		for (const model of GROQ_MODELS) {
			try {
				logger.info(
					`Attempting diagram generation with model: ${model}`,
				);
				const chatCompletion = await this.groq.chat.completions.create({
					messages: [
						{ role: "system", content: PROMPTS.DRAW.SYSTEM },
						{
							role: "user",
							content: PROMPTS.DRAW.USER(description),
						},
					],
					model,
					temperature: 0,
					max_tokens: 5000,
				});

				const rawContent =
					chatCompletion.choices[0]?.message?.content?.trim() || "[]";
				const cleanedContent = this.cleanAiJson(rawContent);
				const parsed = this.parseAndValidateDrawing(cleanedContent);

				if (!parsed) {
					throw new Error(
						`AI model ${model} returned invalid or unparseable schema.`,
					);
				}

				const elements = this.layoutWithDagre(parsed);
				return JSON.stringify(elements);
			} catch (error: any) {
				lastError = error;
				if (
					error?.status === 429 ||
					error?.status === 413 ||
					error?.message?.includes("rate_limit")
				) {
					logger.warn(
						`Model ${model} rate limited or overloaded. Waiting 1s and trying next...`,
					);
					await new Promise((resolve) => setTimeout(resolve, 1000));
					continue;
				}
				logger.error(`Model ${model} failed:`, error);
				break;
			}
		}

		logger.error("All models failed or rate limited.", lastError);
		return "[]";
	}

	private cleanAiJson(content: string): string {
		if (content.includes("```")) {
			return content
				.replace(/```mermaid\n?/, "")
				.replace(/```json\n?/, "")
				.replace(/```/g, "")
				.trim();
		}
		return content.trim();
	}

	private parseAndValidateDrawing(content: string): CompactDrawing | null {
		try {
			let parsed = JSON.parse(content);

			// Normalize formats (handle both [...] and { elements: [...] })
			if (Array.isArray(parsed)) {
				parsed = { elements: parsed };
			} else if (parsed && !Array.isArray(parsed) && parsed.elements) {
				parsed = { elements: parsed.elements };
			}

			const result = CompactDrawingSchema.safeParse(parsed);
			return result.success ? result.data : null;
		} catch {
			return null;
		}
	}

	private layoutWithDagre(drawing: CompactDrawing): any[] {
		const g = new dagre.graphlib.Graph();
		g.setGraph({
			rankdir: drawing.direction || "TB",
			marginx: 100,
			marginy: 100,
			nodesep: 100,
			ranksep: 140,
			align: "DL",
		});
		g.setDefaultEdgeLabel(() => ({}));

		const now = Date.now();
		let nodeCounter = 0;

		// 1. Add Nodes
		drawing.elements.forEach((el: CompactElement) => {
			if (el.type === "edge" || el.type === "annotation") return;
			const id = el.id || `node_${++nodeCounter}`;
			el.id = id;

			const { width, height } = this.getNodeDimensions(el);
			g.setNode(id, { width, height, data: el });
		});

		// 2. Add Edges
		drawing.elements.forEach((el: CompactElement, index: number) => {
			if (el.type === "edge" && el.from && el.to) {
				if (g.node(el.from) && g.node(el.to)) {
					g.setEdge(el.from, el.to, {
						label: el.label,
						id: `edge_${index}`,
					});
				}
			}
		});

		dagre.layout(g);

		// 3. Map to Excalidraw
		const excalidrawElements: any[] = [];
		let processColorIndex = 0;

		// Optional: Add Title
		if (drawing.title) {
			excalidrawElements.push(
				this.createTextElement(
					`title_${now}`,
					"",
					drawing.title,
					g.graph().width / 2 - 150,
					20,
					300,
					50,
					"#1e1e1e",
					now,
					36, // Larger font
				),
			);
		}

		g.nodes().forEach((id: string) => {
			const node = g.node(id);
			if (!node?.data) return;

			const el: CompactElement = node.data;
			const x = node.x - node.width / 2;
			const y = node.y - node.height / 2;

			const { strokeColor, backgroundColor, fillStyle, strokeStyle } =
				this.getWhiteboardStyles(el, processColorIndex);
			if (el.type === "process" && !el.category) processColorIndex++;

			const textId = `text_${id}`;

			excalidrawElements.push({
				id,
				type: this.mapElementToExcalidrawType(el.type),
				x,
				y,
				width: node.width,
				height: node.height,
				strokeColor,
				backgroundColor,
				fillStyle,
				strokeWidth: 2,
				strokeStyle,
				roughness: 1.5,
				opacity: 100,
				roundness: { type: 3, value: 16 },
				seed: Math.floor(Math.random() * 100000),
				version: now,
				versionNonce: Math.floor(Math.random() * 100000),
				updated: now,
				isDeleted: false,
				locked: false,
				boundElements: el.text ? [{ id: textId, type: "text" }] : [],
			});

			if (el.text) {
				excalidrawElements.push(
					this.createTextElement(
						textId,
						id,
						el.text,
						x,
						y,
						node.width,
						node.height,
						strokeColor,
						now,
					),
				);
			}
		});

		g.edges().forEach((e: any) => {
			const edge = g.edge(e);
			const fromNode = g.node(e.v);
			const toNode = g.node(e.w);
			if (edge && fromNode && toNode) {
				excalidrawElements.push(
					this.createArrowElement(edge, e, fromNode, toNode, now),
				);
				if (edge.label) {
					excalidrawElements.push(
						this.createEdgeLabelElement(
							edge,
							fromNode,
							toNode,
							now,
						),
					);
				}
			}
		});

		// Add annotations
		drawing.elements.forEach((el: CompactElement) => {
			if (el.type === "annotation" && el.from && g.node(el.from)) {
				const targetNode = g.node(el.from);
				excalidrawElements.push(
					this.createAnnotationElement(el, targetNode, now),
				);
			}
		});

		return excalidrawElements;
	}

	private getNodeDimensions(el: CompactElement): {
		width: number;
		height: number;
	} {
		const textLen = el.text ? el.text.length : 0;
		switch (el.type) {
			case "start":
			case "end":
				return { width: Math.max(160, textLen * 12 + 60), height: 60 };
			case "decision":
				return {
					width: Math.max(220, textLen * 14 + 100),
					height: 150,
				};
			case "io":
			case "data":
			case "process":
			default:
				return { width: Math.max(200, textLen * 13 + 80), height: 85 };
		}
	}

	private mapElementToExcalidrawType(type: string): string {
		switch (type) {
			case "start":
			case "end":
				return "ellipse";
			case "decision":
				return "diamond";
			case "process":
			case "io":
			case "data":
			default:
				return "rectangle";
		}
	}

	private getWhiteboardStyles(
		el: CompactElement,
		processColorIndex: number,
	): {
		strokeColor: string;
		backgroundColor: string;
		fillStyle: string;
		strokeStyle: string;
	} {
		const WHITEBOARD_PALETTE: Record<string, any> = {
			start: { bg: "#b2f2bb", stroke: "#2b8a3e" },
			end: { bg: "#ffc9c9", stroke: "#c92a2a" },
			decision: { bg: "#ffec99", stroke: "#e67700" },
			io: { bg: "#99e9f2", stroke: "#0c8599" },
			data: { bg: "#b2f2bb", stroke: "#2b8a3e" },
			process: [
				{ bg: "#a5d8ff", stroke: "#1971c2" },
				{ bg: "#d0bfff", stroke: "#7048e8" },
				{ bg: "#ffc9c9", stroke: "#e03131" },
				{ bg: "#ffd8a8", stroke: "#e8590c" },
				{ bg: "#99e9f2", stroke: "#0c8599" },
				{ bg: "#eebefa", stroke: "#9c36b5" },
				{ bg: "#b2f2bb", stroke: "#2b8a3e" },
				{ bg: "#ffec99", stroke: "#e67700" },
			],
			categories: {
				auth: { bg: "#a5d8ff", stroke: "#1971c2" },
				database: { bg: "#b2f2bb", stroke: "#2b8a3e" },
				error: { bg: "#ffc9c9", stroke: "#c92a2a" },
				success: { bg: "#b2f2bb", stroke: "#2b8a3e" },
				network: { bg: "#d0bfff", stroke: "#7048e8" },
				security: { bg: "#ffec99", stroke: "#e67700" },
				ui: { bg: "#eebefa", stroke: "#9c36b5" },
			},
		};

		let style = { bg: "transparent", stroke: "#1e1e1e" };
		let fillStyle = "hachure";
		let strokeStyle = "solid";

		if (el.type === "io" || el.type === "data") {
			fillStyle = "cross-hatch";
			strokeStyle = "dashed";
		}

		if (el.category && WHITEBOARD_PALETTE.categories[el.category]) {
			style = WHITEBOARD_PALETTE.categories[el.category];
		} else if (el.type === "process") {
			const processPalette = WHITEBOARD_PALETTE.process;
			style = processPalette[processColorIndex % processPalette.length];
		} else if (WHITEBOARD_PALETTE[el.type]) {
			style = WHITEBOARD_PALETTE[el.type];
		}

		return {
			strokeColor: style.stroke,
			backgroundColor: style.bg,
			fillStyle,
			strokeStyle,
		};
	}

	private createTextElement(
		id: string,
		containerId: string,
		text: string,
		x: number,
		y: number,
		w: number,
		h: number,
		strokeColor: string,
		now: number,
		fontSize = 18,
	) {
		return {
			id,
			type: "text",
			x: x + w / 2,
			y: y + h / 2,
			text,
			fontSize,
			fontFamily: 1, // Virgil (Handwritten)
			textAlign: "center",
			verticalAlign: "middle",
			containerId: containerId || undefined,
			strokeColor,
			backgroundColor: "transparent",
			fillStyle: "hachure",
			strokeWidth: 2,
			strokeStyle: "solid",
			roughness: 1,
			opacity: 100,
			seed: Math.floor(Math.random() * 100000),
			version: now,
			versionNonce: Math.floor(Math.random() * 100000),
			updated: now,
			isDeleted: false,
			locked: false,
			width: w,
			height: h,
		};
	}

	private createArrowElement(
		edge: any,
		e: any,
		fromNode: any,
		toNode: any,
		now: number,
	) {
		const startX = fromNode.x;
		const startY = fromNode.y + fromNode.height / 2;
		const endX = toNode.x;
		const endY = toNode.y - toNode.height / 2;

		return {
			id: edge.id || `arrow_${Math.random()}`,
			type: "arrow",
			x: startX,
			y: startY,
			width: Math.abs(endX - startX),
			height: Math.abs(endY - startY),
			strokeColor: "#495057",
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 2,
			strokeStyle: "solid",
			roughness: 1,
			opacity: 100,
			roundness: { type: 2 },
			seed: Math.floor(Math.random() * 100000),
			version: now,
			versionNonce: Math.floor(Math.random() * 100000),
			updated: now,
			isDeleted: false,
			locked: false,
			points: [
				[0, 0],
				[endX - startX, endY - startY],
			],
			elbowed: false,
			startBinding: { elementId: e.v, gap: 5, focus: 0 },
			endBinding: { elementId: e.w, gap: 5, focus: 0 },
			endArrowhead: "arrow",
		};
	}

	private createEdgeLabelElement(
		edge: any,
		fromNode: any,
		toNode: any,
		now: number,
	) {
		const startX = fromNode.x;
		const startY = fromNode.y + fromNode.height / 2;
		const endX = toNode.x;
		const endY = toNode.y - toNode.height / 2;

		const midX = (startX + endX) / 2;
		const midY = (startY + endY) / 2;

		return {
			id: `label_${edge.id}`,
			type: "text",
			x: midX - 20,
			y: midY - 12,
			text: edge.label,
			fontSize: 16,
			fontFamily: 1,
			textAlign: "center",
			strokeColor: "#1e1e1e",
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 1,
			strokeStyle: "solid",
			roughness: 1,
			opacity: 100,
			seed: Math.floor(Math.random() * 100000),
			version: now,
			versionNonce: Math.floor(Math.random() * 100000),
			updated: now,
			isDeleted: false,
			locked: false,
			width: 40,
			height: 24,
		};
	}

	private createAnnotationElement(
		el: CompactElement,
		targetNode: any,
		now: number,
	) {
		const x = targetNode.x + targetNode.width / 2 + 20;
		const y = targetNode.y - targetNode.height / 2 - 20;
		return {
			id: el.id || `annotation_${Math.random()}`,
			type: "text",
			x,
			y,
			text: el.text || "",
			fontSize: 16,
			fontFamily: 1,
			textAlign: "left",
			strokeColor: "#7048e8",
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 1,
			strokeStyle: "solid",
			roughness: 1,
			opacity: 100,
			seed: Math.floor(Math.random() * 100000),
			version: now,
			versionNonce: Math.floor(Math.random() * 100000),
			updated: now,
			isDeleted: false,
			locked: false,
			width: 150,
			height: 40,
		};
	}
}

export default AiService;
