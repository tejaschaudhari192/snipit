import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	private handleReset = () => {
		this.setState({ hasError: false, error: null });
		window.location.reload();
	};

	public render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="flex flex-col items-center justify-center p-8 min-h-75 bg-red-500/5 border border-red-500/20 rounded-2xl text-center space-y-4">
						<div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
							<AlertCircle className="w-6 h-6" />
						</div>
						<div className="space-y-2">
							<h3 className="text-lg font-bold text-red-600 dark:text-red-400">
								Something went wrong
							</h3>
							<p className="text-sm text-muted-foreground max-w-xs mx-auto">
								{this.state.error?.message ||
									"An unexpected error occurred while rendering this component."}
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={this.handleReset}
							className="gap-2"
						>
							<RefreshCcw className="w-4 h-4" />
							Reload Page
						</Button>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
