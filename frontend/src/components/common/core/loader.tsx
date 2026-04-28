import { ShimmerSection } from "../shimmer-section";
import { cn } from "@/utils";

interface LoaderProps {
	className?: string;
}

const Loader: React.FC<LoaderProps> = ({ className }) => {
	return (
		<ShimmerSection type="loader" className={cn("size-16", className)} />
	);
};

export default Loader;
