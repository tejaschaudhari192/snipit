import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react-native";
import * as React from "react";
import {
	TextInput,
	TextInputProps,
	TouchableOpacity,
	View,
} from "react-native";

export interface PasswordInputProps extends TextInputProps {
	id?: string;
	label?: string;
	error?: string;
	hasError?: boolean;
	containerClassName?: string;
	headerRight?: React.ReactNode;
}

export const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(
	function PasswordInput(
		{
			id = "password",
			label,
			error,
			hasError,
			containerClassName,
			className,
			headerRight,
			...props
		},
		ref,
	) {
		const [showPassword, setShowPassword] = React.useState(false);
		const isInvalid = Boolean(error || hasError);

		return (
			<View className={cn("gap-1.5", containerClassName)}>
				{(label || headerRight) && (
					<View className="flex-row items-center justify-between">
						{label ? <Label htmlFor={id}>{label}</Label> : <View />}
						{headerRight}
					</View>
				)}
				<View
					className={cn(
						"w-full flex-row items-center rounded-md pr-2 bg-background dark:bg-input/30 border",
						isInvalid
							? "border-destructive ring-1 ring-destructive/40"
							: "border-input",
					)}
				>
					<Input
						ref={ref}
						id={id}
						secureTextEntry={!showPassword}
						className={cn(
							"flex-1 border-0 shadow-none bg-transparent",
							className,
						)}
						{...props}
					/>
					<TouchableOpacity
						onPress={() => setShowPassword((prev) => !prev)}
						className="p-1.5 justify-center items-center"
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						accessibilityLabel={
							showPassword ? "Hide password" : "Show password"
						}
					>
						{showPassword ? (
							<Icon
								as={EyeOff}
								className="text-muted-foreground"
								size={18}
							/>
						) : (
							<Icon
								as={Eye}
								className="text-muted-foreground"
								size={18}
							/>
						)}
					</TouchableOpacity>
				</View>
				{error ? (
					<Label className="text-destructive text-xs">{error}</Label>
				) : null}
			</View>
		);
	},
);
