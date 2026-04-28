import { Link } from "react-router-dom";
import { cn } from "@/utils";
import icon from "@/assets/brand/icon.png";

interface BrandLogoProps {
	className?: string;
	showText?: boolean;
	textClassName?: string;
}

export const BrandLogo = ({
	className,
	showText = true,
	textClassName,
}: BrandLogoProps) => {
	return (
		<Link
			to="/"
			className={cn(
				"flex items-center gap-2.5 group shrink-0",
				className,
			)}
		>
			<img
				src={icon}
				alt="Snipit Logo"
				loading="lazy"
				className="h-8 w-auto transform transition-transform duration-300 ease-in-out group-hover:scale-105"
			/>
			{showText && (
				<p
					className={cn(
						"text-xl md:text-2xl font-black tracking-tight bg-clip-text transform transition-transform duration-300 ease-in-out group-hover:scale-105",
						textClassName,
					)}
				>
					Snipit
				</p>
			)}
		</Link>
	);
};
