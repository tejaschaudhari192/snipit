/**
 * Client-side file encryption/decryption utilities.
 * Ported from the Python encrypto concept using Web Crypto API.
 * All operations happen entirely in the browser — no server uploads.
 *
 * Payload format (all encrypted together):
 *   [path_length (2 bytes)][relative_path (UTF-8)][data_length (4 bytes)][file_data][padding]
 *
 * - path_length: length of the relative_path in bytes (uint16)
 * - relative_path: full folder structure (e.g. "docs/images/photo.png")
 * - data_length: original file data length in bytes (uint32) — used to strip padding
 * - file_data: the actual file bytes
 * - padding: random bytes to round total payload up to PADDING_BLOCK_SIZE
 *
 * The output file gets a UUID-based name to mask the original structure.
 * Random padding obfuscates the original file size to prevent information leakage.
 */

// ---- Key Derivation ----

const ITERATIONS = 100_000;
const KEY_LENGTH = 256;
const ALGORITHM = "AES-GCM";

/** Round encrypted payloads up to this block size to obfuscate original file size */
const PADDING_BLOCK_SIZE = 1_048_576; // 1 MB

// Key cache to avoid repeated slow PBKDF2 derivations during batch operations
const keyCache = new Map<string, CryptoKey>();

function getCacheKey(password: string, salt: Uint8Array): string {
	const saltHex = Array.from(salt)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return `${password}:${saltHex}`;
}

async function deriveKey(
	password: string,
	salt: Uint8Array,
): Promise<CryptoKey> {
	const cacheKey = getCacheKey(password, salt);
	const cached = keyCache.get(cacheKey);
	if (cached) return cached;

	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);

	const key = await crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: salt as unknown as ArrayBuffer,
			iterations: ITERATIONS,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: ALGORITHM, length: KEY_LENGTH },
		false,
		["encrypt", "decrypt"],
	);

	keyCache.set(cacheKey, key);
	return key;
}

// ---- Encryption ----

export interface EncryptedFile {
	/** The encrypted blob ready for download */
	blob: Blob;
	/** The original relative path (e.g. "folder/sub/file.txt") stored inside the payload */
	originalPath: string;
	/** The suggested output filename (UUID + original extension) */
	outputName: string;
}

/**
 * Encrypt a single file with the given password or pre-derived key.
 * Embeds the full relative path (including folder structure) inside the encrypted payload.
 */
export async function encryptFile(
	file: File,
	passwordOrKey: string | CryptoKey,
	salt?: Uint8Array,
	relativePath?: string,
): Promise<EncryptedFile> {
	let key: CryptoKey;
	let actualSalt: Uint8Array;

	if (passwordOrKey instanceof CryptoKey) {
		key = passwordOrKey;
		actualSalt = salt || new Uint8Array(0);
	} else {
		actualSalt = salt || crypto.getRandomValues(new Uint8Array(16));
		key = await deriveKey(passwordOrKey, actualSalt);
	}

	const path = relativePath || file.name;

	// Build payload: [path_length(2 bytes)][relative_path][data_length(4 bytes)][file_data][padding]
	const pathBytes = new TextEncoder().encode(path);
	const pathLen = new Uint8Array(2);
	pathLen[0] = (pathBytes.length >> 8) & 0xff;
	pathLen[1] = pathBytes.length & 0xff;

	const fileBuffer = await file.arrayBuffer();
	const dataLen = fileBuffer.byteLength;

	// data_length as 4-byte uint32
	const dataLenBytes = new Uint8Array(4);
	dataLenBytes[0] = (dataLen >> 24) & 0xff;
	dataLenBytes[1] = (dataLen >> 16) & 0xff;
	dataLenBytes[2] = (dataLen >> 8) & 0xff;
	dataLenBytes[3] = dataLen & 0xff;

	const headerSize = pathLen.length + pathBytes.length + dataLenBytes.length;
	const payloadSize = headerSize + dataLen;

	// Calculate padding to round up to PADDING_BLOCK_SIZE
	const paddedSize =
		Math.ceil(payloadSize / PADDING_BLOCK_SIZE) * PADDING_BLOCK_SIZE;
	const paddingSize = paddedSize - payloadSize;

	const payload = new Uint8Array(paddedSize);
	payload.set(pathLen, 0);
	payload.set(pathBytes, 2);
	payload.set(dataLenBytes, 2 + pathBytes.length);
	payload.set(new Uint8Array(fileBuffer), headerSize);

	// Fill padding with random bytes in chunks of max 65536
	if (paddingSize > 0) {
		const padding = new Uint8Array(paddingSize);
		let offset = 0;
		while (offset < paddingSize) {
			const chunkSize = Math.min(65536, paddingSize - offset);
			const chunk = crypto.getRandomValues(new Uint8Array(chunkSize));
			padding.set(chunk, offset);
			offset += chunkSize;
		}
		payload.set(padding, headerSize + dataLen);
	}

	// Encrypt with AES-GCM
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt(
		{ name: ALGORITHM, iv: iv as unknown as ArrayBuffer },
		key,
		payload as unknown as ArrayBuffer,
	);

	// Header prefix structure:
	// [Magic "CSAFE" (5 bytes)][Version 1 (1 byte)][Salt (16 bytes)][IV (12 bytes)][Encrypted Payload]
	const magic = new TextEncoder().encode("CSAFE");
	const version = new Uint8Array([1]);
	const headerPrefix = new Uint8Array(
		magic.length + version.length + actualSalt.length + iv.length,
	);
	headerPrefix.set(magic, 0);
	headerPrefix.set(version, magic.length);
	headerPrefix.set(actualSalt, magic.length + version.length);
	headerPrefix.set(iv, magic.length + version.length + actualSalt.length);

	const output = new Uint8Array(headerPrefix.length + encrypted.byteLength);
	output.set(headerPrefix, 0);
	output.set(new Uint8Array(encrypted), headerPrefix.length);

	// Generate a UUID-based output name with fixed extension
	const uuid = crypto.randomUUID();
	const outputName = `${uuid}.enc`;

	return {
		blob: new Blob([output], { type: "application/octet-stream" }),
		originalPath: path,
		outputName,
	};
}

