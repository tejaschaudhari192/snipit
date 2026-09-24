import React from "react";
import { cn } from "cn";
import "./shiny-text.css";

interface ShinyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
	children: React.ReactNode;
	className?: string;
	shimmerWidth?: number;
	duration?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
	children,
	className,
	duration = "4s",
	style,
	...props
}) => {
	return (
		<span
			style={{ animationDuration: duration, ...style }}
			className={cn(
				"shiny inline-block bg-[linear-gradient(120deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.8)_50%,rgba(0,0,0,0)_60%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0)_40%,rgba(255,255,255,0.8)_50%,rgba(255,255,255,0)_60%)] bg-size-[200%_100%] bg-clip-text font-medium text-muted-foreground/70",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
};

export default ShinyText;
