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
			<section className="relative pt-6 pb-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
				<div className="max-w-4xl mx-auto text-center relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
					<div className="flex flex-col items-center justify-center w-full">
						<div className="glow-badge mb-2.5 text-xs sm:text-sm">
							<Train className="w-4 h-4 fill-current" />
							{t("tools.badge")}
						</div>
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 tracking-tight leading-tight bg-clip-text text-transparent bg-linear-to-r from-foreground via-foreground/95 to-foreground/80">
							{t("tools.pnr_checker.title")}
						</h1>
						<p className="text-sm sm:text-base text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
							{t("tools.pnr_checker.subtitle")}
						</p>

						{/* Sub-navigation tabs */}
						<div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 p-1.5 rounded-2xl bg-muted/40 border border-border/50 shadow-xs">
							<button
								onClick={() => setActiveTab("search")}
								className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
									activeTab === "search"
										? "bg-background text-primary shadow-sm border border-border/60"
										: "text-muted-foreground hover:text-foreground hover:bg-background/40"
								}`}
							>
								<Search className="h-4 w-4 text-primary" />
								<span>
									{t("tools.pnr_checker.find_trains")}
								</span>
							</button>

							<button
								onClick={() => setActiveTab("pnr")}
								className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
									activeTab === "pnr"
										? "bg-background text-foreground shadow-sm border border-border/60"
										: "text-muted-foreground hover:text-foreground hover:bg-background/40"
								}`}
							>
								<FileText className="h-4 w-4 text-primary" />
								<span>
									{t("tools.pnr_checker.input_label")}
								</span>
							</button>

							<button
								onClick={() => setActiveTab("schedule")}
								className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
									activeTab === "schedule"
										? "bg-background text-foreground shadow-sm border border-border/60"
										: "text-muted-foreground hover:text-foreground hover:bg-background/40"
								}`}
							>
								<Calendar className="h-4 w-4 text-primary" />
								<span>
									{t("tools.pnr_checker.schedule_search")}
								</span>
							</button>

							<button
								onClick={() => setActiveTab("live")}
								className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
									activeTab === "live"
										? "bg-background text-primary shadow-sm border border-border/60"
										: "text-muted-foreground hover:text-foreground hover:bg-background/40"
								}`}
							>
								<Radio className="h-4 w-4 text-primary" />
								<span>
									{t("tools.pnr_checker.live_status_tab")}
								</span>
							</button>
						</div>
					</div>
				</div>
			</section>

			<section className="pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
				{activeTab === "search" && <FindTrainsBetweenPanel />}
				{activeTab === "pnr" && <PnrCheckerPanel />}
				{activeTab === "schedule" && <TrainSchedulePanel />}
				{activeTab === "live" && <TrainLiveStatusPanel />}
			</section>
		</div>
	);
};

export default TrainsPage;
