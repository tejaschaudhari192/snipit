import icon from "@/assets/brand/icon.png";
import TextGradient from "@/components/text-gradient";
import { useTranslation } from "react-i18next";
import type { HealthData } from "@/types";
import {
	Database,
	HardDrive,
	Mail,
	Sparkles,
	Check,
	Loader2,
	AlertCircle,
	Cloud,
	Cpu,
	Activity,
	Terminal,
	Server,
	Lock,
	Shield,
	RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
	database: Database,
	"hard-drive": HardDrive,
	cloud: Cloud,
	mail: Mail,
	sparkles: Sparkles,
	check: Check,
	loader: Loader2,
	cpu: Cpu,
	activity: Activity,
	terminal: Terminal,
	server: Server,
	lock: Lock,
	shield: Shield,
	refresh: RefreshCw,
	alert: AlertCircle,
};

const DynamicIcon = ({
	name,
	className,
}: {
	name?: string;
	className?: string;
}) => {
	const IconComponent = ICON_MAP[name || ""] || Loader2;
	return <IconComponent className={className} />;
};

interface SplashPageProps {
	healthData?: HealthData | null;
}

const SplashPage = ({ healthData }: SplashPageProps) => {
	const { t } = useTranslation();

	const progress = healthData?.progress || 0;
	const currentLabel = healthData?.currentLabel || "Initializing...";
	const backendIcon = healthData?.icon;

	const isError = healthData?.status === "down";

	const getStepIcon = () => {
		if (isError)
			return <AlertCircle className="w-4 h-4 text-destructive" />;
		return (
			<DynamicIcon
				name={backendIcon}
				className={`w-4 h-4 transition-all duration-300 ${
					progress === 100
						? "text-green-500"
						: "text-primary animate-pulse"
				} ${!backendIcon || backendIcon === "loader" ? "animate-spin" : ""}`}
			/>
		);
	};

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

					<h1 className="text-7xl tracking-tighter font-extrabold text-transparent bg-clip-text bg-linear-to-b from-foreground via-foreground to-muted-foreground pb-2">
						Snipit
					</h1>
				</div>

				<div className="w-80 flex flex-col gap-4 mt-8">
					<div className="flex w-full justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 h-5">
						<span className="flex items-center gap-3">
							<div className="flex items-center justify-center w-6 h-6 rounded-lg bg-muted/40 border border-border/10">
								{getStepIcon()}
							</div>
							<span className={isError ? "text-destructive" : ""}>
								{isError ? (
									t("splash.system_failure")
								) : (
									<TextGradient
										highlightColor="var(--foreground)"
										baseColor="var(--muted-foreground)"
										spread={20}
										duration={2}
										className="font-medium opacity-90"
									>
										{currentLabel}
									</TextGradient>
								)}
							</span>
						</span>
						<span className="tabular-nums font-black text-foreground/80">
							{Math.floor(progress)}%
						</span>
					</div>
					<div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
						<div
							className={`h-full transition-all duration-300 ease-out rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)] ${isError ? "bg-destructive" : "bg-primary"}`}
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SplashPage;
