import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";
import { AuthCardWrapper } from "./auth-card-wrapper";

export interface SignUpFormProps {
	email?: string;
	setEmail?: (val: string) => void;
	username?: string;
	setUsername?: (val: string) => void;
	password?: string;
	setPassword?: (val: string) => void;
	onSubmit?: () => void;
	loading?: boolean;
	error?: string;
	onNavigateToSignIn?: () => void;
}

export function SignUpForm({
	email = "",
	setEmail,
	username = "",
	setUsername,
	password = "",
	setPassword,
	onSubmit,
	loading = false,
	error,
	onNavigateToSignIn,
}: SignUpFormProps) {
	const passwordInputRef = React.useRef<any>(null);

	function onEmailSubmitEditing() {
		passwordInputRef.current?.focus();
	}

	return (
		<AuthCardWrapper
			title="Create your account"
			description="Welcome! Please fill in the details to get started."
			error={error}
			showSocial
			footer={
				onNavigateToSignIn
					? {
							prompt: "Already have an account?",
							actionText: "Sign in",
							onPress: onNavigateToSignIn,
						}
					: undefined
			}
		>
			{setUsername && (
				<View className="gap-1.5">
					<Label htmlFor="username">Username</Label>
					<Input
						id="username"
						placeholder="username"
						autoCapitalize="none"
						value={username}
						onChangeText={setUsername}
						returnKeyType="next"
					/>
				</View>
			)}

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
				/>
			</View>

			<PasswordInput
				ref={passwordInputRef}
				id="password"
				label="Password"
				placeholder="Create a password"
				returnKeyType="send"
				value={password}
				onChangeText={setPassword}
				onSubmitEditing={onSubmit}
			/>

			<Button className="w-full" disabled={loading} onPress={onSubmit}>
				<Text>{loading ? "Please wait..." : "Continue"}</Text>
			</Button>
		</AuthCardWrapper>
	);
}
