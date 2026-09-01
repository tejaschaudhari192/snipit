import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Train, Search, MapPin, Clock, Users, FileCheck2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Passenger {
	number: number;
	name: string;
	status: string;
	bookingStatus?: string;
}

interface PnrData {
	pnr: string;
	train: string;
	class: string;
	from: string;
	to: string;
	departure: string;
	arrival: string;
	chartStatus?: string;
	passengers: Passenger[];
	error?: string;
}

const PNR_API_BASE =
	"https://script.google.com/macros/s/AKfycbxUYR4y9Jj9W6k_xqYTIRVewXQPcxfdP-jvj3TWrLWUqU9smyrfaAMEGkaHGQdRdFsh/exec";

export const PnrCheckerPanel: React.FC = () => {
	const { t } = useTranslation();
	const [pnrInput, setPnrInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<PnrData | null>(null);

	const checkPNR = useCallback(async () => {
		const pnr = pnrInput.trim();
		if (!pnr) {
			setError(t("tools.pnr_checker.enter_pnr", "Please enter a PNR number"));
			return;
		}

		if (!/^\d{10}$/.test(pnr)) {
			setError(t("tools.pnr_checker.invalid_pnr", "PNR must be exactly 10 digits"));
			return;
		}

		setLoading(true);
		setError(null);
		setData(null);

		try {
			const url = `${PNR_API_BASE}?pnr=${encodeURIComponent(pnr)}`;
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(t("tools.pnr_checker.api_error", "Failed to communicate with service"));
			}

			const result: PnrData = await response.json();

			if (result.error) {
				setError(result.error);
				return;
			}

			setData(result);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: t("tools.pnr_checker.api_error", "Failed to fetch PNR status"),
			);
		} finally {
			setLoading(false);
		}
	}, [pnrInput, t]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			checkPNR();
		}
	};

	const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
		const s = status.toLowerCase();
		if (s.includes("confirm") || s.includes("cnf")) return "default";
		if (s.includes("rac")) return "secondary";
		if (s.includes("wl") || s.includes("wait")) return "destructive";
		return "outline";
	};

	return (
		<div className="space-y-6">
			{/* Input Section */}
			<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl">
				<CardContent className="p-6 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="pnr-input" className="text-sm font-semibold">
							{t("tools.pnr_checker.label", "Enter 10-digit PNR Number")}
						</Label>
						<div className="flex gap-2">
							<Input
								id="pnr-input"
								type="text"
								inputMode="numeric"
								pattern="\d*"
								maxLength={10}
								placeholder={t("tools.pnr_checker.placeholder", "e.g. 4556055697")}
								value={pnrInput}
								onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ""))}
								onKeyDown={handleKeyDown}
								disabled={loading}
								className="flex-1 h-11 text-base font-mono tracking-wider"
							/>
							<Button
								onClick={checkPNR}
								disabled={loading || pnrInput.trim().length !== 10}
								className="h-11 px-6 gap-2"
							>
								{loading ? (
									<Spinner className="h-4 w-4 animate-spin" />
								) : (
									<Search className="h-4 w-4" />
								)}
								{t("tools.pnr_checker.check", "Check")}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Error Box */}
			{error && (
				<Card className="border-destructive/30 bg-destructive/5 backdrop-blur-xl">
					<CardContent className="p-4 text-destructive text-sm font-medium">
						{error}
					</CardContent>
				</Card>
			)}

			{/* Result Card */}
			{data && (
				<Card className="border-border/50 bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden">
					<CardContent className="p-6 space-y-5">
						{/* Train Header Info */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<Train className="h-5 w-5 text-primary shrink-0" />
									<h2 className="text-xl font-bold text-foreground">
										{data.train}
									</h2>
								</div>
								<div className="flex flex-wrap items-center gap-2 ml-7">
									<Badge variant="secondary" className="text-xs">
										{data.class}
									</Badge>
									<Badge variant="outline" className="text-xs font-mono">
										PNR: {data.pnr}
									</Badge>
								</div>
							</div>

							{data.chartStatus && (
								<div className="flex items-center gap-1.5 self-start sm:self-center ml-7 sm:ml-0 text-xs font-medium text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg">
									<FileCheck2 className="h-4 w-4 text-primary" />
									<span>{data.chartStatus}</span>
								</div>
							)}
						</div>

						<Separator />

						{/* Route Schedule */}
						<div className="flex justify-between items-center gap-4">
							<div className="flex-1 text-left">
								<div className="flex items-center gap-1.5 text-base font-semibold text-foreground">
									<Clock className="h-3.5 w-3.5 text-primary" />
									{data.departure || "--:--"}
								</div>
								<div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
									<MapPin className="h-3.5 w-3.5" />
									{data.from || "Source"}
								</div>
							</div>

							<div className="text-muted-foreground text-xl font-light px-2">
								→
							</div>

							<div className="flex-1 text-right">
								<div className="flex items-center justify-end gap-1.5 text-base font-semibold text-foreground">
									<Clock className="h-3.5 w-3.5 text-primary" />
									{data.arrival || "--:--"}
								</div>
								<div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground mt-1">
									<MapPin className="h-3.5 w-3.5" />
									{data.to || "Destination"}
								</div>
							</div>
						</div>

						<Separator />

						{/* Dynamic Passenger List */}
						<div className="space-y-3">
							<div className="flex items-center gap-2 mb-2">
								<Users className="h-4 w-4 text-primary" />
								<span className="text-sm font-semibold text-foreground">
									{t("tools.pnr_checker.booking_status", "Passenger Status")}
								</span>
							</div>

							{data.passengers && data.passengers.length > 0 ? (
								<div className="divide-y divide-border/40">
									{data.passengers.map((passenger) => (
										<div
											key={`pax-${passenger.number}`}
											className="flex justify-between items-center py-2.5"
										>
											<div className="flex flex-col">
												<span className="text-sm font-medium text-foreground">
													{passenger.name ||
														t("tools.pnr_checker.passenger", {
															number: passenger.number,
															defaultValue: `Passenger ${passenger.number}`,
														})}
												</span>
												{passenger.bookingStatus && (
													<span className="text-xs text-muted-foreground">
														Booking: {passenger.bookingStatus}
													</span>
												)}
											</div>
											<Badge
												variant={getStatusVariant(passenger.status)}
												className="text-xs font-semibold px-2.5 py-1"
											>
												{passenger.status}
											</Badge>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground italic">
									{t("tools.pnr_checker.no_status", "No passenger status details available")}
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
