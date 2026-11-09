import { cn } from "cn";
import { useTranslation } from "react-i18next";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

interface SecurityGaugeProps {
	score: number; // 0 - 100
	status: "excellent" | "good" | "warning" | "critical";
	totalEvaluated: number;
	className?: string;
}

export function SecurityGauge({
	score,
	status,
	totalEvaluated,
	className,
}: SecurityGaugeProps) {
	const { t } = useTranslation();

	// Circular gauge stroke calculations
	const size = 140;
	const strokeWidth = 10;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (score / 100) * circumference;

	const getStatusConfig = () => {
		switch (status) {
			case "excellent":
				return {
					color: "text-emerald-500",
					strokeColor: "#10b981",
					bgStroke: "rgba(16, 185, 129, 0.15)",
					label: t(
						"tools.password_manager.dashboard_view.gauge.excellent_label",
					),
					desc: t(
						"tools.password_manager.dashboard_view.gauge.excellent_desc",
					),
					icon: ShieldCheck,
				};
			case "good":
				return {
					color: "text-blue-500",
					strokeColor: "#3b82f6",
					bgStroke: "rgba(59, 130, 246, 0.15)",
					label: t(
						"tools.password_manager.dashboard_view.gauge.good_label",
					),
					desc: t(
						"tools.password_manager.dashboard_view.gauge.good_desc",
					),
					icon: ShieldCheck,
				};
			case "warning":
				return {
					color: "text-amber-500",
					strokeColor: "#f59e0b",
					bgStroke: "rgba(245, 158, 11, 0.15)",
					label: t(
						"tools.password_manager.dashboard_view.gauge.warning_label",
					),
					desc: t(
						"tools.password_manager.dashboard_view.gauge.warning_desc",
					),
					icon: AlertTriangle,
				};
			case "critical":
			default:
				return {
					color: "text-rose-500",
					strokeColor: "#f43f5e",
					bgStroke: "rgba(244, 63, 94, 0.15)",
					label: t(
						"tools.password_manager.dashboard_view.gauge.critical_label",
					),
					desc: t(
						"tools.password_manager.dashboard_view.gauge.critical_desc",
					),
					icon: ShieldAlert,
				};
		}
	};

	const config = getStatusConfig();
	const Icon = config.icon;

	return (
		<div
			className={cn(
				"flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-card border border-border/70 shadow-xs",
				className,
			)}
		>
			{/* Circular Gauge */}
			<div className="relative shrink-0 flex items-center justify-center">
				<svg
					width={size}
					height={size}
					className="transform -rotate-90 origin-center"
				>
					{/* Background Circle */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke={config.bgStroke}
						strokeWidth={strokeWidth}
						fill="transparent"
					/>
					{/* Progress Circle */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke={config.strokeColor}
						strokeWidth={strokeWidth}
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						strokeLinecap="round"
						fill="transparent"
						className="transition-all duration-1000 ease-out"
					/>
				</svg>

				{/* Center Content */}
				<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
					<span className="text-3xl font-extrabold text-foreground tracking-tight">
						{score}
						<span className="text-sm font-semibold text-muted-foreground">
							%
						</span>
					</span>
					<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						{t("tools.password_manager.dashboard_view.gauge.score")}
					</span>
				</div>
			</div>

			{/* Health Description & Status */}
			<div className="flex-1 text-center sm:text-left space-y-1.5">
				<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted/60 border border-border/80">
					<Icon className={cn("w-3.5 h-3.5", config.color)} />
					<span className={config.color}>{config.label}</span>
				</div>

				<h3 className="text-lg font-bold text-foreground">
					{t(
						"tools.password_manager.dashboard_view.gauge.rating_title",
					)}
				</h3>
				<p className="text-xs text-muted-foreground leading-relaxed max-w-md">
					{config.desc}
				</p>

				<div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground justify-center sm:justify-start">
					<span>
						<strong className="text-foreground font-semibold">
							{totalEvaluated}
						</strong>{" "}
						{t(
							"tools.password_manager.dashboard_view.gauge.passwords_audited",
							{
								count: totalEvaluated,
							},
						)}
					</span>
					<span>•</span>
					<span>
						{t(
							"tools.password_manager.dashboard_view.gauge.zero_knowledge_verification",
						)}
					</span>
				</div>
			</div>
		</div>
	);
}