export async function encryptFiles(
	files: File[],
	password: string,
	onProgress?: (filename: string, bytes: number, index: number) => void,
): Promise<EncryptedFile[]> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const key = await deriveKey(password, salt);
	const results: EncryptedFile[] = [];

	for (let i = 0; i < files.length; i++) {
		const f = files[i]!;
		const relPath =
			(f as File & { webkitRelativePath?: string }).webkitRelativePath ||
			f.name;
		if (onProgress) {
			onProgress(relPath, f.size, i);
		}
		const res = await encryptFile(f, key, salt, relPath);
		results.push(res);
	}
	return results;
}

// ---- Decryption ----

export interface DecryptedFile {
	/** The decrypted file ready for download / use */
	file: File;
	/** The original relative path extracted from the payload (e.g. "folder/sub/file.txt") */
	originalPath: string;
}

/**
 * Decrypt a single encrypted file blob with the given password.
 * Supports legacy format fallback.
 */
export async function decryptFile(
	encryptedBlob: Blob,
	password: string,
	fallbackName = "decrypted-file",
): Promise<DecryptedFile> {
	const data = new Uint8Array(await encryptedBlob.arrayBuffer());

	if (data.length < 12) {
		throw new Error("Invalid encrypted file: too short.");
	}

	const magic = new TextEncoder().encode("CSAFE");
	let hasMagic = true;

	if (data.length < 34) {
		hasMagic = false;
	} else {
		for (let i = 0; i < magic.length; i++) {
			if (data[i] !== magic[i]) {
				hasMagic = false;
				break;
			}
		}
	}

	let key: CryptoKey;
	let iv: Uint8Array;
	let ciphertext: Uint8Array;

	if (hasMagic) {
		const version = data[magic.length];
		if (version !== 1) {
			throw new Error(`Unsupported file version: ${version}`);
		}
		const salt = data.slice(magic.length + 1, magic.length + 1 + 16);
		iv = data.slice(magic.length + 1 + 16, magic.length + 1 + 16 + 12);
		ciphertext = data.slice(magic.length + 1 + 16 + 12);
		key = await deriveKey(password, salt);
	} else {
		// Fallback to legacy format: static salt, no version header, IV prepended directly
		const legacySalt = new TextEncoder().encode(
			"static_salt_for_folder_encryption",
		);
		iv = data.slice(0, 12);
		ciphertext = data.slice(12);
		key = await deriveKey(password, legacySalt);
	}

	// Decrypt — catch wrong password errors
	let decrypted: ArrayBuffer;
	try {
		decrypted = await crypto.subtle.decrypt(
			{ name: ALGORITHM, iv: iv as unknown as ArrayBuffer },
			key,
			ciphertext as unknown as ArrayBuffer,
		);
	} catch {
		throw new Error("Incorrect encryption key or corrupted file.");
	}

	const decryptedBytes = new Uint8Array(decrypted);

	if (decryptedBytes.length < 6) {
		throw new Error("Invalid decrypted payload: too short.");
	}

	// Extract path length (first 2 bytes)
	const pathLen = (decryptedBytes[0] << 8) | decryptedBytes[1];

	if (2 + pathLen + 4 > decryptedBytes.length) {
		throw new Error("Invalid decrypted payload: corrupted path length.");
	}

	// Extract relative path
	const pathBytes = decryptedBytes.slice(2, 2 + pathLen);
	const originalPath = new TextDecoder().decode(pathBytes) || fallbackName;

	// Extract data length (4 bytes after path)
	const dataLen =
		(decryptedBytes[2 + pathLen] << 24) |
		(decryptedBytes[2 + pathLen + 1] << 16) |
		(decryptedBytes[2 + pathLen + 2] << 8) |
		decryptedBytes[2 + pathLen + 3];

	const headerSize = 2 + pathLen + 4;
	if (headerSize + dataLen > decryptedBytes.length) {
		throw new Error("Invalid decrypted payload: corrupted data length.");
	}

	// Read exactly dataLen bytes (ignore padding)
	const fileData = decryptedBytes.slice(headerSize, headerSize + dataLen);

	// Use just the filename for the File object (path separators handled by download logic)
	const fileName = originalPath.includes("/")
		? originalPath.substring(originalPath.lastIndexOf("/") + 1)
		: originalPath;
	const mimeType = getMimeType(fileName);
	const file = new File([fileData], fileName, { type: mimeType });

	return { file, originalPath };
}

