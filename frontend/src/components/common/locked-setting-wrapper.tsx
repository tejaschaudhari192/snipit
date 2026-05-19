import React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface LockedSettingWrapperProps {
	disabled: boolean;
	tooltipText: string;
	children: React.ReactNode;
}

export const LockedSettingWrapper = ({
	disabled,
	tooltipText,
	children,
}: LockedSettingWrapperProps) => {
	if (!disabled) return <>{children}</>;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="cursor-not-allowed w-full opacity-60">
						{children}
					</div>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>{tooltipText}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
