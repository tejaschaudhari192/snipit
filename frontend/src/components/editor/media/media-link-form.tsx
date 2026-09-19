import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MediaLinkFormProps {
	type: "image" | "video" | "attachment";
	onSubmit: (url: string) => void;
}

export function MediaLinkForm({ type, onSubmit }: MediaLinkFormProps) {
	const [linkUrl, setLinkUrl] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!linkUrl.trim()) return;
		onSubmit(linkUrl.trim());
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<Input
				type="text"
				placeholder={
					type === "image"
						? "https://example.com/image.jpg"
						: type === "video"
							? "https://youtube.com/watch?v=..."
							: "https://example.com/document.pdf"
				}
				value={linkUrl}
				onChange={(e) => setLinkUrl(e.target.value)}
				className="w-full h-9"
				autoFocus
			/>

			<Button
				disabled={!linkUrl.trim()}
				className="w-full h-9 cursor-pointer"
				type="submit"
			>
				Embed Link
			</Button>
		</form>
	);
}
