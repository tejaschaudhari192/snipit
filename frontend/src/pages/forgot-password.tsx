import { PasswordFlowCard } from "@/components/auth/password-flow-card";

const ForgotPasswordPage = () => {
	return (
		<div className="flex-1 w-full flex flex-col items-center justify-center bg-background px-4 py-8 transition-colors duration-500">
			{/* Dynamic Background Accents - Theme Aware */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
				<div className="absolute top-[-10%] left-[-20%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] animate-pulse-subtle" />
				<div
					className="absolute bottom-[-10%] right-[-20%] w-[40%] h-[40%] rounded-full bg-primary/15 blur-[100px] animate-pulse-subtle"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<PasswordFlowCard />
		</div>
	);
};

export default ForgotPasswordPage;
