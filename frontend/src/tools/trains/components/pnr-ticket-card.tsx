import React from "react";
import { useTranslation } from "react-i18next";
import type { PnrData } from "../types/trains";
import { downloadPnrTicketPng } from "../lib/download-ticket";
import { toast } from "@/components/ui/toast";
import { PnrTicketHeaderBanner } from "./pnr-ticket-header-banner";
import { PnrTicketRouteDetails } from "./pnr-ticket-route-details";
import { PnrTicketPassengerList } from "./pnr-ticket-passenger-list";

interface PnrTicketCardProps {
	data: PnrData;
	onViewRoute?: () => void;
}

export const PnrTicketCard: React.FC<PnrTicketCardProps> = ({
	data,
	onViewRoute,
}) => {
	const { t } = useTranslation();
	const [downloading, setDownloading] = React.useState(false);

	const handleDownload = async () => {
		try {
			setDownloading(true);
			toast.add({
				title: t("tools.pnr_checker.ticket_downloading"),
				type: "info",
			});
			await downloadPnrTicketPng(data);
			toast.add({
				title: t("tools.pnr_checker.ticket_downloaded"),
				type: "success",
			});
		} catch (err: unknown) {
			console.error("Ticket download error:", err);
			toast.add({
				title: t("tools.pnr_checker.ticket_download_failed"),
				type: "error",
			});
		} finally {
			setTimeout(() => setDownloading(false), 800);
		}
	};

	return (
		<div className="relative rounded-3xl border-2 border-primary/20 bg-linear-to-b from-card via-card/95 to-card/90 shadow-xl overflow-hidden backdrop-blur-md transition-all">
			{/* Top Ticket Header Banner */}
			<PnrTicketHeaderBanner
				train={data.train}
				trainNumber={data.trainNumber}
				travelClass={data.class}
				downloading={downloading}
				onViewRoute={onViewRoute}
				onDownload={handleDownload}
			/>

			{/* Middle Journey Route with Notches */}
			<PnrTicketRouteDetails
				from={data.from}
				to={data.to}
				pnr={data.pnr}
				departure={data.departure}
				arrival={data.arrival}
				departureDate={data.departureDate}
				arrivalDate={data.arrivalDate}
				date={data.date}
				duration={data.duration}
			/>

			{/* Perforated Divider Line */}
			<div className="relative flex items-center justify-between border-t-2 border-dashed border-border/60 my-0">
				<div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-background border-r-2 border-primary/20" />
				<div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-background border-l-2 border-primary/20" />
			</div>

			{/* Passenger Boarding Details Stub */}
			<PnrTicketPassengerList passengers={data.passengers} />
		</div>
	);
};
