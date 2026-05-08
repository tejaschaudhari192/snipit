import { CheckCircle2, Copy, Download, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShortenedResultCardProps {
	shortenedResult: {
		id: string;
		url: string;
	};
	setTextValue: (v: string) => void;
}

export const ShortenedResultCard = ({
	shortenedResult,
	setTextValue,
}: ShortenedResultCardProps) => {
	const { t } = useTranslation();

	const downloadQR = () => {
		const canvas = document.getElementById(
			"short-url-qr",
		) as HTMLCanvasElement;
		if (canvas) {
			const pngUrl = canvas
				.toDataURL("image/png")
				.replace("image/png", "image/octet-stream");
			const downloadLink = document.createElement("a");
			downloadLink.href = pngUrl;
			downloadLink.download = `qr-${shortenedResult.id}.png`;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			toast.success(t("messages.qr_downloaded"));
		}
	};

	const copyLink = () => {
		navigator.clipboard.writeText(shortenedResult.url);
		toast.success(
			t("header.copied_link", { id: `/${shortenedResult.id}` }),
		);
	};

	return (
		<div className="w-full max-w-xl animate-in zoom-in-95 duration-500">
			<div className="glass-card p-8 flex flex-col items-center gap-6 text-center border-primary/20 bg-primary/5">
				<div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
					<CheckCircle2 className="h-10 w-10" />
				</div>

				<div className="space-y-2">
					<h2 className="text-2xl font-black tracking-tight text-foreground">
						{t("home.link_shortened")}
					</h2>
					<p className="text-muted-foreground font-medium">
						{t("home.link_ready_desc")}
					</p>
				</div>

				<div className="flex flex-col items-center group/qr relative">
					<div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
					<div className="p-3 bg-white rounded-2xl shadow-xl shadow-primary/10 border border-primary/10 relative z-10 transition-transform hover:scale-105 duration-300">
						<QRCodeCanvas
							id="short-url-qr"
							value={shortenedResult.url}
							size={140}
							level="H"
							includeMargin={false}
						/>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="mt-4 h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-all gap-1.5"
						onClick={downloadQR}
					>
						<Download className="h-3 w-3" />
						{t("common.download_qr")}
					</Button>
				</div>

				<div className="w-full space-y-4">
					<div className="relative group/link">
						<div className="absolute -inset-0.5 bg-linear-to-r from-primary/50 to-emerald-500/50 rounded-xl blur opacity-20 group-hover/link:opacity-40 transition duration-500" />
						<div className="relative flex items-center gap-2 p-1 pl-4 bg-background border border-border/50 rounded-xl">
							<span className="flex-1 text-sm font-bold truncate text-left text-foreground/90">
								{shortenedResult.url}
							</span>
							<Button
								size="sm"
								variant="ghost"
								className="h-9 px-4 font-bold gap-2 hover:bg-primary/10 hover:text-primary transition-all"
								onClick={copyLink}
							>
								<Copy className="h-3.5 w-3.5" />
								{t("display.copy_button")}
							</Button>
						</div>
					</div>
					<div className="flex items-center justify-between px-2 text-[11px] font-bold text-muted-foreground/80 tracking-wide">
						<span>
							{t("home.alias")}: {shortenedResult.id}
						</span>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
					<Button
						className="flex-1 h-11 font-black uppercase tracking-wider shadow-lg shadow-primary/20"
						onClick={() =>
							window.open(shortenedResult.url, "_blank")
						}
					>
						<ExternalLink className="h-4 w-4 mr-2" />
						{t("common.visit_link")}
					</Button>
					<Button
						variant="outline"
						className="flex-1 h-11 font-bold border-border/50 bg-background/50 backdrop-blur-sm"
						onClick={() => setTextValue("")}
					>
						{t("home.create_another")}
					</Button>
				</div>
			</div>
		</div>
	);
};
