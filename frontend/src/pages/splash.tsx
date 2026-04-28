import { useEffect, useState } from "react";
import icon from "@/assets/brand/icon.png";
import { ShimmerSection } from "@/components/common/shimmer-section";
import { useTranslation } from "react-i18next";
import { HealthData, ServiceStatus } from "@/types";

interface SplashPageProps {
	healthData?: HealthData | null;
}

const steps = [
	{ id: "database", label: "Connecting to Database..." },
	{ id: "supabase", label: "Checking Supabase..." },
	{ id: "smtp", label: "Verifying Mail Server..." },
	{ id: "ready", label: "Starting Snipit..." },
];

const SplashPage = ({ healthData }: SplashPageProps) => {
	useTranslation();
	const [progress, setProgress] = useState(0);
	const [currentStep, setCurrentStep] = useState(0);

	useEffect(() => {
		// Progress simulation logic based on healthData
		const totalSteps = steps.length;
		let stepIndex = 0;

		const interval = setInterval(() => {
			if (stepIndex < totalSteps) {
				const step = steps[stepIndex];
				const serviceStatus =
					healthData?.services?.[
						step?.id as keyof typeof healthData.services
					];

				if (serviceStatus) {
					if (serviceStatus.status === "ok") {
						setProgress(((stepIndex + 1) / totalSteps) * 100);
						stepIndex++;
						setCurrentStep(stepIndex);
					} else {
						// Service error, stop progress
						clearInterval(interval);
						setProgress((stepIndex / totalSteps) * 100);
					}
				} else if (stepIndex === totalSteps - 1) {
					// Final step
					setProgress(100);
					clearInterval(interval);
				} else {
					// Still waiting for data or intermediate progress
					setProgress((prev) =>
						Math.min(
							prev + 0.5,
							(stepIndex / totalSteps) * 100 + 20,
						),
					);
				}
			}
		}, 100);

		return () => clearInterval(interval);
	}, [healthData]);

	const currentLabel = steps[Math.min(currentStep, steps.length - 1)]?.label;
	const isError =
		healthData?.status === "down" ||
		Object.values(healthData?.services || {}).some(
			(s) => s.status === "error",
		);

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
									? "System failure detected"
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

					{/* Service Status Details */}
					<div className="mt-6 flex flex-col gap-2 bg-muted/30 p-4 rounded-xl border border-muted backdrop-blur-sm shadow-sm">
						{Object.entries(healthData?.services || {}).map(
							([key, service]: [string, ServiceStatus]) => (
								<div
									key={key}
									className="flex items-center justify-between"
								>
									<span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
										{key}
									</span>
									<div className="flex items-center gap-2">
										<span
											className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
												service.status === "ok"
													? "bg-primary/10 text-primary border border-primary/20"
													: "bg-destructive/10 text-destructive border border-destructive/20"
											}`}
										>
											{service.status === "ok"
												? "Connected"
												: "Error"}
										</span>
									</div>
								</div>
							),
						)}
						{!healthData && (
							<div className="flex items-center justify-center py-2">
								<span className="text-[10px] text-muted-foreground animate-pulse">
									Initializing health probe...
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SplashPage;
