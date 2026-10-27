import * as React from 'react';
import { cn } from '@/lib/utils';
import { Platform, TextInput, View } from 'react-native';

import { Host, TextInput as NativeTextInput } from '@expo/ui';
import { useUIStyle } from '@/core/UIStyleContext';

const Input = React.forwardRef<any, React.ComponentPropsWithoutRef<typeof TextInput>>(
  ({ className, ...props }, ref) => {
    const { uiStyle } = useUIStyle();

    if (uiStyle === 'native' && Platform.OS !== 'web') {
      const isFlex = className?.includes('flex-1');
      return (
        <View className={cn(isFlex ? 'flex-1' : 'w-full')} style={{ height: 44 }}>
          <Host style={{ width: '100%', height: 44 }}>
            <NativeTextInput
              defaultValue={props.value ?? props.defaultValue}
              onChangeText={props.onChangeText}
              placeholder={props.placeholder}
              placeholderTextColor={props.placeholderTextColor}
              editable={props.editable}
              secureTextEntry={props.secureTextEntry}
              keyboardType={props.keyboardType}
              autoCapitalize={props.autoCapitalize}
              autoCorrect={props.autoCorrect}
              returnKeyType={props.returnKeyType}
              onSubmitEditing={props.onSubmitEditing ? () => props.onSubmitEditing?.({} as any) : undefined}
              autoFocus={props.autoFocus}
              multiline={props.multiline}
              numberOfLines={props.numberOfLines}
              maxLength={props.maxLength}
              style={{ width: '100%', height: 44, borderRadius: 8 }}
            />
          </Host>
        </View>
      );
    }

    return (
      <TextInput
        ref={ref}
        className={cn(
          'dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
          props.editable === false &&
            cn(
              'opacity-50',
              Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
            ),
          Platform.select({
            web: cn(
              'placeholder:text-muted-foreground selection:bg-primary outline-none transition-[color,box-shadow] md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
            ),
            native: 'placeholder:text-muted-foreground/50',
          }),
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
