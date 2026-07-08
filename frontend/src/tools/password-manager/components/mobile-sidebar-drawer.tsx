import React, { Suspense } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { usePasswordUI } from "../context/password-ui-context";
import { SidebarSkeleton } from "./skeletons";

import { SidebarProvider } from "@/components/ui/sidebar";

const PasswordSidebar = React.lazy(() => import("./password-sidebar"));

export default function MobileSidebarDrawer() {
	const { isSidebarDrawerOpen, setIsSidebarDrawerOpen, handleNewItem } =
		usePasswordUI();

	return (
		<Sheet open={isSidebarDrawerOpen} onOpenChange={setIsSidebarDrawerOpen}>
			<SheetContent
				side="left"
				className="p-0 w-[280px] bg-sidebar border-r border-border"
			>
				<div className="h-full w-full">
					<SidebarProvider className="min-h-0 h-full w-full">
						<Suspense fallback={<SidebarSkeleton />}>
							<PasswordSidebar
								onNewItem={(type) => {
									setIsSidebarDrawerOpen(false);
									handleNewItem(type);
								}}
							/>
						</Suspense>
					</SidebarProvider>
				</div>
			</SheetContent>
		</Sheet>
	);
}
