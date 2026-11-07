import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { View } from "react-native";
import { AuthCardWrapper } from "./auth";

export interface ResetPasswordFormProps {
	onSubmit?: () => void;
	loading?: boolean;
	error?: string;
	onNavigateToSignIn?: () => void;
}

export function ResetPasswordForm({
	onSubmit,
	loading = false,
	error,
	onNavigateToSignIn,
}: ResetPasswordFormProps) {
	const codeInputRef = React.useRef<any>(null);

	function onPasswordSubmitEditing() {
		codeInputRef.current?.focus();
	}

	return (
		<AuthCardWrapper
			title="Reset password"
			description="Enter the code sent to your email and set a new password"
			error={error}
			showSocial={false}
		>
			<PasswordInput
				id="password"
				label="New password"
				placeholder="Enter new password"
				returnKeyType="next"
				submitBehavior="submit"
				onSubmitEditing={onPasswordSubmitEditing}
			/>

			<View className="gap-1.5">
				<Label htmlFor="code">Verification code</Label>
				<Input
					ref={codeInputRef}
					id="code"
					autoCapitalize="none"
					returnKeyType="send"
					keyboardType="numeric"
					autoComplete="sms-otp"
					textContentType="oneTimeCode"
					onSubmitEditing={onSubmit}
				/>
			</View>

			<Button className="w-full" disabled={loading} onPress={onSubmit}>
				<Text>{loading ? "Please wait..." : "Reset Password"}</Text>
			</Button>

			{onNavigateToSignIn ? (
				<Button variant="ghost" size="sm" onPress={onNavigateToSignIn}>
					<Text className="text-center text-sm underline underline-offset-4">
						Back to sign in
					</Text>
				</Button>
			) : null}
		</AuthCardWrapper>
	);
}
