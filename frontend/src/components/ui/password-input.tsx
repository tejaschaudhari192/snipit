import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/utils";
import { Input } from "./input";
import { useTranslation } from "react-i18next";

export type PasswordInputProps = React.ComponentProps<typeof Input>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const { t } = useTranslation();

		return (
			<div className="relative group/password-input">
				<Input
					type={showPassword ? "text" : "password"}
					className={cn("pr-10", className)}
					ref={ref}
					{...props}
				/>
				<button
					type="button"
					onClick={() => setShowPassword(!showPassword)}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors focus:outline-none"
					aria-label={
						showPassword
							? t("auth.hide_password", "Hide password")
							: t("auth.show_password", "Show password")
					}
				>
					{showPassword ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
				</button>
			</div>
		);
	},
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