export async function decryptFiles(
	encryptedBlobs: Blob[],
	password: string,
	onProgress?: (filename: string, bytes: number, index: number) => void,
): Promise<DecryptedFile[]> {
	const results: DecryptedFile[] = [];
	for (let i = 0; i < encryptedBlobs.length; i++) {
		const blob = encryptedBlobs[i]!;
		const fallbackName = `file-${i}`;
		const displayName = blob instanceof File ? blob.name : fallbackName;
		if (onProgress) {
			onProgress(displayName, blob.size, i);
		}
		const res = await decryptFile(blob, password, fallbackName);
		results.push(res);
	}
	return results;
}

// ---- Helpers ----

function getMimeType(filename: string): string {
	const ext = filename.includes(".")
		? filename.substring(filename.lastIndexOf(".") + 1).toLowerCase()
		: "";
	const mimeMap: Record<string, string> = {
		txt: "text/plain",
		html: "text/html",
		css: "text/css",
		js: "application/javascript",
		ts: "application/typescript",
		json: "application/json",
		xml: "application/xml",
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
		pdf: "application/pdf",
		zip: "application/zip",
		mp3: "audio/mpeg",
		wav: "audio/wav",
		mp4: "video/mp4",
	};
	return mimeMap[ext] || "application/octet-stream";
}

/**
 * Trigger a file download in the browser.
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// ---- Simple ZIP creation (no external deps) ----

/**
 * Create a ZIP archive blob from multiple files, preserving folder structure.
 * Uses the standard ZIP format with STORED (uncompressed) method.
 */
