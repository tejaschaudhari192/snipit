import React, { Suspense } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/tools/password-manager/store";
import {
	selectIsSidebarDrawerOpen,
	setSidebarDrawerOpen
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
				<SheetHeader className="sr-only">
					<SheetTitle>Menu</SheetTitle>
					<SheetDescription>Sidebar navigation menu</SheetDescription>
				</SheetHeader>
				<div className="h-full w-full">
					<SidebarProvider className="min-h-0 h-full w-full">
						<Suspense fallback={<SidebarSkeleton />}>
							<PasswordSidebar />
						</Suspense>
					</SidebarProvider>
				</div>
			</SheetContent>
		</Sheet>
	);
}
