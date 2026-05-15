/**
 * Utility functions for exporting content in various formats (PDF, Text, etc.)
 */

/**
 * Generates a PDF of the raw code/text content using jsPDF.
 */
export const exportToCodePdf = async (content: string, fileName: string) => {
	const { jsPDF } = await import("jspdf");

	const doc = new jsPDF({
		orientation: "landscape",
		unit: "mm",
		format: "a4",
	});

	doc.setFont("courier");
	doc.setFontSize(7);

	const margin = 10;
	const pageWidth = doc.internal.pageSize.getWidth();
	const maxWidth = pageWidth - margin * 2;
	const lines = doc.splitTextToSize(content, maxWidth);
	const lineHeight = 3.5;
	const pageHeight = doc.internal.pageSize.getHeight();
	let cursorY = margin;

	lines.forEach((line: string) => {
		if (cursorY + lineHeight > pageHeight - margin) {
			doc.addPage();
			cursorY = margin;
		}
		doc.text(line, margin, cursorY);
		cursorY += lineHeight;
	});

	doc.save(`${fileName}.pdf`);
};

/**
 * Triggers the browser's print dialog for a specific element (MD Preview).
 * This is the most reliable way to preserve styles and special characters.
 */
export const exportToPreviewPdf = (elementId: string, fileName: string) => {
	const element = document.getElementById(elementId);
	if (!element) return;

	const printWindow = window.open("", "_blank");
	if (!printWindow) return;

	// Capture all styles from the current document
	const styles = Array.from(document.styleSheets)
		.map((styleSheet) => {
			try {
				return Array.from(styleSheet.cssRules)
					.map((rule) => rule.cssText)
					.join("");
			} catch {
				return "";
			}
		})
		.join("\n");

	printWindow.document.write(`
		<html>
			<head>
				<title>Snipit - ${fileName}</title>
				<style>
					${styles}
					body { 
						background: white !important; 
						color: black !important; 
						padding: 40px !important;
					}
					#${elementId} {
						box-shadow: none !important;
						border: none !important;
						background: transparent !important;
						width: 100% !important;
						max-width: none !important;
						padding: 0 !important;
					}
					@page {
						margin: 20mm;
					}
				</style>
			</head>
			<body>
				<div id="${elementId}" class="prose max-w-none">
					${element.innerHTML}
				</div>
				<script>
					window.onload = () => {
						setTimeout(() => {
							window.print();
							window.close();
						}, 500);
					};
				</script>
			</body>
		</html>
	`);
	printWindow.document.close();
};

/**
 * Generic file download helper for text-based formats.
 */
export const downloadFile = (
	content: string,
	fileName: string,
	extension: string,
) => {
	const blob = new Blob([content], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${fileName}.${extension}`;
	a.click();
	URL.revokeObjectURL(url);
};
