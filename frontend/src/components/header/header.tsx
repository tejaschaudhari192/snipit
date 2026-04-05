import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, User, LogOut, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import ThemeTogglePositionsDemo from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/context/AuthContext";
import { JumpToDialog } from "./jump-to-dialog";
import { LogoutDialog } from "./logout-dialog";
import { BrandLogo } from "../common/brand-logo";
import { ActionUrlBar } from "../common/action-url-bar";

interface HeaderProps {
	className?: string;
}

const UserMenu = () => {
	const { user } = useAuth();
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

	if (!user) {
		return (
			<div className="flex items-center gap-2">
				<Link to="/login">
					<Button
						variant="ghost"
						size="sm"
						className="font-semibold px-4"
					>
						{t("header.login", "Login")}
					</Button>
				</Link>
				<Link to="/signup">
					<Button
						size="sm"
						className="font-bold px-4 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
					>
						{t("header.signup", "Signup")}
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="relative"
		>
			<Button
				variant="ghost"
				size="sm"
				className={cn(
					"px-3 h-9 transition-all hover:bg-primary/5",
					isOpen &&
						"bg-primary/10 text-primary border-primary/20 shadow-sm",
				)}
				onClick={() => setIsOpen(!isOpen)}
			>
				<User className="h-4 w-4" />
				<ChevronDown
					className={cn(
						"h-3.5 w-3.5 transition-transform duration-300 opacity-50",
						isOpen && "rotate-180 opacity-100",
					)}
				/>
			</Button>

			<CollapsibleContent
				className={cn(
					"absolute top-full right-0 mt-2 w-56 p-1 rounded-xl bg-background/98 backdrop-blur-xl border border-border/50 shadow-2xl transition-all duration-300 origin-top-right z-[100]",
					isOpen
						? "scale-100 opacity-100 visible translate-y-0"
						: "scale-95 opacity-0 invisible -translate-y-2 pointer-events-none",
				)}
			>
				<Link
					to="/profile"
					className="block p-3 border-b border-border/20 mb-1 hover:bg-primary/5 transition-all group"
					onClick={() => setIsOpen(false)}
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
							<User className="h-5 w-5 text-primary" />
						</div>
						<div className="flex flex-col min-w-0">
							<p className="text-sm font-black truncate text-primary leading-tight">
								{user.username}
							</p>
							<p className="text-[10px] text-muted-foreground truncate italic">
								{user.email}
							</p>
						</div>
					</div>
				</Link>

				<button
					onClick={() => {
						setIsOpen(false);
						setIsLogoutDialogOpen(true);
					}}
					className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-lg text-red-500 hover:bg-red-500/5 transition-all group mt-1"
				>
					<div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
						<LogOut className="h-4 w-4" />
					</div>
					{t("header.logout", "Logout")}
				</button>
			</CollapsibleContent>

			<LogoutDialog
				open={isLogoutDialogOpen}
				onOpenChange={setIsLogoutDialogOpen}
			/>
		</Collapsible>
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
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

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

				<LanguageSwitcher className="w-[140px] h-9" />

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
					<DropdownMenuContent align="end" className="w-[220px] p-2">
						{!user ? (
							<>
								<DropdownMenuItem
									asChild
									className="rounded-md"
								>
									<Link
										to="/login"
										className="flex items-center gap-2 py-2"
									>
										<User className="h-4 w-4" />
										<span>{t("header.login")}</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									asChild
									className="rounded-md"
								>
									<Link
										to="/signup"
										className="flex items-center gap-2 py-2"
									>
										<User className="h-4 w-4" />
										<span>{t("header.signup")}</span>
									</Link>
								</DropdownMenuItem>
								<div className="h-px bg-muted my-2" />
							</>
						) : (
							<>
								<DropdownMenuItem
									asChild
									className="rounded-md"
								>
									<Link
										to="/profile"
										className="flex items-center gap-2 py-2"
									>
										<User className="h-4 w-4" />
										<span>{t("header.profile")}</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									className="rounded-md text-red-500 focus:text-red-500"
									onClick={() => setIsLogoutDialogOpen(true)}
								>
									<div className="flex items-center gap-2 py-2">
										<LogOut className="h-4 w-4" />
										<span>{t("header.logout")}</span>
									</div>
								</DropdownMenuItem>
								<div className="h-px bg-muted my-2" />
							</>
						)}
						<DropdownMenuItem asChild className="rounded-md">
							<Link
								to="/about"
								className="flex items-center gap-2 py-2"
							>
								<span>{t("header.about")}</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="rounded-md">
							<Link
								to="/history"
								className="flex items-center gap-2 py-2"
							>
								<span>{t("header.history")}</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="rounded-md"
							onClick={() => setIsJumpToDialogOpen(true)}
						>
							<div className="flex items-center gap-2 py-2">
								<span>{t("header.jump_to")}</span>
							</div>
						</DropdownMenuItem>
						{path.length > 1 && (
							<DropdownMenuItem asChild className="rounded-md">
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
								<span className="text-xs font-bold text-muted-foreground uppercase">
									{t("header.theme", "Theme")}
								</span>
								<ThemeTogglePositionsDemo />
							</div>
							<div className="space-y-1.5">
								<span className="text-xs font-bold text-muted-foreground uppercase">
									{t("header.language", "Language")}
								</span>
								<LanguageSwitcher className="w-full h-9" />
							</div>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<JumpToDialog
				isOpen={isJumpToDialogOpen}
				onOpenChange={setIsJumpToDialogOpen}
			/>
			<LogoutDialog
				open={isLogoutDialogOpen}
				onOpenChange={setIsLogoutDialogOpen}
			/>
		</header>
	);
};

export default Header;
