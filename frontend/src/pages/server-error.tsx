import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw, Home, ServerOff } from "lucide-react";
import { Link } from "react-router-dom";
import type { ServiceStatus } from "@/types";

interface ServerErrorPageProps {
	error?: string | null;
	services?: Record<string, ServiceStatus>;
}

const ServerErrorPage = ({ error, services }: ServerErrorPageProps) => {
	const { t } = useTranslation();

	return (
		<div className="relative h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col items-center justify-center p-6">
			{/* Background Glow */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-destructive/10 blur-[120px] rounded-full pointer-events-none" />

			<div className="relative z-10 flex flex-col items-center max-w-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
				<div className="mb-8 p-6 rounded-3xl bg-destructive/5 border border-destructive/20 shadow-2xl shadow-destructive/10">
					<ServerOff className="w-16 h-16 text-destructive animate-pulse" />
				</div>

				<h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-center mb-4 bg-clip-text text-transparent bg-linear-to-b from-foreground to-muted-foreground">
					{t("server_error.title")}
				</h1>

				<p className="text-muted-foreground text-center text-lg mb-12 max-w-md">
					{t("server_error.subtitle")}
				</p>

				{/* Detailed Status */}
				<div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
					{services &&
						Object.entries(services).map(([key, service]) => (
							<div
								key={key}
								className={`p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
									service.status === "ok"
										? "bg-primary/5 border-primary/20"
										: "bg-destructive/5 border-destructive/20"
								}`}
							>
								<div className="flex items-center justify-between mb-2">
									<span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
										{key}
									</span>
									<div
										className={`w-2 h-2 rounded-full ${
											service.status === "ok"
												? "bg-primary animate-pulse"
												: "bg-destructive"
										}`}
									/>
								</div>
								<p
									className={`text-xs font-medium truncate ${
										service.status === "ok"
											? "text-primary"
											: "text-destructive"
									}`}
								>
									{service.status === "ok"
										? t("server_error.operational")
										: t("server_error.service_down")}
								</p>
							</div>
						))}
				</div>

				{error && (
					<div className="w-full mb-12 p-4 rounded-xl bg-muted/50 border border-muted flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
						<div className="flex flex-col gap-1">
							<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
								{t("server_error.error_details")}
							</span>
							<p className="text-sm font-mono text-foreground/80 break-all">
								{error}
							</p>
						</div>
					</div>
				)}

				<div className="flex flex-col sm:flex-row items-center gap-4">
					<button
						onClick={() => window.location.reload()}
						className="group relative flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-bold transition-all hover:scale-105 active:scale-95 overflow-hidden"
					>
						<RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
						{t("server_error.retry_button")}
					</button>

					<Link
						to="/"
						className="flex items-center gap-2 px-8 py-4 bg-muted hover:bg-muted/80 text-foreground rounded-full font-bold transition-all hover:scale-105 active:scale-95"
					>
						<Home className="w-4 h-4" />
						{t("server_error.safety_button")}
					</Link>
				</div>
			</div>

			{/* Decorative elements */}
			<div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-destructive/20 to-transparent" />
		</div>
	);
};

export default ServerErrorPage;
