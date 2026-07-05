import { KokoroTTS } from "kokoro-js";
import { env } from "@huggingface/transformers";

// Configure browser-specific environment settings for Hugging Face Transformers
// Ensure we don't try to access Node-only filesystems or local caches
env.allowLocalModels = false;

// We can also configure ONNX options in the browser if supported
if (env.backends && env.backends.onnx) {
    env.backends.onnx.session_options = {
        intra_op_num_threads: 1,
        inter_op_num_threads: 1,
        execution_mode: "sequential",
    };
}

let ttsInstance: KokoroTTS | null = null;
let isInitializing = false;
let initPromise: Promise<KokoroTTS> | null = null;

export const initKokoro = async (
    onProgress?: (progress: number) => void,
): Promise<KokoroTTS> => {
    if (ttsInstance) return ttsInstance;

    if (isInitializing && initPromise) {
        return initPromise;
    }

    isInitializing = true;
    initPromise = (async () => {
        try {
            // Initialize the Kokoro model from Hugging Face community ONNX Hub.
            // By default, ONNX WebAssembly execution provider is used, and WebGPU will be used if available.
            const tts = await KokoroTTS.from_pretrained(
                "onnx-community/Kokoro-82M-v1.0-ONNX",
                {
                    dtype: "q8" as const,
                    device: "webgpu" as const,
                    progress_callback: (data: { status: string; progress: number }) => {
                        if (
                            data &&
                            data.status === "progress" &&
                            typeof data.progress === "number"
                        ) {
                            // data.progress is a percentage from 0 to 100 or ratio from 0 to 1
                            // Let's normalize it to 0-100 percentage.
                            const pct =
                                data.progress <= 1
                                    ? data.progress * 100
                                    : data.progress;
                            if (onProgress) {
                                onProgress(Math.round(pct));
                            }
                        }
                    },
                } as Record<string, unknown>,
            );
            ttsInstance = tts;
            return tts;
        } catch (error) {
            console.error(
                "Failed to initialize Kokoro client-side model:",
                error,
            );
            throw error;
        } finally {
            isInitializing = false;
            initPromise = null;
        }
    })();

    return initPromise;
};

/**
 * Client-side Speech Generation using Kokoro-82M.
 * Runs inference completely inside the browser using WebAssembly or WebGPU.
 */
export const generateSpeechClient = async (
    text: string,
    voice: string = "af_heart",
    onProgress?: (progress: number) => void,
): Promise<{ audio: Float32Array; sampleRate: number }> => {
    const tts = await initKokoro(onProgress);

    // Generate speech audio inside browser sandbox
    const result = await tts.generate(text, {
        voice,
    });

    if (!result || !result.audio) {
        throw new Error("Failed to generate client-side audio array");
    }

    return {
        audio: result.audio,
        sampleRate: 24000, // Kokoro native sample rate
    };
};
