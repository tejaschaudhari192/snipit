import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { AuthCardWrapper } from "./auth";

export interface ForgotPasswordFormProps {
	email?: string;
	setEmail?: (val: string) => void;
	onSubmit?: () => void;
	loading?: boolean;
	error?: string;
	onNavigateToSignIn?: () => void;
}

export function ForgotPasswordForm({
	email = "",
	setEmail,
	onSubmit,
	loading = false,
	error,
	onNavigateToSignIn,
}: ForgotPasswordFormProps) {
	return (
		<AuthCardWrapper
			title="Forgot password?"
			description="Enter your email to reset your password"
			error={error}
			showSocial={false}
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
					returnKeyType="send"
					onSubmitEditing={onSubmit}
				/>
			</View>

			<Button className="w-full" disabled={loading} onPress={onSubmit}>
				<Text>
					{loading ? "Please wait..." : "Reset your password"}
				</Text>
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
