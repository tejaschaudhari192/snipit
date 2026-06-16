import { KokoroTTS } from "kokoro-js";
import { env, RawAudio } from "@huggingface/transformers";
import path from "path";
import fs from "fs";
import os from "os";
import logger from "@/config/logger.js";

let ttsInstance: KokoroTTS | null = null;

class KokoroService {
	private async getTTS(): Promise<KokoroTTS> {
		if (!ttsInstance) {
			logger.info("Initializing local Kokoro TTS model...");
			const cachePath = path.join(process.cwd(), ".cache", "huggingface");
			if (!fs.existsSync(cachePath)) {
				fs.mkdirSync(cachePath, { recursive: true });
			}

			// Configure Hugging Face Transformers.js cache directory
			env.cacheDir = cachePath;

			// Use 8-bit quantized weights for fast local CPU inference
			ttsInstance = await KokoroTTS.from_pretrained(
				"onnx-community/Kokoro-82M-v1.0-ONNX",
				{
					dtype: "q8",
					device: "cpu",
				},
			);
			logger.info("Local Kokoro TTS model loaded successfully.");
		}
		return ttsInstance;
	}

	async generateSpeech(
		text: string,
	): Promise<{ audioBuffer: Buffer; selectedVoice: string }> {
		const tts = await this.getTTS();
		const tempFile = path.join(
			os.tmpdir(),
			`snipit-tts-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.wav`,
		);

		// AI voice controller logic: Select soft, high-pitched female voices dynamically, avoiding deep or male voices.
		let selectedVoice = "af_heart"; // Default soft, warm, high-pitched female
		const lower = text.toLowerCase();
		if (
			lower.includes("colour") ||
			lower.includes("neighbour") ||
			lower.includes("cheerio") ||
			lower.includes("london") ||
			lower.includes("mate")
		) {
			selectedVoice = "bf_emma"; // Soft British Female
		} else if (
			text.includes("!") ||
			lower.includes("wow") ||
			lower.includes("love") ||
			lower.includes("great")
		) {
			selectedVoice = "af_bella"; // Highly expressive, soft American Female
		}

		try {
			logger.info(
				`Generating speech for text: "${text.substring(0, 60)}..." using AI-selected voice: ${selectedVoice}`,
			);

			// Split text into sentence-based chunks to fit within Kokoro sequence limits
			const sentences = text.match(
				/[^.!?。！？\n]+(?:[.!?。！？\n]|\s*|$)/g,
			) || [text];
			const audioChunks: Float32Array[] = [];

			for (const sentence of sentences) {
				const trimmed = sentence.trim();
				if (!trimmed) continue;

				logger.debug(
					`Generating chunk: "${trimmed.substring(0, 30)}..."`,
				);
				const chunkAudio = await tts.generate(trimmed, {
					voice: selectedVoice as any,
				});
				if (chunkAudio && chunkAudio.audio) {
					audioChunks.push(chunkAudio.audio);
				}
			}

			if (audioChunks.length === 0) {
				throw new Error("No speech audio chunks generated");
			}

			// Concatenate all chunks
			const totalLength = audioChunks.reduce(
				(acc, val) => acc + val.length,
				0,
			);
			const concatenatedAudio = new Float32Array(totalLength);
			let offset = 0;
			for (const chunk of audioChunks) {
				concatenatedAudio.set(chunk, offset);
				offset += chunk.length;
			}

			// Reconstruct final RawAudio object and save it
			const finalAudio = new (RawAudio as any)(concatenatedAudio, 24000);
			await finalAudio.save(tempFile);

			const audioBuffer = fs.readFileSync(tempFile);
			return { audioBuffer, selectedVoice };
		} catch (error) {
			logger.error("Error generating speech in KokoroService:", error);
			throw error;
		} finally {
			// Ensure cleanup of the temporary file
			if (fs.existsSync(tempFile)) {
				try {
					fs.unlinkSync(tempFile);
				} catch (err) {
					logger.error(
						`Failed to delete temp file ${tempFile}:`,
						err,
					);
				}
			}
		}
	}

	async generateSpeechStream(
		text: string,
		onChunk: (
			chunk: Buffer,
			voice: string,
			index: number,
			total: number,
		) => Promise<void> | void,
	): Promise<void> {
		const tts = await this.getTTS();

		// AI voice controller logic
		let selectedVoice = "af_heart";
		const lower = text.toLowerCase();
		if (
			lower.includes("colour") ||
			lower.includes("neighbour") ||
			lower.includes("cheerio") ||
			lower.includes("london") ||
			lower.includes("mate")
		) {
			selectedVoice = "bf_emma";
		} else if (
			text.includes("!") ||
			lower.includes("wow") ||
			lower.includes("love") ||
			lower.includes("great")
		) {
			selectedVoice = "af_bella";
		}

		const sentences = text.match(
			/[^.!?。！？\n]+(?:[.!?。！？\n]|\s*|$)/g,
		) || [text];
		const cleanSentences = sentences
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		if (cleanSentences.length === 0) return;

		// Group sentences into chunks up to a max character length to fit model limits
		const maxChunkChars = 300; // approximate, adjust as needed
		const groups: string[] = [];
		let currentChunk = "";

		for (const sentence of cleanSentences) {
			if (
				(currentChunk + " " + sentence).trim().length <= maxChunkChars
			) {
				currentChunk =
					(currentChunk ? currentChunk + " " : "") + sentence;
			} else {
				if (currentChunk) groups.push(currentChunk);
				currentChunk = sentence;
			}
		}
		if (currentChunk) groups.push(currentChunk);

		for (const [i, group] of groups.entries()) {
			const tempFile = path.join(
				os.tmpdir(),
				`snipit-tts-stream-${Date.now()}-${i}.wav`,
			);

			try {
				logger.debug(
					`Generating stream chunk ${i + 1}/${groups.length}: "${group.substring(0, 30)}..."`,
				);
				const chunkAudio = await tts.generate(group, {
					voice: selectedVoice as any,
				});

				if (chunkAudio) {
					await chunkAudio.save(tempFile);
					const buffer = fs.readFileSync(tempFile);
					await onChunk(buffer, selectedVoice, i, groups.length);
				}
			} catch (err) {
				logger.error(`Error in generateSpeechStream chunk ${i}:`, err);
			} finally {
				if (fs.existsSync(tempFile)) {
					try {
						fs.unlinkSync(tempFile);
					} catch (e) {
						logger.error(
							`Failed to clean chunk temp file ${tempFile}:`,
							e,
						);
					}
				}
			}
		}
	}
}

export const kokoroService = new KokoroService();
