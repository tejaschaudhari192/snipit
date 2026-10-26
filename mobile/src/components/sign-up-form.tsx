import { SocialConnections } from '@/components/social-connections';
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
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';

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
  email = '',
  setEmail,
  username = '',
  setUsername,
  password = '',
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

  function handleSubmit() {
    onSubmit?.();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Create your account</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome! Please fill in the details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            {error ? (
              <Text className="text-destructive text-center text-xs">{error}</Text>
            ) : null}
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
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                returnKeyType="send"
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleSubmit}
              />
            </View>
            <Button className="w-full" disabled={loading} onPress={handleSubmit}>
              <Text>{loading ? 'Please wait...' : 'Continue'}</Text>
            </Button>
          </View>
          <Text className="text-center text-sm">
            Already have an account?{' '}
            <Pressable onPress={onNavigateToSignIn}>
              <Text className="text-sm underline underline-offset-4">Sign in</Text>
            </Pressable>
          </Text>
          <View className="flex-row items-center">
            <Separator className="flex-1" />
            <Text className="text-muted-foreground px-4 text-sm">or</Text>
            <Separator className="flex-1" />
          </View>
          <SocialConnections />
        </CardContent>
      </Card>
    </View>
  );
}
