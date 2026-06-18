import { Blob as NativeBlob } from "node:buffer";
import { DecompressionStream as NativeDecompressionStream } from "node:stream/web";
import zlib from "node:zlib";

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

	// Create a custom Blob class that intercepts the phonemizer decompression flow
	// to bypass any Web Stream/pipeThrough bugs on specific Node.js versions
	class PatchedBlob extends NativeBlob {
		private _chunks?: any[];

		constructor(chunks: any[], options?: any) {
			super(chunks, options);
			this._chunks = chunks;
		}

		stream(): any {
			const chunks = this._chunks;
			if (
				chunks &&
				chunks[0] instanceof Uint8Array &&
				chunks[0][0] === 31 && // gzip magic byte 1
				chunks[0][1] === 139 // gzip magic byte 2
			) {
				try {
					const decompressed = zlib.gunzipSync(chunks[0]);
					// Return a mock stream that yields the decompressed buffer
					return {
						pipeThrough() {
							return this;
						},
						async *[Symbol.asyncIterator]() {
							yield decompressed;
						},
					};
				} catch {
					// Fallback if decompression fails
				}
			}
			return super.stream();
		}
	}

	(globalThis as any).Blob = PatchedBlob;
	(globalThis as any).DecompressionStream = NativeDecompressionStream;
}

// Set writable espeak-ng data path before any module that uses phonemizer is loaded
process.env.ESPEAK_DATA_PATH = "/app/espeak-ng-data";
