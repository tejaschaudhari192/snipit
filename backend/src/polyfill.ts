import { Blob as NativeBlob } from "node:buffer";
import { DecompressionStream as NativeDecompressionStream } from "node:stream/web";

// Polyfill environment globals for phonemizer and Emscripten modules
if (typeof globalThis !== "undefined") {
	if (!globalThis.navigator) {
		(globalThis as any).navigator = { userAgent: "node" };
	}
	if (!globalThis.self) {
		(globalThis as any).self = globalThis;
	}
	if (!(globalThis as any).window) {
		(globalThis as any).window = globalThis;
	}

	// Lock Blob and DecompressionStream to Node's native implementation
	// to prevent overrides or issues in older/container environments
	(globalThis as any).Blob = NativeBlob;
	(globalThis as any).DecompressionStream = NativeDecompressionStream;
}

// Set writable espeak-ng data path before any module that uses phonemizer is loaded
process.env.ESPEAK_DATA_PATH = "/app/espeak-ng-data";
