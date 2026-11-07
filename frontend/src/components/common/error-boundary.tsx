import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	WifiOff,
	AlertTriangle,
	RefreshCw,
	Home,
	ChevronDown,
	ChevronUp,
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

			return (
				<div className="min-h-75 w-full flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
					{/* Glow background */}
					<div className="absolute w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

					<div className="relative z-10 max-w-md w-full bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center space-y-5">
						{/* Icon badge */}
						<div
							className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 ${
								isNetworkOrChunkError
									? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
									: "bg-destructive/10 text-destructive border border-destructive/20"
							}`}
						>
							{isNetworkOrChunkError ? (
								<WifiOff className="w-7 h-7" />
							) : (
								<AlertTriangle className="w-7 h-7" />
							)}
						</div>

						{/* Titles */}
						<div className="space-y-1.5">
							<h3 className="text-xl font-bold tracking-tight text-foreground">
								{isNetworkOrChunkError
									? "Connection Interrupted"
									: "Something went wrong"}
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{isNetworkOrChunkError
									? "Unable to load page assets due to a connection drop or expired session. Please check your internet connection."
									: "An unexpected rendering error occurred in this section."}
							</p>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
							<Button
								onClick={this.handleReload}
								className="gap-2 h-9 px-4 rounded-xl shadow-xs"
							>
								<RefreshCw className="w-4 h-4" />
								Reload Application
							</Button>
							<Button
								variant="outline"
								onClick={this.handleRetry}
								className="gap-2 h-9 px-4 rounded-xl"
							>
								Try Again
							</Button>
							<Button
								variant="ghost"
								onClick={this.handleGoHome}
								className="gap-2 h-9 px-3 rounded-xl text-muted-foreground"
							>
								<Home className="w-4 h-4" />
								Home
							</Button>
						</div>

						{/* Collapsible Error Technical Details */}
						{this.state.error && (
							<div className="w-full pt-2">
								<button
									type="button"
									onClick={() =>
										this.setState({
											showDetails:
												!this.state.showDetails,
										})
									}
									className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors select-none"
								>
									<span>Technical Details</span>
									{this.state.showDetails ? (
										<ChevronUp className="w-3.5 h-3.5" />
									) : (
										<ChevronDown className="w-3.5 h-3.5" />
									)}
								</button>

								{this.state.showDetails && (
									<div className="mt-2 text-left p-3 rounded-xl bg-muted/50 border border-border/50 text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-36 custom-scrollbar">
										<p className="text-destructive font-semibold mb-1">
											{this.state.error.name}:{" "}
											{this.state.error.message}
										</p>
										{this.state.error.stack && (
											<pre className="whitespace-pre-wrap leading-tight text-[10px] text-muted-foreground/80">
												{this.state.error.stack}
											</pre>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