export async function createZipBlob(
	files: { blob: Blob; path: string }[],
): Promise<Blob> {
	const localHeaders: Uint8Array[] = [];
	const fileData: Uint8Array[] = [];
	const centralEntries: Uint8Array[] = [];
	let offset = 0;

	for (const { blob, path } of files) {
		const data = new Uint8Array(await blob.arrayBuffer());
		const crc = crc32(data);
		const size = data.byteLength;
		const nameBytes = new TextEncoder().encode(path);

		// Local file header
		const localHeader = new Uint8Array(30 + nameBytes.length);
		const lhView = new DataView(localHeader.buffer);
		lhView.setUint32(0, 0x04034b50, true); // signature
		lhView.setUint16(4, 20, true); // version needed
		lhView.setUint16(6, 0, true); // flags
		lhView.setUint16(8, 0, true); // compression: stored
		lhView.setUint16(10, 0, true); // mod time
		lhView.setUint16(12, 0, true); // mod date
		lhView.setUint32(14, crc, true); // crc-32
		lhView.setUint32(18, size, true); // compressed size
		lhView.setUint32(22, size, true); // uncompressed size
		lhView.setUint16(26, nameBytes.length, true); // filename length
		lhView.setUint16(28, 0, true); // extra field length
		localHeader.set(nameBytes, 30);

		localHeaders.push(localHeader);
		fileData.push(data);

		// Central directory entry
		const centralEntry = new Uint8Array(46 + nameBytes.length);
		const ceView = new DataView(centralEntry.buffer);
		ceView.setUint32(0, 0x02014b50, true); // signature
		ceView.setUint16(4, 20, true); // version made by
		ceView.setUint16(6, 20, true); // version needed
		ceView.setUint16(8, 0, true); // flags
		ceView.setUint16(10, 0, true); // compression
		ceView.setUint16(12, 0, true); // mod time
		ceView.setUint16(14, 0, true); // mod date
		ceView.setUint32(16, crc, true); // crc-32
		ceView.setUint32(20, size, true); // compressed size
		ceView.setUint32(24, size, true); // uncompressed size
		ceView.setUint16(28, nameBytes.length, true); // filename length
		ceView.setUint16(30, 0, true); // extra field length
		ceView.setUint16(32, 0, true); // file comment length
		ceView.setUint16(34, 0, true); // disk number start
		ceView.setUint16(36, 0, true); // internal attrs
		ceView.setUint32(38, 0, true); // external attrs
		ceView.setUint32(42, offset, true); // local header offset
		centralEntry.set(nameBytes, 46);

		centralEntries.push(centralEntry);
		offset += 30 + nameBytes.length + size;
	}

	// End of central directory record
	const centralSize = centralEntries.reduce((s, e) => s + e.byteLength, 0);
	const centralOffset = offset;
	const eocd = new Uint8Array(22);
	const eocdView = new DataView(eocd.buffer);
	eocdView.setUint32(0, 0x06054b50, true); // signature
	eocdView.setUint16(4, 0, true); // disk number
	eocdView.setUint16(6, 0, true); // disk with central dir
	eocdView.setUint16(8, files.length, true); // entries on disk
	eocdView.setUint16(10, files.length, true); // total entries
	eocdView.setUint32(12, centralSize, true); // central dir size
	eocdView.setUint32(16, centralOffset, true); // central dir offset
	eocdView.setUint16(20, 0, true); // comment length

	const parts = [...localHeaders, ...fileData, ...centralEntries, eocd];
	const totalLength = parts.reduce((s, p) => s + p.byteLength, 0);
	const result = new Uint8Array(totalLength);
	let pos = 0;
	for (const part of parts) {
		result.set(part, pos);
		pos += part.byteLength;
	}

	return new Blob([result], { type: "application/zip" });
}

/**
 * Download multiple files as a ZIP archive, preserving folder structure.
 */
export async function downloadAsZip(
	files: { blob: Blob; path: string }[],
	zipName: string,
): Promise<void> {
	if (files.length === 0) return;

	if (files.length === 1) {
		// Single file — just download it directly
		downloadBlob(files[0].blob, files[0].path);
		return;
	}

	const zipBlob = await createZipBlob(files);
	downloadBlob(zipBlob, zipName);
}

// ---- Write files into a real folder (File System Access API) ----

/**
 * Write multiple files into a user-selected folder, preserving folder hierarchy.
 * Uses the File System Access API (showDirectoryPicker).
 * Falls back to ZIP download if the API is not available.
 *
 * @param files - Array of { blob, path } where path is the relative path (e.g. "docs/img/photo.png")
 * @param fallbackZipName - Name for the ZIP fallback if the API is unavailable
 */
export async function writeToFolder(
	files: { blob: Blob; path: string }[],
	fallbackZipName = "files.zip",
): Promise<void> {
	if (files.length === 0) return;

	// Check if the File System Access API is available
	if (!("showDirectoryPicker" in window)) {
		// Fallback to ZIP download
		console.warn(
			"File System Access API not available, falling back to ZIP download",
		);
		await downloadAsZip(files, fallbackZipName);
		return;
	}

	try {
		// Let the user pick a destination folder
		const dirHandle = await (
			window as unknown as {
				showDirectoryPicker(options?: {
					mode?: string;
					startIn?: string;
				}): Promise<FileSystemDirectoryHandle>;
			}
		).showDirectoryPicker({
			mode: "readwrite",
			startIn: "downloads",
		});

		// Write each file, creating subdirectories as needed
		for (const { blob, path } of files) {
			await writeFileToDirectory(dirHandle, path, blob);
		}
	} catch (err: unknown) {
		// User cancelled the picker — silently ignore
		if (
			err &&
			typeof err === "object" &&
			"name" in err &&
			(err as { name: string }).name === "AbortError"
		)
			return;
		// Other errors — fall back to ZIP
		console.error("Failed to write to folder:", err);
		await downloadAsZip(files, fallbackZipName);
	}
}

/**
 * Write files directly into a given directory handle (no prompt).
 * Used when we already have a handle from a previous selection.
 */
