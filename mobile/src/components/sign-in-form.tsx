import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";
import { AuthCardWrapper } from "./auth-card-wrapper";

export interface SignInFormProps {
	email?: string;
	setEmail?: (val: string) => void;
	password?: string;
	setPassword?: (val: string) => void;
	onSubmit?: () => void;
	loading?: boolean;
	error?: string;
	onNavigateToSignUp?: () => void;
	onNavigateToForgotPassword?: () => void;
}

export function SignInForm({
	email = "",
	setEmail,
	password = "",
	setPassword,
	onSubmit,
	loading = false,
	error,
	onNavigateToSignUp,
	onNavigateToForgotPassword,
}: SignInFormProps) {
	const passwordInputRef = React.useRef<any>(null);

	function onEmailSubmitEditing() {
		passwordInputRef.current?.focus();
	}

	const hasCredentialError = Boolean(
		error &&
		(error.toLowerCase().includes("invalid") ||
			error.toLowerCase().includes("password") ||
			error.toLowerCase().includes("email") ||
			error.toLowerCase().includes("credentials")),
	);

	return (
		<AuthCardWrapper
			title="Sign in to your app"
			description="Welcome back! Please sign in to continue"
			error={error}
			showSocial
			footer={
				onNavigateToSignUp
					? {
							prompt: "Don't have an account?",
							actionText: "Sign up",
							onPress: onNavigateToSignUp,
						}
					: undefined
			}
		>
			<View className="gap-1.5">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					placeholder="m@example.com"
					keyboardType="email-address"
					autoComplete="email"
					autoCapitalize="none"
					value={email}
					onChangeText={setEmail}
					onSubmitEditing={onEmailSubmitEditing}
					returnKeyType="next"
					submitBehavior="submit"
					hasError={hasCredentialError}
				/>
			</View>

			<PasswordInput
				ref={passwordInputRef}
				id="password"
				label="Password"
				placeholder="Enter your password"
				returnKeyType="send"
				value={password}
				onChangeText={setPassword}
				onSubmitEditing={onSubmit}
				hasError={hasCredentialError}
				headerRight={
					onNavigateToForgotPassword ? (
						<Button
							variant="link"
							size="sm"
							className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
							onPress={onNavigateToForgotPassword}
						>
							<Text className="font-normal leading-4">
								Forgot your password?
							</Text>
						</Button>
					) : null
				}
			/>

			<Button className="w-full" disabled={loading} onPress={onSubmit}>
				<Text>{loading ? "Please wait..." : "Continue"}</Text>
			</Button>
		</AuthCardWrapper>
	);
}
