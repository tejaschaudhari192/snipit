import { cn } from '@/lib/utils';
import * as SeparatorPrimitive from '@rn-primitives/separator';
import { Platform, StyleSheet, View, useColorScheme } from 'react-native';
import { useUIStyle } from '@/core/UIStyleContext';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  style,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  const { uiStyle } = useUIStyle();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  if (uiStyle === 'native' && Platform.OS !== 'web') {
    return (
      <View
        style={[
          orientation === 'horizontal'
            ? {
                height: StyleSheet.hairlineWidth,
                width: '100%',
                backgroundColor: isDark ? '#38383A' : '#C6C6C8',
              }
            : {
                width: StyleSheet.hairlineWidth,
                height: '100%',
                backgroundColor: isDark ? '#38383A' : '#C6C6C8',
              },
          style,
        ]}
        className={className}
        {...props}
      />
    );
  }

  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      style={style}
      {...props}
    />
  );
}

export { Separator };
