import { toast } from "@/components/ui/toast";
import { CONFIG } from "@/configurations";

/**
 * Downloads a YouTube video's audio as an MP3 file by resolving the download URL on our CORS-free backend.
 *
 * @param videoId The YouTube video ID.
 * @param title The title of the track.
 * @param quality The audio bitrate ("128" | "320").
 */
export const downloadTrack = async (
	videoId: string,
	title: string,
	quality: "128" | "320" = "128",
): Promise<void> => {
	toast.add({ title: "Requesting secure audio download...", type: "info" });
	try {
		const response = await fetch(
			`${CONFIG.apiBaseUrl}/music/download?v=${encodeURIComponent(videoId)}&q=${quality}`,
		);

		if (!response.ok) {
			throw new Error("Backend failed to resolve download URL");
		}

		const data = await response.json();
		if (data.url) {
			toast.add({
				title:
					"Download link resolved successfully! Starting download...", type: "success"
			});

			// Open the resolved direct URL to trigger browser download / redirect
			const a = document.createElement("a");
			a.href = data.url;
			a.target = "_blank";
			a.rel = "noopener noreferrer";
			a.download = `${title}.mp3`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} else {
			throw new Error("No download URL returned from backend");
		}
	} catch (error) {
		console.error("Failed to download audio via backend proxy:", error);
		toast.add({ title: "Download failed. Directing to web browser download...", type: "error" });
		try {
			// Instant fallback direct open if backend proxy call failed
			window.open(
				`https://api.vevioz.com/apis/single/mp3?url=https://www.youtube.com/watch?v=${videoId}`,
				"_blank",
			);
		} catch {
			toast.add({
				title:
					"All download engines are busy. Please try again later.", type: "error"
			});
		}
	}
};
