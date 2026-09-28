import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface AuthFooterLinkProps {
	promptText: string;
	linkText: string;
	linkTo: string;
	dividerText?: string;
	customAction?: ReactNode;
}

export const AuthFooterLink = ({
	promptText,
	linkText,
	linkTo,
	dividerText,
	customAction,
}: AuthFooterLinkProps) => {
	return (
		<>
			{dividerText && (
				<div className="relative w-full">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-border/50"></div>
					</div>
					<div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
						<span className="bg-background/80 backdrop-blur-sm px-4">
							{dividerText}
						</span>
					</div>
				</div>
			)}

			<p className="text-sm text-muted-foreground/80 text-center font-medium">
				{promptText}{" "}
				<Link
					to={linkTo}
					className="font-bold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 group"
				>
					{linkText}
					<ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
				</Link>
			</p>
			{customAction}
		</>
	);
};
