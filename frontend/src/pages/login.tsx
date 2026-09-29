import { GalleryVerticalEnd } from "lucide-react";
import { Link } from "react-router-dom";
import { LoginForm } from "@/components/login-form";

const LoginPage = () => {
	return (
		<div className="grid min-h-full flex-1 lg:grid-cols-2">
			{/* Left Column: Brand & Centered Login Form */}
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Link
						to="/"
						className="flex items-center gap-2 font-medium"
					>
						<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<GalleryVerticalEnd className="size-4" />
						</div>
						Snipit
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginForm />
					</div>
				</div>
			</div>

			{/* Right Column: Visual Cover / Hero Feature Panel */}
			<div className="relative hidden bg-muted lg:block overflow-hidden border-l border-border/40">
				{/* Ambient Glows */}
				<div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
				<div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center select-none">
					<div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary shadow-xl">
						<GalleryVerticalEnd className="size-8" />
					</div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
						Code & Text Sharing, Reimagined
					</h2>
					<p className="text-sm text-muted-foreground max-w-sm">
						Store snippets, securely share encrypted notes, paste
						binaries, and collaborate seamlessly with Snipit.
					</p>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