export async function writeToDirectory(
	dirHandle: FileSystemDirectoryHandle,
	files: { blob: Blob; path: string }[],
): Promise<void> {
	for (const { blob, path } of files) {
		await writeFileToDirectory(dirHandle, path, blob);
	}
}

/**
 * Recursively read all files from a directory handle.
 * Returns File objects with webkitRelativePath set for folder structure.
 */
export async function readFilesFromDirectory(
	dirHandle: FileSystemDirectoryHandle,
	basePath = "",
): Promise<File[]> {
	const files: File[] = [];

	for await (const [name, handle] of (
		dirHandle as unknown as {
			entries(): AsyncIterable<[string, FileSystemHandle]>;
		}
	).entries()) {
		if (handle.kind === "file") {
			const fileHandle = handle as FileSystemFileHandle;
			const file = await fileHandle.getFile();
			// Preserve the relative path
			const relPath = basePath ? `${basePath}/${name}` : name;
			const patchedFile = new File([file], name, { type: file.type });
			Object.defineProperty(patchedFile, "webkitRelativePath", {
				value: relPath,
				writable: false,
			});
			files.push(patchedFile);
		} else if (handle.kind === "directory") {
			const subFiles = await readFilesFromDirectory(
				handle as FileSystemDirectoryHandle,
				basePath ? `${basePath}/${name}` : name,
			);
			files.push(...subFiles);
		}
	}

	return files;
}

/**
 * Delete files from a directory handle by their relative paths.
 * Also cleans up empty parent directories.
 */
export async function deleteFilesFromDirectory(
	dirHandle: FileSystemDirectoryHandle,
	relativePaths: string[],
): Promise<void> {
	// Group files by their parent directory
	const dirMap = new Map<string, string[]>();
	for (const path of relativePaths) {
		const parts = path.split("/").filter(Boolean);
		const fileName = parts.pop()!;
		const parentDir = parts.join("/");
		if (!dirMap.has(parentDir)) {
			dirMap.set(parentDir, []);
		}
		dirMap.get(parentDir)!.push(fileName);
	}

	// Delete files from each directory
	for (const [dirPath, fileNames] of dirMap) {
		let currentHandle = dirHandle;
		if (dirPath) {
			const parts = dirPath.split("/");
			for (const part of parts) {
				currentHandle = await currentHandle.getDirectoryHandle(part);
			}
		}
		for (const fileName of fileNames) {
			try {
				await currentHandle.removeEntry(fileName);
			} catch {
				// File may already be deleted — ignore
			}
		}
	}

	// Clean up empty subdirectories (bottom-up)
	const allDirs = new Set<string>();
	for (const path of relativePaths) {
		const parts = path.split("/").filter(Boolean);
		parts.pop(); // remove filename
		let acc = "";
		for (const part of parts) {
			acc = acc ? `${acc}/${part}` : part;
			allDirs.add(acc);
		}
	}
	// Sort deepest first
	const sortedDirs = [...allDirs].sort(
		(a, b) => b.split("/").length - a.split("/").length,
	);
	for (const dirPath of sortedDirs) {
		try {
			const parts = dirPath.split("/");
			const parentParts = parts.slice(0, -1);
			const dirName = parts[parts.length - 1];
			let parentHandle = dirHandle;
			for (const part of parentParts) {
				parentHandle = await parentHandle.getDirectoryHandle(part);
			}
			await parentHandle.removeEntry(dirName);
		} catch {
			// Directory may not be empty or may not exist — ignore
		}
	}
}

/**
 * Recursively create subdirectories and write a file into a directory handle.
 */
async function writeFileToDirectory(
	rootHandle: FileSystemDirectoryHandle,
	relativePath: string,
	blob: Blob,
): Promise<void> {
	const parts = relativePath.split("/").filter(Boolean);
	const fileName = parts.pop() || "file";

	// Navigate/create subdirectories
	let currentHandle = rootHandle;
	for (const part of parts) {
		currentHandle = await currentHandle.getDirectoryHandle(part, {
			create: true,
		});
	}

	// Write the file
	const fileHandle = await currentHandle.getFileHandle(fileName, {
		create: true,
	});
	const writable = await fileHandle.createWritable();
	await writable.write(blob);
	await writable.close();
}

// ---- CRC-32 (for ZIP) ----

let crcTable: Uint32Array | null = null;

function crc32(data: Uint8Array): number {
	if (!crcTable) {
		crcTable = new Uint32Array(256);
		for (let i = 0; i < 256; i++) {
			let c = i;
			for (let j = 0; j < 8; j++) {
				c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
			}
			crcTable[i] = c;
		}
	}

	let crc = 0xffffffff;
	for (let i = 0; i < data.byteLength; i++) {
		crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}
