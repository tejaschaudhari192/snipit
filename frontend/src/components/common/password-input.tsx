import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
	InputGroupButton,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export type PasswordInputProps = React.ComponentProps<typeof Input>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const { t } = useTranslation();

		return (
			<InputGroup className={className}>
				<InputGroupInput
					type={showPassword ? "text" : "password"}
					ref={ref}
					{...props}
				/>
				<InputGroupAddon align="inline-end">
					<InputGroupButton
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="text-muted-foreground/50 hover:text-primary transition-colors focus:outline-none"
						aria-label={
							showPassword
								? t("auth.hide_password")
								: t("auth.show_password")
						}
					>
						{showPassword ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
		);
	},
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
