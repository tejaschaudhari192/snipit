import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, User } from "lucide-react";
import ThemeTogglePositionsDemo from "./theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "../common/brand-logo";
import { ActionUrlBar } from "../common/action-url-bar";

const LanguageSwitcher = lazy(() =>
	import("./language-switcher").then((m) => ({
		default: m.LanguageSwitcher,
	})),
);
const JumpToDialog = lazy(() =>
	import("./jump-to-dialog").then((m) => ({
		default: m.JumpToDialog,
	})),
);
const LogoutDialog = lazy(() =>
	import("./logout-dialog").then((m) => ({
		default: m.LogoutDialog,
	})),
);

interface HeaderProps {
	className?: string;
}

const UserMenu = () => {
	const { user } = useAuth();
	const { t } = useTranslation();
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

	if (!user) {
		return (
			<div className="flex items-center gap-2">
				<Link to="/profile">
					<Button
						variant="ghost"
						size="sm"
						className="h-9 px-3 gap-2.5 transition-all hover:bg-primary/5 rounded-full"
					>
						<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
							<User className="h-3.5 w-3.5" />
						</div>
						<span className="text-sm font-bold hidden sm:inline-block">
							{t("header.guest")}
						</span>
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<>
			<Link to="/profile" className="flex items-center">
				<Button
					variant="ghost"
					size="sm"
					className="h-9 px-3 gap-2.5 transition-all hover:bg-primary/5 rounded-full"
				>
					<div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
						<User className="h-3.5 w-3.5" />
					</div>
					<span className="text-sm font-bold hidden sm:inline-block">
						{user.username}
					</span>
				</Button>
			</Link>

			<Suspense fallback={null}>
				<LogoutDialog
					open={isLogoutDialogOpen}
					onOpenChange={setIsLogoutDialogOpen}
				/>
			</Suspense>
		</>
	);
};

const Header = ({ className }: HeaderProps) => {
	const location = useLocation();
	const path = location.pathname;
	const nonShareablePaths = [
		"history",
		"about",
		"profile",
		"login",
		"signup",
		"password",
	];
	const id = nonShareablePaths.some((p) => path.includes(p)) ? null : path;
	const { t } = useTranslation();
	const { user } = useAuth();
	const [isJumpToDialogOpen, setIsJumpToDialogOpen] = useState(false);

	const url = window.location.href;

	return (
		<header
			className={cn(
				"flex justify-between items-center h-[52px] p-2 px-4 md:px-8 border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-50",
				className,
			)}
		>
			<div className="flex items-center h-full gap-4 md:gap-8 min-w-0">
				<BrandLogo
					textClassName={
						id && id.length > 1 ? "hidden sm:block" : "block"
					}
				/>
				{id && id.length > 1 && (
					<ActionUrlBar url={url} className="ml-1 sm:ml-0" />
				)}
			</div>

			<div className="hidden md:flex items-center gap-3 min-w-0 shrink-0">
				<nav className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg mr-2">
					<Link to={"/about"}>
						<Button
							variant={path === "/about" ? "secondary" : "ghost"}
							size="sm"
							className="h-8 text-xs font-semibold"
						>
							{t("header.about")}
						</Button>
					</Link>
					<Link to={"/history"}>
						<Button
							variant={
								path === "/history" ? "secondary" : "ghost"
							}
							size="sm"
							className="h-8 text-xs font-semibold"
						>
							{t("header.history")}
						</Button>
					</Link>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 text-xs font-semibold gap-1.5"
						onClick={() => setIsJumpToDialogOpen(true)}
					>
						<Search className="h-3.5 w-3.5" />
						{t("header.jump_to")}
					</Button>
				</nav>

				<Suspense
					fallback={
						<div className="w-[140px] h-9 skeleton rounded-lg" />
					}
				>
					<LanguageSwitcher className="w-[140px] h-9" />
				</Suspense>

				{path.length > 1 && (
					<Link to={"/"}>
						<Button
							variant={"outline"}
							size="sm"
							className="h-9 font-bold px-4"
						>
							{t("header.new_snippet")}
						</Button>
					</Link>
				)}

				<div className="w-px h-4 bg-border mx-1" />
				<ThemeTogglePositionsDemo />
				<div className="w-px h-4 bg-border mx-1" />
				<UserMenu />
			</div>

			<div className="md:hidden flex items-center gap-1.5 shrink-0">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							className="h-9 w-9"
						>
							<Menu className="h-5 w-5" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-[220px] p-1 rounded-xl"
					>
						{!user ? (
							<>
								<DropdownMenuItem
									asChild
									className="rounded-lg"
								>
									<Link
										to="/profile"
										className="flex items-center gap-3 w-full p-3 bg-primary/5 rounded-xl border border-primary/10"
									>
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
											<User className="h-5 w-5" />
										</div>
										<div className="flex flex-col min-w-0">
											<p className="text-sm font-black truncate text-primary leading-tight">
												{t("header.guest")}
											</p>
										</div>
									</Link>
								</DropdownMenuItem>
								<div className="h-px bg-muted my-2" />
							</>
						) : (
							<Link
								to="/profile"
								className="flex items-center gap-3 w-full p-3 bg-primary/5 rounded-xl border border-primary/10"
							>
								<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
									<User className="h-5 w-5" />
								</div>
								<div className="flex flex-col min-w-0">
									<p className="text-sm font-black truncate text-primary leading-tight">
										{user.username}
									</p>
									<p className="text-[11px] text-muted-foreground truncate opacity-80 mt-0.5">
										{user.email}
									</p>
								</div>
							</Link>
						)}
						<DropdownMenuItem asChild className="rounded-lg">
							<Link
								to="/about"
								className="flex items-center gap-2 py-2"
							>
								<span>{t("header.about")}</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="rounded-lg">
							<Link
								to="/history"
								className="flex items-center gap-2 py-2"
							>
								<span>{t("header.history")}</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-lg"
							onClick={() => setIsJumpToDialogOpen(true)}
						>
							<div className="flex items-center gap-2 py-2">
								<span>{t("header.jump_to")}</span>
							</div>
						</DropdownMenuItem>
						{path.length > 1 && (
							<DropdownMenuItem asChild className="rounded-lg">
								<Link
									to="/"
									className="flex items-center gap-2 py-2"
								>
									<span>{t("header.new_snippet")}</span>
								</Link>
							</DropdownMenuItem>
						)}
						<div className="h-px bg-muted my-2" />
						<div className="px-2 py-2 space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold text-muted-foreground/70">
									{t("header.theme")}
								</span>
								<ThemeTogglePositionsDemo />
							</div>
							<div className="space-y-1.5">
								<span className="text-xs font-bold text-muted-foreground/70">
									{t("header.language")}
								</span>
								<Suspense
									fallback={
										<div className="w-full h-9 skeleton rounded-lg" />
									}
								>
									<LanguageSwitcher className="w-full h-9" />
								</Suspense>
							</div>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<Suspense fallback={null}>
				<JumpToDialog
					isOpen={isJumpToDialogOpen}
					onOpenChange={setIsJumpToDialogOpen}
				/>
			</Suspense>
		</header>
	);
};

export default Header;
