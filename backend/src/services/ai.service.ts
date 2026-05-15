import Groq from "groq-sdk";
import fs from "fs";
import { Readable } from "stream";
import configurations from "@/config/configurations.js";
import pasteModel from "@/models/Paste.js";
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
const dagre = (dagreModule as any).default || dagreModule;

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

const GROQ_MODELS = configurations.groq_models;

class AiService {
	private groq: Groq;

	constructor() {
		this.groq = new Groq({ apiKey: configurations.groq_api_key });
	}

	async verify(): Promise<boolean> {
		try {
			const models = await this.groq.models.list();
			return models.data.some(
				(m) => m.id === configurations.groq_smart_model,
			);
		} catch (error) {
			return false;
		}
	}

	async detectLanguage(content: string): Promise<string> {
		const systemPrompt = PROMPTS.DETECT_LANGUAGE.SYSTEM([
			...VALID_LANGUAGES,
		]);
		const userPrompt = PROMPTS.DETECT_LANGUAGE.USER(content);

		try {
			const chatCompletion = await this.requestWithFallback(
				{
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userPrompt },
					],
					temperature: 0.1,
					max_tokens: 10,
				},
				{ preferredModel: configurations.groq_dumb_model },
			);

			const rawResponse =
				chatCompletion.choices[0]?.message?.content?.trim() || "text";

