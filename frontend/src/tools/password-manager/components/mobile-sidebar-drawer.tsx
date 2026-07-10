import React, { Suspense } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import {
	selectIsSidebarDrawerOpen,
	setSidebarDrawerOpen,
	handleNewItem,
} from "@/tools/password-manager/store/password-slice";
import { SidebarSkeleton } from "./skeletons";

import { SidebarProvider } from "@/components/ui/sidebar";

const PasswordSidebar = React.lazy(() => import("./password-sidebar"));

export default function MobileSidebarDrawer() {
	const dispatch = useAppDispatch();
	const isSidebarDrawerOpen = useAppSelector(selectIsSidebarDrawerOpen);

	return (
		<Sheet
			open={isSidebarDrawerOpen}
			onOpenChange={(open) => dispatch(setSidebarDrawerOpen(open))}
		>
			<SheetContent
				side="left"
				className="p-0 w-70 bg-sidebar border-r border-border"
			>
				<div className="h-full w-full">
					<SidebarProvider className="min-h-0 h-full w-full">
						<Suspense fallback={<SidebarSkeleton />}>
							<PasswordSidebar
								onNewItem={(type) => {
									dispatch(setSidebarDrawerOpen(false));
									dispatch(handleNewItem(type));
								}}
							/>
						</Suspense>
					</SidebarProvider>
				</div>
			</SheetContent>
		</Sheet>
	);
}
