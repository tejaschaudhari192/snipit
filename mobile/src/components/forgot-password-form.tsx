import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export interface ForgotPasswordFormProps {
  email?: string;
  setEmail?: (val: string) => void;
  onSubmit?: () => void;
  loading?: boolean;
  error?: string;
  onNavigateToSignIn?: () => void;
}

export function ForgotPasswordForm({
  email = '',
  setEmail,
  onSubmit,
  loading = false,
  error,
  onNavigateToSignIn,
}: ForgotPasswordFormProps) {
  function handleSubmit() {
    onSubmit?.();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Forgot password?</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            {error ? (
              <Text className="text-destructive text-center text-xs">{error}</Text>
            ) : null}
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
                onSubmitEditing={handleSubmit}
              />
            </View>
            <Button className="w-full" disabled={loading} onPress={handleSubmit}>
              <Text>{loading ? 'Please wait...' : 'Reset your password'}</Text>
            </Button>
          </View>
          {onNavigateToSignIn && (
            <Button variant="ghost" size="sm" onPress={onNavigateToSignIn}>
              <Text className="text-center text-sm underline underline-offset-4">
                Back to sign in
              </Text>
            </Button>
          )}
        </CardContent>
      </Card>
    </View>
  );
}
