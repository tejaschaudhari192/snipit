import type { DragEvent } from "react";

/**
 * Traverses drop items recursively to extract full file trees from drag-and-drop actions.
 */
export async function getFilesFromDragEvent(
	e: DragEvent<HTMLDivElement>,
): Promise<File[]> {
	const items = Array.from(e.dataTransfer.items);
	const filesPromises = items.map(async (item) => {
		if (item.kind !== "file") return [];
		if (typeof item.webkitGetAsEntry === "function") {
			const entry = item.webkitGetAsEntry();
			if (entry) {
				return readEntry(entry);
			}
		}
		const file = item.getAsFile();
		return file ? [file] : [];
	});
	const results = await Promise.all(filesPromises);
	return results.flat();
}

/**
 * Reads a FileSystemEntry recursively.
 */
export async function readEntry(
	entry: FileSystemEntry,
	path = "",
): Promise<File[]> {
	if (entry.isFile) {
		const fileEntry = entry as FileSystemFileEntry;
		return new Promise((resolve) => {
			fileEntry.file((file: File) => {
				const relPath = path ? `${path}/${file.name}` : file.name;
				const patchedFile = new File([file], file.name, {
					type: file.type,
				});
				Object.defineProperty(patchedFile, "webkitRelativePath", {
					value: relPath,
					writable: false,
				});
				resolve([patchedFile]);
			});
		});
	} else if (entry.isDirectory) {
		const dirEntry = entry as FileSystemDirectoryEntry;
		const reader = dirEntry.createReader();
		const entries = await new Promise<FileSystemEntry[]>((resolve) => {
			reader.readEntries(resolve);
		});
		const files: File[] = [];
		for (const child of entries) {
			const childFiles = await readEntry(
				child,
				path ? `${path}/${entry.name}` : entry.name,
			);
			files.push(...childFiles);
		}
		return files;
	}
	return [];
}

/**
 * Formats byte numbers into human readable units (Bytes, KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
