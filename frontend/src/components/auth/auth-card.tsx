import type { ReactNode } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";

interface AuthCardProps {
	title: string;
	subtitle: string;
	children: ReactNode;
	footer?: ReactNode;
}

export const AuthCard = ({
	title,
	subtitle,
	children,
	footer,
}: AuthCardProps) => {
	return (
		<div className="flex-1 w-full min-h-full flex flex-col items-center justify-center bg-background px-4 py-6 transition-colors duration-500">
			{/* Subtle Ambient Background */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
				<div className="absolute top-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-primary/10 blur-[90px] animate-pulse-subtle" />
				<div
					className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-primary/15 blur-[90px] animate-pulse-subtle"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="w-full max-w-100 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<Card className="glass-card border-border/50 overflow-hidden shadow-xl rounded-2xl gap-0 py-0">
					<div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-primary/40 to-transparent" />

					<CardHeader className="space-y-1.5 pb-4 pt-6 px-6 text-center">
						<CardTitle className="text-xl font-semibold tracking-tight">
							{title}
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground font-normal">
							{subtitle}
						</CardDescription>
					</CardHeader>

					<CardContent className="px-6 pb-6 pt-0">
						{children}
					</CardContent>

					{footer && (
						<CardFooter className="flex flex-col gap-3 py-4 px-6 border-t border-border/40 bg-muted/20">
							{footer}
						</CardFooter>
					)}
				</Card>
			</div>
		</div>
	);
};
