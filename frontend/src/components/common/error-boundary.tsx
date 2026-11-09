import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	WifiOff,
	AlertTriangle,
	RefreshCw,
	Home,
	ChevronDown,
	ChevronUp,
	RotateCcw,
	Sparkles,
} from "lucide-react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onReset?: () => void;
	scope?: string;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	showDetails: boolean;
	isOnline: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
		showDetails: false,
		isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
	};

	private handleOnline = () => this.setState({ isOnline: true });
	private handleOffline = () => this.setState({ isOnline: false });

	public static getDerivedStateFromError(error: Error): Partial<State> {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ errorInfo });
		console.error(
			`[ErrorBoundary${this.props.scope ? ` - ${this.props.scope}` : ""}]`,
			error,
			errorInfo,
		);
	}

	public componentDidMount() {
		window.addEventListener("online", this.handleOnline);
		window.addEventListener("offline", this.handleOffline);
	}

	public componentWillUnmount() {
		window.removeEventListener("online", this.handleOnline);
		window.removeEventListener("offline", this.handleOffline);
	}

	private handleRetry = () => {
		if (this.props.onReset) {
			this.props.onReset();
		}
		this.setState({ hasError: false, error: null, errorInfo: null });
	};

	private handleReload = () => {
		window.location.reload();
	};

	private handleGoHome = () => {
		window.location.href = "/";
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const isNetworkOrChunkError =
				!this.state.isOnline ||
				(this.state.error &&
					(/Loading chunk [\d]+ failed/i.test(
						this.state.error.message,
					) ||
						/Failed to fetch dynamically imported module/i.test(
							this.state.error.message,
						) ||
						/NetworkError/i.test(this.state.error.message) ||
						/Failed to fetch/i.test(this.state.error.message)));

			const errorCode = isNetworkOrChunkError ? "OFFLINE" : "500";

			return (
				<div className="relative min-h-[85vh] w-full flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-background">
					{/* Ambient Atmospheric Glows */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-lg h-128 bg-linear-to-tr from-destructive/15 via-primary/10 to-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
					<div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

					{/* Subtle Background Grid Pattern */}
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-foreground)/0.03_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

					<div className="relative z-10 max-w-2xl w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
						{/* Giant 404-Style Error Code Display */}
						<div className="relative mb-2 select-none">
							<span
								className="text-[120px] sm:text-[160px] md:text-[200px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-linear-to-b from-primary via-primary/70 to-primary/10 drop-shadow-sm inline-block"
								style={{
									fontVariantNumeric: "tabular-nums",
								}}
							>
								{errorCode}
							</span>
							<div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 blur-2xl">
								<span className="text-[120px] sm:text-[160px] md:text-[200px] font-black text-primary">
									{errorCode}
								</span>
							</div>
						</div>

						{/* Icon Floating Badge */}
						<div className="mb-6 -mt-4 sm:-mt-6">
							<div
								className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl backdrop-blur-xl shadow-xl transition-transform hover:scale-110 duration-300 ${
									isNetworkOrChunkError
										? "bg-amber-500/10 text-amber-500 border border-amber-500/25 shadow-amber-500/10"
										: "bg-destructive/10 text-destructive border border-destructive/25 shadow-destructive/10"
								}`}
							>
								{isNetworkOrChunkError ? (
									<WifiOff className="w-8 h-8" />
								) : (
									<AlertTriangle className="w-8 h-8" />
								)}
							</div>
						</div>

						{/* Heading & Subtitle */}
						<div className="space-y-3 mb-8 max-w-lg">
							<h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
								{isNetworkOrChunkError
									? "Connection Interrupted"
									: "Something went wrong"}
							</h2>
							<p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
								{isNetworkOrChunkError
									? "Unable to reach server assets due to a connection drop or expired session. Please verify your connection."
									: "An unexpected rendering crash happened while displaying this view. Don't worry, your data is safe."}
							</p>
						</div>

						{/* Premium 404-Style Action Buttons */}
						<div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-8">
							<Button
								size="lg"
								onClick={this.handleReload}
								className="gap-2 px-7 h-12 w-full sm:w-auto rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
							>
								<RefreshCw className="w-4 h-4" />
								Reload Application
							</Button>
							<Button
								size="lg"
								variant="outline"
								onClick={this.handleRetry}
								className="gap-2 px-7 h-12 w-full sm:w-auto rounded-full font-semibold backdrop-blur-md bg-background/60 hover:scale-105 active:scale-95 transition-all"
							>
								<RotateCcw className="w-4 h-4" />
								Try Again
							</Button>
							<Button
								size="lg"
								variant="ghost"
								onClick={this.handleGoHome}
								className="gap-2 px-6 h-12 w-full sm:w-auto rounded-full text-muted-foreground hover:text-foreground transition-all"
							>
								<Home className="w-4 h-4" />
								Back to Home
							</Button>
						</div>

						{/* Technical Details Glass Card */}
						{this.state.error && (
							<div className="w-full max-w-xl">
								<button
									type="button"
									onClick={() =>
										this.setState({
											showDetails:
												!this.state.showDetails,
										})
									}
									className="group inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all select-none border border-border/40"
								>
									<Sparkles className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
									<span>Technical Details</span>
									{this.state.showDetails ? (
										<ChevronUp className="w-3.5 h-3.5" />
									) : (
										<ChevronDown className="w-3.5 h-3.5" />
									)}
								</button>

								{this.state.showDetails && (
									<div className="mt-4 text-left p-4 rounded-2xl bg-muted/40 backdrop-blur-xl border border-border/60 text-xs font-mono shadow-inner animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
										<div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-[11px] text-muted-foreground">
											<span className="font-semibold text-destructive">
												{this.state.error.name}
											</span>
											{this.props.scope && (
												<span className="px-2 py-0.5 rounded bg-background/80 text-[10px] border border-border/40">
													scope: {this.props.scope}
												</span>
											)}
										</div>
										<p className="text-foreground/90 font-medium mb-2 wrap-break-word">
											{this.state.error.message}
										</p>
										{this.state.error.stack && (
											<pre className="whitespace-pre-wrap leading-relaxed text-[10.5px] text-muted-foreground/80 max-h-48 overflow-y-auto custom-scrollbar p-2 rounded-lg bg-background/50 border border-border/30">
												{this.state.error.stack}
											</pre>
										)}
									</div>
								)}
							</div>
						)}
					</div>

					{/* Bottom Accent Gradient Line */}
					<div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/25 to-transparent pointer-events-none" />
				</div>
			);
		}

		return this.props.children;
	}
}
