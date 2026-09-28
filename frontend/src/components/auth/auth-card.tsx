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
	icon: ReactNode;
	title: string;
	subtitle: string;
	children: ReactNode;
	footer?: ReactNode;
}

export const AuthCard = ({
	icon,
	title,
	subtitle,
	children,
	footer,
}: AuthCardProps) => {
	return (
		<div className="flex-1 w-full min-h-full flex flex-col items-center justify-center bg-background px-4 py-8 transition-colors duration-500">
			{/* Dynamic Background Accents - Theme Aware */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
				<div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] animate-pulse-subtle" />
				<div
					className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/15 blur-[100px] animate-pulse-subtle"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="w-full max-w-100 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
				<Card className="glass-card border-border/40 overflow-hidden shadow-2xl rounded-3xl gap-0 py-0">
					<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent" />

					<CardHeader className="space-y-1.5 pb-5 pt-7">
						<div className="flex items-center justify-center mb-4">
							<div className="relative group">
								<div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								<div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary transition-transform duration-500 group-hover:scale-105">
									{icon}
								</div>
							</div>
						</div>
						<CardTitle className="text-2xl font-bold tracking-tight text-center">
							{title}
						</CardTitle>
						<CardDescription className="text-sm text-muted-foreground text-center font-medium">
							{subtitle}
						</CardDescription>
					</CardHeader>

					<CardContent className="px-7">{children}</CardContent>

					{footer && (
						<CardFooter className="flex flex-col gap-4 pb-7 pt-5 px-7 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
							{footer}
						</CardFooter>
					)}
				</Card>
			</div>
		</div>
	);
};
