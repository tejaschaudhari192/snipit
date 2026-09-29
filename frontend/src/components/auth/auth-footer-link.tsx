import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthFooterLinkProps {
	promptText: string;
	linkText: string;
	linkTo: string;
	customAction?: ReactNode;
}

export const AuthFooterLink = ({
	promptText,
	linkText,
	linkTo,
	customAction,
}: AuthFooterLinkProps) => {
	return (
		<>
			<p className="text-xs text-muted-foreground text-center font-medium">
				{promptText}{" "}
				<Link
					to={linkTo}
					className="font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
				>
					{linkText}
				</Link>
			</p>
			{customAction}
		</>
	);
};
