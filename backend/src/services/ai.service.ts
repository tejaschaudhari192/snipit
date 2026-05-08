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
		| "box"
		| "text"
		| "arrow"
		| "ellipse"
		| "diamond"
		| "cloud"
		| "cylinder"
		| "image_placeholder"
		| "stickman";
	text?: string | undefined;
	position?: string | undefined;
	from?: string | undefined;
	to?: string | undefined;
	label?: string | undefined;
	strokeColor?: string | undefined;
	backgroundColor?: string | undefined;
}

interface CompactDrawing {
	elements: CompactElement[];
}

// Robust dagre access
const dagre: any = (dagreModule as any).default || dagreModule;

const CompactElementSchema = z.object({
	id: z.string().optional(),
	type: z.enum([
		"box",
		"text",
		"arrow",
		"ellipse",
		"diamond",
		"cloud",
		"cylinder",
		"image_placeholder",
		"stickman",
	]),
	text: z.string().optional(),
	position: z.string().optional(),
	from: z.string().optional(),
	to: z.string().optional(),
	label: z.string().optional(),
	strokeColor: z.string().optional(),
	backgroundColor: z.string().optional(),
});

const CompactDrawingSchema = z.object({
	elements: z.array(CompactElementSchema),
});

const GROQ_MODELS = [
	configurations.groq_model!, // User's preference
	"llama-3.3-70b-versatile",
	"llama-3.1-8b-instant",
	"qwen/qwen3-32b",
	"allam-2-7b",
	"openai/gpt-oss-120b",
	"openai/gpt-oss-20b",
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
			model: "llama-3.1-8b-instant", // Always use fast model for autocomplete
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

				const elements = this.layoutWithDagre(parsed.elements);
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

	private layoutWithDagre(compactElements: CompactElement[]): any[] {
		const g = new dagre.graphlib.Graph();
		g.setGraph({
			rankdir: "TB",
			marginx: 50,
			marginy: 50,
			nodesep: 100,
			ranksep: 100,
		});
		g.setDefaultEdgeLabel(() => ({}));

		const now = Date.now();
		let nodeCounter = 0;

		// 1. Add Nodes
		compactElements.forEach((el: CompactElement) => {
			if (el.type === "arrow") return;
			const id = el.id || `node_${++nodeCounter}`;
			el.id = id;
			g.setNode(id, { width: 180, height: 80, data: el });
		});

		// 2. Add Edges
		compactElements.forEach((el: CompactElement, index: number) => {
			if (el.type === "arrow" && el.from && el.to) {
				if (g.node(el.from) && g.node(el.to)) {
					g.setEdge(el.from, el.to, {
						label: el.label,
						id: `arrow_${index}`,
					});
				}
			}
		});

		dagre.layout(g);

		// 3. Map to Excalidraw
		const excalidrawElements: any[] = [];

		g.nodes().forEach((id: string) => {
			const node = g.node(id);
			if (!node?.data) return;

			const el: CompactElement = node.data;
			const x = node.x - node.width / 2;
			const y = node.y - node.height / 2;
			const { strokeColor, backgroundColor } = this.getElementColors(el);
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
				fillStyle: "solid",
				strokeWidth: 1.5,
				strokeStyle: el.type === "cloud" ? "dashed" : "solid",
				roughness: 0,
				opacity: 100,
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
			}
		});

		return excalidrawElements;
	}

	private mapElementToExcalidrawType(type: string): string {
		const map: Record<string, string> = {
			box: "rectangle",
			ellipse: "ellipse",
			diamond: "diamond",
			cloud: "rectangle",
			cylinder: "rectangle",
			image_placeholder: "rectangle",
			stickman: "ellipse",
		};
		return map[type] || "rectangle";
	}

	private getElementColors(el: CompactElement): {
		strokeColor: string;
		backgroundColor: string;
	} {
		if (el.strokeColor || el.backgroundColor) {
			return {
				strokeColor: el.strokeColor || "#1e1e1e",
				backgroundColor: el.backgroundColor || "transparent",
			};
		}

		const text = (el.text || "").toLowerCase();
		if (
			text.includes("user") ||
			text.includes("client") ||
			text.includes("frontend")
		) {
			return { backgroundColor: "#a5d8ff", strokeColor: "#1971c2" };
		}
		if (
			text.includes("db") ||
			text.includes("redis") ||
			text.includes("data") ||
			text.includes("storage")
		) {
			return { backgroundColor: "#b2f2bb", strokeColor: "#2f9e44" };
		}
		if (
			text.includes("api") ||
			text.includes("server") ||
			text.includes("node") ||
			text.includes("backend")
		) {
			return { backgroundColor: "#d0bfff", strokeColor: "#7048e8" };
		}
		return { backgroundColor: "#f1f3f5", strokeColor: "#868e96" };
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
	) {
		return {
			id,
			type: "text",
			x: x + w / 2,
			y: y + h / 2,
			text,
			fontSize: 20,
			fontFamily: 1,
			textAlign: "center",
			verticalAlign: "middle",
			containerId,
			strokeColor,
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 1,
			strokeStyle: "solid",
			roughness: 0,
			opacity: 100,
			seed: Math.floor(Math.random() * 100000),
			version: now,
			versionNonce: Math.floor(Math.random() * 100000),
			updated: now,
			isDeleted: false,
			locked: false,
			width: w * 0.8,
			height: h * 0.8,
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
			strokeColor: "#1e1e1e",
			backgroundColor: "transparent",
			fillStyle: "solid",
			strokeWidth: 1.5,
			strokeStyle: "solid",
			roughness: 0,
			opacity: 100,
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
			elbowed: true,
			startBinding: { elementId: e.v, gap: 5, focus: 0 },
			endBinding: { elementId: e.w, gap: 5, focus: 0 },
			endArrowhead: "arrow",
		};
	}
}

export default AiService;
