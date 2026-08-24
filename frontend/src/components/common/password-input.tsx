import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils";

export type PasswordInputProps = React.ComponentProps<typeof Input>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const { t } = useTranslation();

		return (
			<div className="relative w-full flex items-center">
				<Input
					ref={ref}
					{...props}
					type={showPassword ? "text" : "password"}
					className={cn("pr-9", className)}
				/>
				<button
					type="button"
					tabIndex={-1}
					onMouseDown={(e) => e.preventDefault()}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setShowPassword((prev) => !prev);
					}}
					className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer rounded-md focus:outline-none disabled:pointer-events-none disabled:opacity-50 select-none flex items-center justify-center"
					aria-label={
						showPassword
							? t("auth.hide_password")
							: t("auth.show_password")
					}
				>
					{showPassword ? (
						<EyeOff className="h-4 w-4 shrink-0" />
					) : (
						<Eye className="h-4 w-4 shrink-0" />
					)}
				</button>
			</div>
		);
	},
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
