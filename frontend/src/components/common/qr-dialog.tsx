import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, Download } from "lucide-react";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QRDialogProps {
	url: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export const QRDialog = ({ url, isOpen, onOpenChange }: QRDialogProps) => {
	const { t } = useTranslation();

	const downloadQR = () => {
		const canvas = document.getElementById(
			"dialog-qr",
		) as HTMLCanvasElement;
		if (canvas) {
			const pngUrl = canvas
				.toDataURL("image/png")
				.replace("image/png", "image/octet-stream");
			const downloadLink = document.createElement("a");
			downloadLink.href = pngUrl;
			downloadLink.download = `qr-code.png`;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			toast.success(t("messages.qr_downloaded"));
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md border border-border/50 bg-background/60 backdrop-blur-2xl shadow-2xl rounded-2xl ring-1 ring-white/5 overflow-hidden">
				<DialogHeader>
					<div className="flex items-center gap-2 mb-1">
						<div className="p-2 rounded-lg bg-primary/10 text-primary">
							<QrCode className="h-5 w-5" />
						</div>
						<DialogTitle>{t("header.qr_button")}</DialogTitle>
					</div>
					<p className="text-sm text-muted-foreground">
						{t("header.qr_scan_desc")}
					</p>
				</DialogHeader>
				<div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-inner my-4 relative group">
					<QRCodeCanvas
						id="dialog-qr"
						value={url}
						size={200}
						level="H"
						includeMargin={true}
					/>
					<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-xl">
						<CopyButton
							content={url}
							variant="outline"
							className="bg-background shadow-lg scale-125"
						/>
					</div>
				</div>
				<div className="text-center text-xs text-muted-foreground break-all px-4 mb-4">
					{url}
				</div>
				<DialogFooter className="sm:justify-center border-t border-border/10 pt-4 mt-2">
					<Button
						variant="outline"
						className="w-full sm:w-auto font-black uppercase tracking-wider gap-2 shadow-lg"
						onClick={downloadQR}
					>
						<Download className="h-4 w-4" />
						{t("common.download_qr")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
