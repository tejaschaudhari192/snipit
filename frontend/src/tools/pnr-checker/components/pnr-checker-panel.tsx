import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Loader2, Train, Search, MapPin, Clock, Users } from "lucide-react";

interface PnrData {
	pnr: string;
	train: string;
	class: string;
	from: string;
	to: string;
	departure: string;
	arrival: string;
	status1: string;
	status2: string;
	status3: string;
	status4: string;
}

const PNR_API_BASE =
	"https://script.google.com/macros/s/AKfycbyMKD4_ctvENrS1PBfJLcnZHJOM_SrA9bFyAdUPyQL1Oanx7OedKwjUXjYyI1ymhpNa/exec";

export const PnrCheckerPanel = () => {
	const { t } = useTranslation();
	const [pnrInput, setPnrInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<PnrData | null>(null);

	const checkPNR = useCallback(async () => {
		const pnr = pnrInput.trim();
		if (!pnr) {
			setError(t("tools.pnr_checker_enter_pnr"));
			return;
		}

		if (!/^\d{10}$/.test(pnr)) {
			setError(t("tools.pnr_checker_invalid_pnr"));
			return;
		}

		setLoading(true);
		setError(null);
		setData(null);

		try {
			const url = `${PNR_API_BASE}?pnr=${encodeURIComponent(pnr)}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(t("tools.pnr_checker_api_error"));
			}
			const result: PnrData = await response.json();

			if ("error" in result && result.error) {
				setError(result.error as unknown as string);
				return;
			}

			setData(result);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: t("tools.pnr_checker_api_error"),
			);
		} finally {
			setLoading(false);
		}
	}, [pnrInput, t]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			checkPNR();
		}
	};

	const renderPassengerStatus = (num: number, status: string) => {
		if (!status) return null;

		const isConfirmed =
			status.toLowerCase().includes("confirm") ||
			status.toLowerCase().includes("cnf");
		const isRac = status.toLowerCase().includes("rac");
		const isWl = status.toLowerCase().includes("wl");

		let variant: "default" | "secondary" | "destructive" | "outline" =
			"default";
		if (isConfirmed) variant = "default";
		else if (isRac) variant = "secondary";
		else if (isWl) variant = "destructive";
		else variant = "outline";

		return (
			<div
				key={`passenger-${num}`}
				className="flex justify-between items-center py-2"
			>
				<span className="text-sm font-medium text-muted-foreground">
					{t("tools.pnr_checker_passenger", { number: num })}
				</span>
				<Badge variant={variant} className="text-xs font-semibold">
					{status}
				</Badge>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Input Section */}
			<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl">
				<CardContent className="p-6 space-y-4">
					<div className="space-y-2">
						<Label
							htmlFor="pnr-input"
							className="text-sm font-semibold"
						>
							{t("tools.pnr_checker_label")}
						</Label>
						<div className="flex gap-2">
							<Input
								id="pnr-input"
								type="text"
								inputMode="numeric"
								pattern="\d*"
								maxLength={10}
								placeholder={t("tools.pnr_checker_placeholder")}
								value={pnrInput}
								onChange={(e) =>
									setPnrInput(
										e.target.value.replace(/\D/g, ""),
									)
								}
								onKeyDown={handleKeyDown}
								disabled={loading}
								className="flex-1 h-11 text-base"
							/>
							<Button
								onClick={checkPNR}
								disabled={loading || !pnrInput.trim()}
								className="h-11 px-6 gap-2"
							>
								{loading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Search className="h-4 w-4" />
								)}
								{t("tools.pnr_checker_check")}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Error */}
			{error && (
				<Card className="border-destructive/30 bg-destructive/5 backdrop-blur-xl">
					<CardContent className="p-4 text-destructive text-sm font-medium">
						{error}
					</CardContent>
				</Card>
			)}

			{/* Result */}
			{data && (
				<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden">
					<CardContent className="p-6 space-y-5">
						{/* Train Info */}
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Train className="h-5 w-5 text-primary shrink-0" />
								<h2 className="text-xl font-bold text-foreground">
									{data.train}
								</h2>
							</div>
							<div className="flex items-center gap-2 ml-7">
								<Badge variant="secondary" className="text-xs">
									{data.class}
								</Badge>
								<Badge
									variant="outline"
									className="text-xs font-mono"
								>
									PNR: {data.pnr}
								</Badge>
							</div>
						</div>

						<Separator />

						{/* Route */}
						<div className="flex justify-between items-center gap-4">
							<div className="flex-1 text-left">
								<div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
									<Clock className="h-3.5 w-3.5 text-primary" />
									{data.departure}
								</div>
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
									<MapPin className="h-3.5 w-3.5" />
									{data.from}
								</div>
							</div>

							<div className="text-muted-foreground text-lg font-light px-2">
								→
							</div>

							<div className="flex-1 text-right">
								<div className="flex items-center justify-end gap-1.5 text-sm font-semibold text-foreground">
									<Clock className="h-3.5 w-3.5 text-primary" />
									{data.arrival}
								</div>
								<div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground mt-1">
									<MapPin className="h-3.5 w-3.5" />
									{data.to}
								</div>
							</div>
						</div>

						<Separator />

						{/* Passenger Status */}
						<div className="space-y-1">
							<div className="flex items-center gap-2 mb-3">
								<Users className="h-4 w-4 text-primary" />
								<span className="text-sm font-semibold text-foreground">
									{t("tools.pnr_checker_booking_status")}
								</span>
							</div>
							{renderPassengerStatus(1, data.status1)}
							{renderPassengerStatus(2, data.status2)}
							{renderPassengerStatus(3, data.status3)}
							{renderPassengerStatus(4, data.status4)}
							{!data.status1 && (
								<p className="text-sm text-muted-foreground italic">
									{t("tools.pnr_checker_no_status")}
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
