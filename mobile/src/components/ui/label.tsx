import { cn } from '@/lib/utils';
import * as LabelPrimitive from '@rn-primitives/label';
import { Platform, Text as RNText, useColorScheme } from 'react-native';
import { useUIStyle } from '@/core/UIStyleContext';

function Label({
  className,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  disabled,
  style,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Text>) {
  const { uiStyle } = useUIStyle();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  if (uiStyle === 'native' && Platform.OS !== 'web') {
    return (
      <RNText
        style={[
          {
            fontSize: 13,
            fontWeight: '600',
            color: isDark ? '#8E8E93' : '#6C6C70',
            marginBottom: 4,
          },
          style,
        ]}
        className={className}
        {...props}
      />
    );
  }

  return (
    <LabelPrimitive.Root
      className={cn(
        'flex select-none flex-row items-center gap-2',
        Platform.select({
          web: 'cursor-default leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        }),
        disabled && 'opacity-50'
      )}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}>
      <LabelPrimitive.Text
        className={cn(
          'text-foreground text-sm font-medium',
          Platform.select({ web: 'leading-none' }),
          className
        )}
        style={style}
        {...props}
      />
    </LabelPrimitive.Root>
  );
}

export { Label };
