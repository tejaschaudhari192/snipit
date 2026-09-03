import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Train, FileText, Calendar, Radio, Search } from "lucide-react";
import { PnrCheckerPanel } from "./components/pnr-checker-panel";
import { TrainSchedulePanel } from "./components/train-schedule-panel";
import { TrainLiveStatusPanel } from "./components/train-live-status-panel";
import { FindTrainsBetweenPanel } from "./components/find-trains-between-panel";

const TrainsPage = () => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<
		"search" | "pnr" | "schedule" | "live"
	>("search");

	return (
		<div className="min-h-full bg-background text-foreground transition-colors duration-300">
			<section className="relative pt-6 pb-4 px-4 overflow-hidden">
				<div className="max-w-3xl mx-auto text-center relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
					<div className="flex flex-col items-center justify-center w-full">
						<div className="glow-badge mb-2">
							<Train className="w-3.5 h-3.5 fill-current" />
							{t("tools.badge")}
						</div>
						<h1 className="text-2xl sm:text-3xl font-black mb-1.5 tracking-tighter leading-tight bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground/95 to-foreground/80">
							Trains Portal
						</h1>
						<p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-lg mx-auto leading-normal">
							Find available trains between stations, check live
							PNR status, view route schedules, and track live
							trains
						</p>

						{/* Sub-navigation tabs */}
						<div className="flex flex-wrap items-center justify-center gap-2 mt-5 p-1 rounded-xl bg-muted/30 border border-border/40">
							<button
								onClick={() => setActiveTab("search")}
								className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
									activeTab === "search"
										? "bg-background text-primary shadow-sm border border-border/50 font-bold"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								<Search className="h-3.5 w-3.5 text-primary" />
								<span>Find Trains</span>
							</button>

							<button
								onClick={() => setActiveTab("pnr")}
								className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
									activeTab === "pnr"
										? "bg-background text-foreground shadow-sm border border-border/50"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								<FileText className="h-3.5 w-3.5" />
								<span>PNR Status</span>
							</button>

							<button
								onClick={() => setActiveTab("schedule")}
								className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
									activeTab === "schedule"
										? "bg-background text-foreground shadow-sm border border-border/50"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								<Calendar className="h-3.5 w-3.5" />
								<span>Train Schedule</span>
							</button>

							<button
								onClick={() => setActiveTab("live")}
								className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
									activeTab === "live"
										? "bg-background text-primary shadow-sm border border-border/50 font-bold"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								<Radio className="h-3.5 w-3.5 text-primary" />
								<span>Live Status</span>
							</button>
						</div>
					</div>
				</div>
			</section>

			<section className="pb-8 px-4 md:px-6 max-w-4xl mx-auto">
				{activeTab === "search" && <FindTrainsBetweenPanel />}
				{activeTab === "pnr" && <PnrCheckerPanel />}
				{activeTab === "schedule" && <TrainSchedulePanel />}
				{activeTab === "live" && <TrainLiveStatusPanel />}
			</section>
		</div>
	);
};

export default TrainsPage;
