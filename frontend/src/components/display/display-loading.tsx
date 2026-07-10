import React from "react";
import { ShimmerSection } from "@/components/common/shimmer-section";

export const DisplayLoading: React.FC = () => {
	return (
		<div className="flex-1 flex flex-col bg-background">
			<ShimmerSection type="toolbar" className="sticky top-0 z-40 h-15" />
			<ShimmerSection type="metadata" className="sticky top-15 z-30" />
			<div className="flex-1 px-3 sm:px-5 py-6">
				<ShimmerSection type="editor" className="min-h-[70vh]" />
			</div>
		</div>
	);
};
