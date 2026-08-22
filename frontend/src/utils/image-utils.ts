/**
 * Utility functions for image manipulation and compression
 */

/**
 * Compresses an image file and returns a Base64 data URL.
 * Scales down large images to fit within maxDimension to ensure small payload size.
 *
 * @param file The image File to compress
 * @param maxDimension Maximum width/height in pixels (default: 256)
 * @param quality JPEG compression quality between 0 and 1 (default: 0.85)
 * @returns Promise resolving to the compressed Base64 data URL
 */
export const compressImageFile = (
	file: File,
	maxDimension: number = 256,
	quality: number = 0.85,
): Promise<string> => {
	return new Promise((resolve, reject) => {
		if (!file.type.startsWith("image/")) {
			return reject(new Error("File must be an image"));
		}

		const reader = new FileReader();
		reader.onerror = () => reject(new Error("Failed to read image file"));
		reader.onload = (e) => {
			const img = new Image();
			img.onerror = () => reject(new Error("Failed to load image"));
			img.onload = () => {
				const canvas = document.createElement("canvas");
				let { width, height } = img;

				if (width > height) {
					if (width > maxDimension) {
						height = Math.round((height * maxDimension) / width);
						width = maxDimension;
					}
				} else {
					if (height > maxDimension) {
						width = Math.round((width * maxDimension) / height);
						height = maxDimension;
					}
				}

				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					return reject(new Error("Canvas context is not available"));
				}

				ctx.drawImage(img, 0, 0, width, height);
				const compressedDataUrl = canvas.toDataURL(
					"image/jpeg",
					quality,
				);
				resolve(compressedDataUrl);
			};
			img.src = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	});
};
