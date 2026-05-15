import { FileDisplayCard } from "./file-display-card";
import type { PasteData, FileAttachment } from "@/types";

interface FileDisplayProps {
	paste: PasteData;
	contentRef: (node: HTMLElement | null) => void;
}

export const FileDisplay = ({ paste, contentRef }: FileDisplayProps) => {
	const files: FileAttachment[] =
		paste.files && paste.files.length > 0
			? paste.files
			: paste.fileUrl
				? [
						{
							url: paste.fileUrl,
							name: paste.fileName!,
							size: paste.fileSize!,
							mimeType: paste.fileMimeType!,
						},
					]
				: [];

	return (
		<div
			ref={contentRef}
			className="w-full h-full overflow-y-auto py-12 px-6 flex flex-col items-center"
		>
			<div className="flex flex-row flex-wrap justify-center gap-8 max-w-7xl mx-auto">
				{files.map((file, index) => (
					<FileDisplayCard key={index} file={file} />
				))}
			</div>
		</div>
	);
};
