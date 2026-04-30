import icon from "@/assets/brand/icon.png";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { useTranslation } from "react-i18next";
import type { HealthData } from "@/types";

interface SplashPageProps {
	healthData?: HealthData | null;
}

const SplashPage = ({ healthData }: SplashPageProps) => {
	const { t } = useTranslation();

	const progress = healthData?.progress || 0;
	const currentLabel = healthData?.currentLabel || "Initializing...";

	const isError = healthData?.status === "down";

	return (
		<div className="relative h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300 flex flex-col items-center justify-center pointer-events-none">
			<div className="relative z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
				<div className="flex flex-col items-center justify-center mb-6">
					<div className="relative flex items-center justify-center w-32 h-32 mb-8">
						<img
							src={icon}
							alt="Snipit logo"
							className="relative z-10 h-20 w-20 drop-shadow-md transition-transform hover:scale-105 duration-300"
						/>
					</div>

					<h1 className="text-7xl tracking-tighter font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground to-muted-foreground pb-2">
						Snipit
					</h1>
				</div>

				<div className="w-80 flex flex-col gap-4 mt-8">
					<div className="flex w-full justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 h-4">
						<span className="flex items-center gap-2">
							{!isError && (
								<ShimmerSection
									type="mini-loader"
									className="w-3.5 h-3.5"
								/>
							)}
							<span
								className={
									isError
										? "text-destructive"
										: "animate-pulse"
								}
							>
								{isError
									? t("splash.system_failure")
									: currentLabel}
							</span>
						</span>
						<span className="tabular-nums">
							{Math.floor(progress)}%
						</span>
					</div>
					<div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
						<div
							className={`h-full transition-all duration-300 ease-out rounded-full ${isError ? "bg-destructive" : "bg-primary"}`}
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SplashPage;
