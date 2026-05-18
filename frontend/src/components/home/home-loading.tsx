import React from "react";
import { ShimmerSection } from "@/components/common/shimmer-section";

export const HomeLoading: React.FC = () => {
	return (
		<div className="flex-1 flex flex-col bg-background h-screen overflow-hidden w-full">
			<div className="shrink-0 my-1 mx-2 md:my-1.5 md:mx-4">
				<ShimmerSection type="toolbar" className="h-[50px] w-full" />
			</div>
			<div className="flex-1 px-1 sm:px-5 py-1.5 sm:py-3 min-h-0 h-full w-full overflow-hidden flex flex-col">
				<ShimmerSection
					type="editor"
					className="flex-1 min-h-[500px] w-full"
				/>
			</div>
		</div>
	);
};

export default HomeLoading;
