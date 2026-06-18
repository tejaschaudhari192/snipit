// Polyfill navigator for phonemizer on Node 20
if (typeof global !== "undefined" && !global.navigator) {
	(global as any).navigator = { userAgent: "node" };
}

// Set writable espeak-ng data path before any module that uses phonemizer is loaded
process.env.ESPEAK_DATA_PATH = "/app/espeak-ng-data";