			// Clean the response: lowercase and remove any non-alphanumeric characters except # and + (for C++/C#)
			let language = rawResponse
				.toLowerCase()
				.replace(/[^a-z0-9#+]/g, "")
				.trim();

			// If the model returned a longer sentence, try to see if any valid language is contained within it
			if (!VALID_LANGUAGES.includes(language)) {
				const found = VALID_LANGUAGES.find((lang) =>
					rawResponse.toLowerCase().includes(lang),
				);
				if (found) language = found;
			}

			return VALID_LANGUAGES.includes(language) ? language : "text";
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

		try {
			const chatCompletion = await this.requestWithFallback(
				{
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userPrompt },
					],
					temperature: 0,
				},
				{ preferredModel: configurations.groq_smart_model },
			);

			return chatCompletion.choices[0]?.message?.content?.trim() || "";
		} catch (error) {
			logger.error("Error enhancing content:", error);
			return content;
		}
	}

	async suggestId(
		content: string,
		files?: Array<{ name: string; type: string }>,
	): Promise<string> {
		const takenIds: string[] = [];
		let finalId = "";
		let attempts = 0;

		while (attempts < 3) {
			const systemPrompt = PROMPTS.SUGGEST_ID.SYSTEM;
			let userPrompt = PROMPTS.SUGGEST_ID.USER(content, files);

			if (takenIds.length > 0) {
				userPrompt += `\n\nIMPORTANT: The following IDs are already taken, do NOT use them: ${takenIds.join(", ")}. Suggest a completely different nice word.`;
			}

			try {
				const chatCompletion = await this.requestWithFallback(
					{
						messages: [
							{ role: "system", content: systemPrompt },
							{ role: "user", content: userPrompt },
						],
						temperature: 0.5 + attempts * 0.2, // Increase variety on retries
						max_tokens: 20,
					},
					{ preferredModel: configurations.groq_dumb_model },
				);

				let id =
					chatCompletion.choices[0]?.message?.content?.trim() || "";
				id = id
					.toLowerCase()
					.replace(/\s+/g, "-")
					.replace(/[^a-z0-9-]/g, "")
					.substring(0, 50);

				if (!id) break;

				const existing = await pasteModel.findOne({ id }).lean();
				const isExpired =
					existing &&
					(existing as any).expiresAt &&
					new Date() > new Date((existing as any).expiresAt);

				if (!existing || isExpired) {
					finalId = id;
					break;
				} else {
					takenIds.push(id);
					attempts++;
				}
			} catch (error) {
				logger.error(
					`Attempt ${attempts} failed for suggestId:`,
					error,
				);
				attempts++;
			}
		}

		return (
			finalId ||
			(takenIds.length > 0
				? takenIds[0] + "-" + Math.random().toString(36).substring(2, 5)
				: "snippet-" + Math.random().toString(36).substring(2, 7))
		); // Fallback if all retries fail
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

		try {
			const chatCompletion = await this.requestWithFallback(
				{
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
					temperature: 0,
					max_tokens: isText ? 64 : 128,
					stop: isText ? ["\n", "\n\n"] : ["\n\n", "```"],
				},
				{ preferredModel: configurations.groq_smart_model },
			);

			return chatCompletion.choices[0]?.message?.content?.trim() || "";
		} catch (error) {
			logger.error("Error in autocomplete:", error);
			return "";
		}
	}

	async generateDrawContent(description: string): Promise<string> {
		try {
			return await this.requestWithFallback(
				{
					messages: [
						{ role: "system", content: PROMPTS.DRAW.SYSTEM },
						{
							role: "user",
							content: PROMPTS.DRAW.USER(description),
						},
					],
					temperature: 0,
					max_tokens: 5000,
				},
				{
					validator: (completion) => {
						const raw =
							completion.choices[0]?.message?.content?.trim() ||
							"[]";
						const cleaned = this.cleanAiJson(raw);
						const parsed = this.parseAndValidateDrawing(cleaned);
						if (!parsed) return null;

						const elements = this.layoutWithDagre(parsed);
						return JSON.stringify(elements);
					},
				},
			);
		} catch (error) {
			logger.error("All models failed diagram generation:", error);
			return "[]";
		}
	}

	async prepareForSpeech(
		content: string,
		contentType: string,
	): Promise<string> {
		// Plaintext, Code, and Draw content are returned directly
		if (
			contentType === "text" ||
			contentType === "code" ||
			contentType === "draw"
		) {
			return content;
		}

		// Only Markdown is processed via Groq for natural reading
		if (contentType === "markdown") {
			try {
				const systemPrompt = PROMPTS.PREPARE_SPEECH.MARKDOWN.SYSTEM;

				const chatCompletion = await this.requestWithFallback(
					{
						messages: [
							{ role: "system", content: systemPrompt },
							{ role: "user", content },
						],
						temperature: 0,
					},
					{ preferredModel: configurations.groq_dumb_model },
				);

				return (
					chatCompletion.choices[0]?.message?.content?.trim() ||
					content
				);
			} catch (error: unknown) {
				const err = error as { message?: string };
				logger.error("Error preparing text for speech:", {
					error: err?.message,
				});
				return content;
			}
		}

		return content;
	}

	async transcribeAudio(
		filePath: string,
		originalName: string,
	): Promise<string> {
		const extension = originalName.split(".").pop() || "webm";
		const filePathWithExt = `${filePath}.${extension}`;

		try {
			// Rename file to include extension so Groq can detect format
			fs.renameSync(filePath, filePathWithExt);

			const transcription = await this.groq.audio.transcriptions.create({
				file: fs.createReadStream(filePathWithExt),
				model: configurations.groq_audio_model,
				response_format: "json",
			});

			return transcription.text;
		} catch (error) {
			logger.error("Error transcribing audio:", error);
			throw error;
		} finally {
			// Clean up the temporary files
			[filePath, filePathWithExt].forEach((path) => {
				if (fs.existsSync(path)) {
					fs.unlink(path, (err) => {
						if (err)
							logger.error(
								`Failed to delete temp file ${path}:`,
								err,
							);
					});
				}
			});
		}
	}

	/**
	 * Executes a Groq completion request with automatic model fallback and optional validation.
	 * Prioritizes the preferred model if provided, then falls through the GROQ_MODELS list.
	 */
	private async requestWithFallback<T = Groq.Chat.ChatCompletion>(
		params: Omit<
			Parameters<typeof this.groq.chat.completions.create>[0],
			"model" | "stream"
		>,
		options: {
			preferredModel?: string;
			validator?: (completion: Groq.Chat.ChatCompletion) => T | null;
		} = {},
	): Promise<T> {
		const { preferredModel, validator } = options;
		const models = [preferredModel, ...GROQ_MODELS].filter(
			(m, i, self) => m && self.indexOf(m) === i,
		) as string[];

		let lastError;

		for (const model of models) {
			try {
				logger.debug(`Attempting Groq request with model: ${model}`);
				const completion = await this.groq.chat.completions.create({
					...params,
					model,
					stream: false,
				});

				if (validator) {
					const validated = validator(completion);
					if (validated !== null) return validated;
					throw new Error(
						`Validation failed for model output: ${model}`,
					);
				}

				return completion as T;
			} catch (error: unknown) {
				const err = error as { status?: number; message?: string };
				lastError = err;

				const isRateLimit =
					err?.status === 429 ||
					err?.status === 413 ||
					err?.message?.includes("rate_limit");

				if (isRateLimit) {
					logger.warn(
						`Model ${model} rate limited or overloaded. Falling back...`,
					);
					continue;
				}

				// If validator failed or other non-rate-limit error, we still try next model
				// unless it's a critical error (like API key invalid)
				if (err?.status === 401) throw err;

				logger.error(`Model ${model} failed, trying next...`, {
					error: err?.message,
				});
			}
		}

		throw lastError || new Error("All models exhausted without success");
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

	/**
	 * WHITEBOARD FLOWCHART GENERATION ALGORITHM:
	 * 1. INITIALIZATION: Setup Dagre graph with semantic spacing and TB/LR direction.
	 * 2. NODE DISCOVERY: Map semantic DSL nodes to Dagre with type-specific dimensions.
	 * 3. EDGE ROUTING: Link nodes with Dagre edges, capturing semantic labels.
	 * 4. LAYOUT COMPUTATION: Execute Dagre layout engine to find optimal (x, y) coordinates.
	 * 5. VISUAL MAPPING: Transform Dagre nodes into Excalidraw shapes (hachure, Virgil font, vibrant colors).
	 * 6. LABEL INJECTION: Calculate arrow midpoints and inject floating Excalidraw text for edge labels.
	 * 7. ANNOTATION PASS: Place free-floating sticky notes (annotations) near their target nodes.
	 */
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
