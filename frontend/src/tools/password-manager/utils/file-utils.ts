export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES =
	".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg";

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileSizeFromBase64(
	base64: string | null | undefined,
): number {
	if (!base64) return 0;
	const data = base64.split(",")[1] ?? base64;
	return Math.round((data.length * 3) / 4);
}

export function isValidFileType(
	fileName: string,
	acceptedTypes: string = ACCEPTED_FILE_TYPES,
): boolean {
	if (!acceptedTypes) return true;
	const extension = `.${fileName.split(".").pop()?.toLowerCase()}`;
	const allowed = acceptedTypes.split(",").map((t) => t.trim().toLowerCase());
	return allowed.includes(extension);
}

export function downloadBase64File(
	fileName: string = "download",
	fileContent: string,
): void {
	if (!fileContent) return;
	try {
		const base64 = fileContent.split(",")[1] ?? fileContent;
		const byteCharacters = atob(base64);
		const byteNumbers = new Array(byteCharacters.length);
		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i);
		}
		const byteArray = new Uint8Array(byteNumbers);
		const mimeType =
			fileContent.split(";")[0]?.split(":")[1] ??
			"application/octet-stream";
		const blob = new Blob([byteArray], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	} catch {
		const url = fileContent.startsWith("data:")
			? fileContent
			: `data:application/octet-stream;base64,${fileContent}`;
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}
